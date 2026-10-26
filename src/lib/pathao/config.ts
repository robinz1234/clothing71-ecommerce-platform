import "server-only";
import { z } from "zod";

const pathaoConfigSchema = z.object({
  PATHAO_ENVIRONMENT: z.enum(["sandbox", "production"]),
  PATHAO_BASE_URL: z.string().url().refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "" &&
      (url.hostname === "courier-api-sandbox.pathao.com" ||
        url.hostname === "api-hermes.pathao.com")
    );
  }),
  PATHAO_CLIENT_ID: z.string().trim().min(1),
  PATHAO_CLIENT_SECRET: z.string().min(1),
  PATHAO_USERNAME: z.string().trim().min(1),
  PATHAO_PASSWORD: z.string().min(1),
  PATHAO_STORE_ID: z.string().trim().regex(/^[1-9]\d*$/),
  PATHAO_WEBHOOK_SECRET: z.string().min(1),
  PATHAO_ENABLE_PRODUCTION_BOOKING: z.enum(["true", "false"]).default("false"),
}).superRefine((value, context) => {
  const expectedHost =
    value.PATHAO_ENVIRONMENT === "sandbox"
      ? "courier-api-sandbox.pathao.com"
      : "api-hermes.pathao.com";
  let actualHost: string | null = null;
  try {
    actualHost = new URL(value.PATHAO_BASE_URL).hostname;
  } catch {
    actualHost = null;
  }
  if (actualHost !== expectedHost) {
    context.addIssue({
      code: "custom",
      path: ["PATHAO_BASE_URL"],
      message: "The base URL must match the selected Pathao environment.",
    });
  }
});

export class PathaoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathaoConfigurationError";
  }
}

export type PathaoConfig = {
  environment: "sandbox" | "production";
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId: string;
  webhookSecret: string;
  productionBookingEnabled: boolean;
};

export function getPathaoConfig(): PathaoConfig {
  const parsed = pathaoConfigSchema.safeParse({
    PATHAO_ENVIRONMENT: process.env.PATHAO_ENVIRONMENT,
    PATHAO_BASE_URL: process.env.PATHAO_BASE_URL,
    PATHAO_CLIENT_ID: process.env.PATHAO_CLIENT_ID,
    PATHAO_CLIENT_SECRET: process.env.PATHAO_CLIENT_SECRET,
    PATHAO_USERNAME: process.env.PATHAO_USERNAME,
    PATHAO_PASSWORD: process.env.PATHAO_PASSWORD,
    PATHAO_STORE_ID: process.env.PATHAO_STORE_ID,
    PATHAO_WEBHOOK_SECRET: process.env.PATHAO_WEBHOOK_SECRET,
    PATHAO_ENABLE_PRODUCTION_BOOKING:
      process.env.PATHAO_ENABLE_PRODUCTION_BOOKING ?? "false",
  });

  if (!parsed.success) {
    const invalidVariables = [...new Set(parsed.error.issues.map((issue) => issue.path[0]))];
    throw new PathaoConfigurationError(
      `Pathao server configuration is missing or invalid: ${invalidVariables.join(", ")}`,
    );
  }

  return {
    environment: parsed.data.PATHAO_ENVIRONMENT,
    baseUrl: parsed.data.PATHAO_BASE_URL.replace(/\/+$/, ""),
    clientId: parsed.data.PATHAO_CLIENT_ID,
    clientSecret: parsed.data.PATHAO_CLIENT_SECRET,
    username: parsed.data.PATHAO_USERNAME,
    password: parsed.data.PATHAO_PASSWORD,
    storeId: parsed.data.PATHAO_STORE_ID,
    webhookSecret: parsed.data.PATHAO_WEBHOOK_SECRET,
    productionBookingEnabled:
      parsed.data.PATHAO_ENABLE_PRODUCTION_BOOKING === "true",
  };
}

export function getPathaoWebhookSecret(): string {
  const parsed = z
    .string()
    .min(1)
    .refine((value) => !value.includes("\r") && !value.includes("\n"))
    .safeParse(process.env.PATHAO_WEBHOOK_SECRET);

  if (!parsed.success) {
    throw new PathaoConfigurationError("Pathao webhook configuration is missing or invalid: PATHAO_WEBHOOK_SECRET");
  }

  return parsed.data;
}
