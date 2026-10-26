import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPathaoAdminContext,
  normalizeBangladeshPhone,
  pathaoErrorResponse,
} from "@/lib/pathao/admin";
import { PathaoApiError, getPathaoClient } from "@/lib/pathao/client";
import { getPathaoConfig } from "@/lib/pathao/config";

const requestSchema = z.strictObject({
  storeId: z.number().int().positive().safe(),
  cityId: z.number().int().positive().safe(),
  zoneId: z.number().int().positive().safe(),
  areaId: z.number().int().positive().safe(),
  recipientName: z.string().trim().min(3).max(100),
  recipientPhone: z.string().trim().min(6).max(30),
  recipientAddress: z.string().trim().min(10).max(220),
  weightKg: z.number().finite().min(0.5).max(10),
  specialInstruction: z.string().trim().max(500).nullable(),
});

const bookingDataSchema = z.object({
  shipmentId: z.string().uuid(),
  orderNumber: z.string().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(1),
  recipientAddress: z.string().min(1),
  amountToCollect: z.number().int().nonnegative(),
  itemQuantity: z.number().int().positive(),
});

const idSchema = z.string().uuid();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getPathaoAdminContext();
  if ("response" in context) return context.response;
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ message: "Invalid order identifier." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Booking details are incomplete or invalid." }, { status: 400 });
  }
  const phone = normalizeBangladeshPhone(parsed.data.recipientPhone);
  if (!phone) {
    return NextResponse.json({ message: "Enter a valid Bangladesh mobile number." }, { status: 400 });
  }

  let attemptId: string | null = null;
  try {
    const config = getPathaoConfig();
    if (config.environment === "production" && !config.productionBookingEnabled) {
      return NextResponse.json(
        { message: "Production Pathao booking is disabled until separately approved." },
        { status: 503 },
      );
    }
    const client = getPathaoClient(config);
    const [stores, cities] = await Promise.all([
      client.getStores(),
      client.getCities(),
    ]);
    const store = stores.find((entry) => entry.id === parsed.data.storeId);
    const city = cities.find((entry) => entry.id === parsed.data.cityId);
    if (!store || !city) {
      throw new PathaoApiError("Select a valid Pathao pickup store and city.", "validation");
    }
    const zones = await client.getZones(city.id);
    const zone = zones.find((entry) => entry.id === parsed.data.zoneId);
    if (!zone) {
      throw new PathaoApiError("The selected Pathao zone does not belong to this city.", "validation");
    }
    const areas = await client.getAreas(zone.id);
    const area = areas.find((entry) => entry.id === parsed.data.areaId);
    if (!area || !area.homeDeliveryAvailable) {
      throw new PathaoApiError("Pathao does not offer home delivery to the selected area.", "validation");
    }
    const estimate = await client.estimatePrice({
      storeId: store.id,
      cityId: city.id,
      zoneId: zone.id,
      weightKg: parsed.data.weightKg,
    });

    attemptId = randomUUID();
    let bookingData: unknown;
    try {
      const { data, error: beginError } = await context.supabase.rpc(
        "admin_begin_pathao_booking",
        {
          p_order_id: id,
          p_attempt_id: attemptId,
          p_store_id: store.id,
          p_city_id: city.id,
          p_city_name: city.name,
          p_zone_id: zone.id,
          p_zone_name: zone.name,
          p_area_id: area.id,
          p_area_name: area.name,
          p_parcel_weight_kg: parsed.data.weightKg,
          p_estimated_courier_fee: estimate.price,
          p_recipient_name: parsed.data.recipientName,
          p_recipient_phone: phone,
          p_recipient_address: parsed.data.recipientAddress,
          p_special_instruction: parsed.data.specialInstruction,
        },
      );
      if (beginError) {
        if (beginError.message.includes("ADMIN_REQUIRED")) {
          return NextResponse.json({ message: "You do not have permission to book this order." }, { status: 403 });
        }
        if (beginError.message.includes("PATHAO_RECONCILIATION_REQUIRED")) {
          return NextResponse.json({ message: "This order already has a Pathao booking or unresolved attempt." }, { status: 409 });
        }
        if (beginError.message.includes("PATHAO_ORDER_NOT_ELIGIBLE")) {
          return NextResponse.json({ message: "Only confirmed or processing COD orders can be booked." }, { status: 409 });
        }
        if (beginError.message.includes("PATHAO_EXISTING_FULFILLMENT")) {
          return NextResponse.json({ message: "Resolve the existing courier fulfillment before booking Pathao." }, { status: 409 });
        }
        return NextResponse.json({ message: "Unable to reserve this order for Pathao booking." }, { status: 422 });
      }
      bookingData = data;
    } catch {
      return NextResponse.json(
        {
          message: "The order reservation result could not be confirmed. Pathao was not sent a booking request.",
          refreshRequired: true,
        },
        { status: 502 },
      );
    }

    const booking = bookingDataSchema.safeParse(bookingData);
    if (!booking.success) {
      let reservationReleased = false;
      try {
        const { error: finishError } = await context.supabase.rpc(
          "admin_finish_pathao_booking",
          {
            p_attempt_id: attemptId,
            p_outcome: "failed",
            p_error_category: "invalid_response",
          },
        );
        reservationReleased = !finishError;
      } catch {
        reservationReleased = false;
      }
      return NextResponse.json(
        {
          message: reservationReleased
            ? "The order was not sent to Pathao because its booking reservation was invalid."
            : "The order was not sent to Pathao, but its local booking reservation needs reconciliation.",
          refreshRequired: true,
        },
        { status: 500 },
      );
    }

    let created: Awaited<ReturnType<typeof client.createOrder>>;
    try {
      created = await client.createOrder({
        storeId: store.id,
        merchantOrderId: booking.data.orderNumber,
        recipientName: booking.data.recipientName,
        recipientPhone: booking.data.recipientPhone,
        recipientAddress: booking.data.recipientAddress,
        cityId: city.id,
        zoneId: zone.id,
        areaId: area.id,
        quantity: booking.data.itemQuantity,
        weightKg: parsed.data.weightKg,
        amountToCollect: booking.data.amountToCollect,
        specialInstruction: parsed.data.specialInstruction,
      });
    } catch (error) {
      const pathaoError = error instanceof PathaoApiError ? error : null;
      const outcomeUnknown = pathaoError?.outcomeUnknown ?? true;
      let reservationFinished = false;
      try {
        const { error: finishError } = await context.supabase.rpc(
          "admin_finish_pathao_booking",
          {
            p_attempt_id: attemptId,
            p_outcome: outcomeUnknown ? "unknown" : "failed",
            p_error_category: pathaoError?.category ?? "unknown",
          },
        );
        reservationFinished = !finishError;
      } catch {
        reservationFinished = false;
      }
      if (!reservationFinished) {
        return NextResponse.json(
          { message: "The booking attempt needs reconciliation before retrying.", outcomeUnknown: true },
          { status: 502 },
        );
      }
      return NextResponse.json(
        {
          message: pathaoError?.message ??
            "The Pathao booking response could not be confirmed. Reconciliation is required before retrying.",
          outcomeUnknown,
        },
        { status: outcomeUnknown ? 502 : 422 },
      );
    }

    let bookingSaved = false;
    try {
      const { error: finishError } = await context.supabase.rpc(
        "admin_finish_pathao_booking",
        {
          p_attempt_id: attemptId,
          p_outcome: "booked",
          p_consignment_id: created.consignmentId,
          p_courier_status: created.status,
          p_actual_courier_fee: created.deliveryFee,
        },
      );
      bookingSaved = !finishError;
    } catch {
      bookingSaved = false;
    }
    if (!bookingSaved) {
      return NextResponse.json(
        { message: "Pathao accepted the booking, but its local record needs reconciliation before further action.", outcomeUnknown: true },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      consignmentId: created.consignmentId,
      courierStatus: created.status,
      estimatedCourierFee: estimate.price,
      actualCourierFee: created.deliveryFee,
      amountToCollect: booking.data.amountToCollect,
    });
  } catch (error) {
    return pathaoErrorResponse(error);
  }
}
