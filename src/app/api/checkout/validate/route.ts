import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCheckoutCart } from "@/lib/checkout/validation";

const requestSchema = z.object({
  lines: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int(),
    }),
  ),
  deliveryZone: z.enum(["DHAKA", "SUB_AREA", "OUTSIDE_DHAKA"]),
  promoCode: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, lines: [], message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, lines: [], message: "Please review your checkout details and try again." },
      { status: 400 },
    );
  }
  const result = await validateCheckoutCart(
    parsed.data.lines,
    parsed.data.deliveryZone,
    parsed.data.promoCode,
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
