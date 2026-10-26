import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPathaoWebhookSecret, PathaoConfigurationError } from "@/lib/pathao/config";

const challengeSchema = z.strictObject({
  event: z.literal("webhook_integration"),
});

const eventSchema = z.object({
  event: z.string().min(1),
}).passthrough();

function hasValidSignature(signature: string | null, secret: string) {
  if (!signature) return false;
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedEvent = eventSchema.safeParse(payload);
  if (!parsedEvent.success) {
    return NextResponse.json({ message: "Invalid Pathao webhook event." }, { status: 400 });
  }

  const isChallenge = challengeSchema.safeParse(payload).success;

  let webhookSecret: string;
  try {
    webhookSecret = getPathaoWebhookSecret();
  } catch (error) {
    if (error instanceof PathaoConfigurationError) {
      return NextResponse.json({ message: "Pathao webhook verification is not configured." }, { status: 503 });
    }
    throw error;
  }

  if (isChallenge) {
    return new Response(null, {
      status: 202,
      headers: {
        "X-Pathao-Merchant-Webhook-Integration-Secret": webhookSecret,
      },
    });
  }

  if (!hasValidSignature(request.headers.get("X-Pathao-Signature"), webhookSecret)) {
    return NextResponse.json({ message: "Unauthorized Pathao webhook event." }, { status: 401 });
  }

  return NextResponse.json(
    { message: "Pathao delivery event processing is not enabled until its official contract is verified." },
    { status: 503 },
  );
}
