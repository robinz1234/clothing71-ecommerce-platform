import { NextResponse } from "next/server";
import { z } from "zod";
import { getPathaoAdminContext, pathaoErrorResponse } from "@/lib/pathao/admin";
import { getPathaoClient, PathaoApiError } from "@/lib/pathao/client";
import { getPathaoConfig, PathaoConfigurationError } from "@/lib/pathao/config";

const idSchema = z.string().uuid();

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getPathaoAdminContext();
  if ("response" in context) return context.response;
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ message: "Invalid order identifier." }, { status: 400 });
  }

  try {
    const { data: shipment, error: shipmentError } = await context.supabase
      .from("pathao_shipments")
      .select("consignment_id, merchant_order_reference, booking_status")
      .eq("order_id", id)
      .maybeSingle();
    if (shipmentError) throw new Error("Unable to load the shipment record.");
    if (!shipment || shipment.booking_status !== "booked" || !shipment.consignment_id) {
      return NextResponse.json({ message: "This order has no confirmed Pathao consignment." }, { status: 409 });
    }
    const client = getPathaoClient(getPathaoConfig());
    const info = await client.getOrderInfo(shipment.consignment_id);
    if (info.consignmentId !== shipment.consignment_id) {
      return NextResponse.json({ message: "Pathao returned a different consignment identifier." }, { status: 502 });
    }
    if (
      info.merchantOrderId !== null &&
      info.merchantOrderId !== shipment.merchant_order_reference
    ) {
      return NextResponse.json({ message: "Pathao shipment reference does not match this Clothing71 order." }, { status: 502 });
    }

    let reportedAt: string | null = null;
    if (info.updatedAt) {
      const parsedDate = new Date(info.updatedAt);
      if (!Number.isFinite(parsedDate.getTime())) {
        return NextResponse.json({ message: "Pathao returned an invalid shipment timestamp." }, { status: 502 });
      }
      reportedAt = parsedDate.toISOString();
    }

    const { error: syncError } = await context.supabase.rpc(
      "admin_sync_pathao_shipment",
      {
        p_order_id: id,
        p_consignment_id: info.consignmentId,
        p_courier_status: info.status,
        p_reported_at: reportedAt,
        p_actual_courier_fee: info.deliveryFee,
      },
    );
    if (syncError) {
      if (syncError.message.includes("ADMIN_REQUIRED")) {
        return NextResponse.json({ message: "You do not have permission to refresh this shipment." }, { status: 403 });
      }
      return NextResponse.json({ message: "Unable to save the verified Pathao status." }, { status: 422 });
    }
    return NextResponse.json({
      ok: true,
      courierStatus: info.status,
      updatedAt: reportedAt,
      lastSyncAt: new Date().toISOString(),
    });
  } catch (error) {
    if (!(error instanceof PathaoApiError || error instanceof PathaoConfigurationError)) {
      throw error;
    }
    return pathaoErrorResponse(error);
  }
}
