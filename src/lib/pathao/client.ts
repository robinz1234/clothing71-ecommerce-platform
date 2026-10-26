import "server-only";

import { z } from "zod";
import type { PathaoConfig } from "./config";

const tokenSchema = z.object({
  token_type: z.string().default("Bearer"),
  expires_in: z.coerce.number().int().positive(),
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
});

const idSchema = z.union([
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
]);

const storeSchema = z.object({
  store_id: idSchema.optional(),
  id: idSchema.optional(),
  store_name: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  is_default: z.boolean().optional(),
}).transform((store, context) => {
  const id = store.store_id ?? store.id;
  const name = store.store_name ?? store.name;
  if (id === undefined || name === undefined) {
    context.addIssue({
      code: "custom",
      message: "Store response omitted its identifier or name.",
    });
    return z.NEVER;
  }
  return { id, name, isDefault: store.is_default ?? false };
});

const citySchema = z.object({
  city_id: idSchema,
  city_name: z.string().trim().min(1),
}).transform((city) => ({ id: city.city_id, name: city.city_name }));

const zoneSchema = z.object({
  zone_id: idSchema,
  zone_name: z.string().trim().min(1),
}).transform((zone) => ({ id: zone.zone_id, name: zone.zone_name }));

const areaSchema = z.object({
  area_id: idSchema,
  area_name: z.string().trim().min(1),
  home_delivery_available: z.boolean(),
  pickup_available: z.boolean().optional(),
}).transform((area) => ({
  id: area.area_id,
  name: area.area_name,
  homeDeliveryAvailable: area.home_delivery_available,
  pickupAvailable: area.pickup_available ?? true,
}));

const envelopeSchema = z.object({
  data: z.unknown(),
}).passthrough();

export type PathaoStore = z.infer<typeof storeSchema>;
export type PathaoCity = z.infer<typeof citySchema>;
export type PathaoZone = z.infer<typeof zoneSchema>;
export type PathaoArea = z.infer<typeof areaSchema>;

export type PathaoPriceEstimate = {
  price: number;
  discount: number;
  promoDiscount: number;
};

export type PathaoOrderRequest = {
  storeId: number;
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  cityId: number;
  zoneId: number;
  areaId: number;
  quantity: number;
  weightKg: number;
  amountToCollect: number;
  specialInstruction: string | null;
};

export type PathaoOrderInfo = {
  consignmentId: string;
  merchantOrderId: string | null;
  status: string;
  updatedAt: string | null;
  deliveryFee: number | null;
};

export class PathaoApiError extends Error {
  readonly category:
    | "configuration"
    | "authentication"
    | "permission"
    | "not_found"
    | "validation"
    | "rate_limit"
    | "service"
    | "network"
    | "invalid_response"
    | "unknown";
  readonly status: number | null;
  readonly outcomeUnknown: boolean;

  constructor(
    message: string,
    category: PathaoApiError["category"],
    status: number | null = null,
    outcomeUnknown = false,
  ) {
    super(message);
    this.name = "PathaoApiError";
    this.category = category;
    this.status = status;
    this.outcomeUnknown = outcomeUnknown;
  }
}

type Fetch = typeof fetch;
type AccessToken = {
  value: string;
  refreshToken: string | null;
  expiresAt: number;
};

function listData(payload: unknown): unknown[] {
  const outer = envelopeSchema.safeParse(payload);
  if (!outer.success) throw invalidResponse();
  let data: unknown = outer.data.data;
  if (typeof data === "object" && data !== null && "data" in data) {
    data = (data as { data: unknown }).data;
  }
  if (!Array.isArray(data)) throw invalidResponse();
  return data;
}

function invalidResponse(
  unknownOutcome = false,
  status: number | null = null,
): PathaoApiError {
  return new PathaoApiError(
    "Pathao returned an unexpected response. Verify the shipment status before retrying.",
    "invalid_response",
    status,
    unknownOutcome,
  );
}

function errorCategory(status: number): PathaoApiError["category"] {
  if (status === 401) return "authentication";
  if (status === 403) return "permission";
  if (status === 404) return "not_found";
  if (status === 400 || status === 422) return "validation";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "service";
  return "unknown";
}

function errorMessage(status: number): string {
  if (status === 401) return "Pathao authorization failed.";
  if (status === 403) return "The Pathao account does not have permission for this request.";
  if (status === 404) return "The requested Pathao record was not found.";
  if (status === 400 || status === 422) return "Pathao rejected the request. Check the booking details and service coverage.";
  if (status === 429) return "Pathao rate limit reached. Wait before requesting this operation again.";
  if (status >= 500) return "Pathao is temporarily unavailable.";
  return "Pathao could not complete the request.";
}

export class PathaoClient {
  private token: AccessToken | null = null;
  private tokenRequest: Promise<AccessToken> | null = null;

  constructor(
    private readonly config: PathaoConfig,
    private readonly fetcher: Fetch = fetch,
    private readonly now: () => number = Date.now,
    private readonly timeoutMs = 12_000,
  ) {}

  async getStores(): Promise<PathaoStore[]> {
    return this.getList("/aladdin/api/v1/stores", storeSchema);
  }

  async getCities(): Promise<PathaoCity[]> {
    return this.getList("/aladdin/api/v1/city-list", citySchema);
  }

  async getZones(cityId: number): Promise<PathaoZone[]> {
    return this.getList(`/aladdin/api/v1/cities/${positiveId(cityId)}/zone-list`, zoneSchema);
  }

  async getAreas(zoneId: number): Promise<PathaoArea[]> {
    return this.getList(`/aladdin/api/v1/zones/${positiveId(zoneId)}/area-list`, areaSchema);
  }

  async estimatePrice(input: {
    storeId: number;
    cityId: number;
    zoneId: number;
    weightKg: number;
  }): Promise<PathaoPriceEstimate> {
    if (input.weightKg < 0.5 || input.weightKg > 10) {
      throw new PathaoApiError("Parcel weight must be between 0.5 and 10 kg.", "validation");
    }
    const payload = await this.request(
      "/aladdin/api/v1/merchant/price-plan",
      "POST",
      {
        store_id: positiveId(input.storeId),
        item_type: 2,
        delivery_type: 48,
        item_weight: input.weightKg,
        recipient_city: positiveId(input.cityId),
        recipient_zone: positiveId(input.zoneId),
      },
    );
    const data = envelopeSchema.safeParse(payload);
    if (!data.success || typeof data.data.data !== "object" || data.data.data === null) {
      throw invalidResponse();
    }
    const estimate = z.object({
      price: z.coerce.number().finite().nonnegative(),
      discount: z.coerce.number().finite().nonnegative().default(0),
      promo_discount: z.coerce.number().finite().nonnegative().default(0),
    }).safeParse(data.data.data);
    if (!estimate.success) throw invalidResponse();
    return {
      price: estimate.data.price,
      discount: estimate.data.discount,
      promoDiscount: estimate.data.promo_discount,
    };
  }

  async createOrder(input: PathaoOrderRequest): Promise<{
    consignmentId: string;
    merchantOrderId: string | null;
    status: string;
    deliveryFee: number | null;
  }> {
    if (
      this.config.environment === "production" &&
      !this.config.productionBookingEnabled
    ) {
      throw new PathaoApiError(
        "Production Pathao booking is disabled until explicitly approved.",
        "configuration",
      );
    }
    const payload = {
      store_id: positiveId(input.storeId),
      merchant_order_id: input.merchantOrderId,
      recipient_name: input.recipientName,
      recipient_phone: input.recipientPhone,
      recipient_address: input.recipientAddress,
      recipient_city: positiveId(input.cityId),
      recipient_zone: positiveId(input.zoneId),
      recipient_area: positiveId(input.areaId),
      delivery_type: 48,
      item_type: 2,
      special_instruction: input.specialInstruction ?? "",
      item_quantity: input.quantity,
      item_weight: input.weightKg,
      item_description: "Clothing item",
      amount_to_collect: input.amountToCollect,
    };
    const result = await this.request(
      "/aladdin/api/v1/orders",
      "POST",
      payload,
      true,
    );
    const envelope = envelopeSchema.safeParse(result);
    if (!envelope.success || typeof envelope.data.data !== "object" || envelope.data.data === null) {
      throw invalidResponse(true);
    }
    const created = z.object({
      consignment_id: z.string().trim().min(1),
      merchant_order_id: z.string().trim().min(1).nullable().optional(),
      order_status: z.string().trim().min(1).optional(),
      delivery_fee: z.coerce.number().finite().nonnegative().nullable().optional(),
    }).safeParse(envelope.data.data);
    if (!created.success) throw invalidResponse(true);
    return {
      consignmentId: created.data.consignment_id,
      merchantOrderId: created.data.merchant_order_id ?? null,
      status: created.data.order_status ?? "Pending",
      deliveryFee: created.data.delivery_fee ?? null,
    };
  }

  async getOrderInfo(consignmentId: string): Promise<PathaoOrderInfo> {
    const encodedId = encodeURIComponent(consignmentId.trim());
    const payload = await this.request(
      `/aladdin/api/v1/orders/${encodedId}/info`,
      "GET",
    );
    const envelope = envelopeSchema.safeParse(payload);
    if (!envelope.success || typeof envelope.data.data !== "object" || envelope.data.data === null) {
      throw invalidResponse();
    }
    const info = z.object({
      consignment_id: z.string().trim().min(1),
      merchant_order_id: z.string().trim().min(1).nullable().optional(),
      order_status_slug: z.string().trim().min(1).optional(),
      order_status: z.string().trim().min(1).optional(),
      updated_at: z.string().trim().min(1).nullable().optional(),
      delivery_fee: z.coerce.number().finite().nonnegative().nullable().optional(),
    }).safeParse(envelope.data.data);
    if (!info.success) throw invalidResponse();
    return {
      consignmentId: info.data.consignment_id,
      merchantOrderId: info.data.merchant_order_id ?? null,
      status: info.data.order_status_slug ?? info.data.order_status ?? "Unknown",
      updatedAt: info.data.updated_at ?? null,
      deliveryFee: info.data.delivery_fee ?? null,
    };
  }

  private async getList<T>(
    path: string,
    schema: z.ZodType<T>,
  ): Promise<T[]> {
    const payload = await this.request(path, "GET");
    const values = listData(payload);
    const parsed = z.array(schema).safeParse(values);
    if (!parsed.success) throw invalidResponse();
    return parsed.data;
  }

  private async request(
    path: string,
    method: "GET" | "POST",
    body?: unknown,
    createOrder = false,
  ): Promise<unknown> {
    const token = await this.getToken();
    let response: Response;
    try {
      response = await this.fetcher(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.value}`,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        redirect: "error",
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new PathaoApiError(
        createOrder
          ? "Pathao booking response was not received. Reconciliation is required before any retry."
          : "Unable to reach Pathao. Try again later.",
        "network",
        null,
        createOrder,
      );
    }

    let responseText: string;
    try {
      responseText = await response.text();
    } catch {
      throw new PathaoApiError(
        createOrder
          ? "Pathao booking response was interrupted. Reconciliation is required before any retry."
          : "Pathao returned an incomplete response.",
        createOrder ? "network" : "invalid_response",
        response.status,
        createOrder,
      );
    }
    let payload: unknown;
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch {
      throw invalidResponse(
        createOrder &&
          (response.ok ||
            response.status === 408 ||
            response.status === 409 ||
            response.status === 429 ||
            response.status >= 500),
        response.status,
      );
    }

    if (!response.ok) {
      const category = errorCategory(response.status);
      const outcomeUnknown =
        createOrder &&
        (response.status === 408 ||
          response.status === 409 ||
          response.status === 429 ||
          response.status >= 500);
      throw new PathaoApiError(
        outcomeUnknown && createOrder
          ? "Pathao booking outcome is unknown. Reconciliation is required before any retry."
          : errorMessage(response.status),
        category,
        response.status,
        outcomeUnknown,
      );
    }

    if (response.status === 202 && createOrder) {
      throw new PathaoApiError(
        "Pathao accepted the booking request without returning a consignment ID. Reconciliation is required.",
        "invalid_response",
        response.status,
        true,
      );
    }
    return payload;
  }

  private async getToken(forceRefresh = false): Promise<AccessToken> {
    if (
      !forceRefresh &&
      this.token &&
      this.token.expiresAt > this.now() + 30_000
    ) {
      return this.token;
    }
    if (this.tokenRequest) return this.tokenRequest;

    this.tokenRequest = this.issueToken()
      .then((token) => {
        this.token = token;
        return token;
      })
      .finally(() => {
        this.tokenRequest = null;
      });
    return this.tokenRequest;
  }

  private async issueToken(): Promise<AccessToken> {
    const previous = this.token;
    const grant = previous?.refreshToken
      ? { grant_type: "refresh_token", refresh_token: previous.refreshToken }
      : {
          grant_type: "password",
          username: this.config.username,
          password: this.config.password,
        };
    const body = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      ...grant,
    };

    let response: Response;
    try {
      response = await this.fetcher(
        `${this.config.baseUrl}/aladdin/api/v1/issue-token`,
        {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(body),
          redirect: "error",
          signal: AbortSignal.timeout(this.timeoutMs),
        },
      );
    } catch {
      throw new PathaoApiError("Unable to authenticate with Pathao.", "network");
    }
    let payload: unknown;
    try {
      payload = JSON.parse(await response.text()) as unknown;
    } catch {
      throw new PathaoApiError("Pathao returned an invalid authentication response.", "invalid_response");
    }

    if (!response.ok && previous?.refreshToken && response.status === 401) {
      this.token = { ...previous, expiresAt: 0 };
      return this.issuePasswordToken();
    }
    if (!response.ok) {
      throw new PathaoApiError(errorMessage(response.status), errorCategory(response.status), response.status);
    }
    return this.parseToken(payload);
  }

  private async issuePasswordToken(): Promise<AccessToken> {
    this.token = null;
    return this.issueToken();
  }

  private parseToken(payload: unknown): AccessToken {
    let candidate: unknown = payload;
    if (typeof payload === "object" && payload !== null && "data" in payload) {
      candidate = (payload as { data: unknown }).data;
    }
    const parsed = tokenSchema.safeParse(candidate);
    if (!parsed.success || parsed.data.token_type.toLowerCase() !== "bearer") {
      throw new PathaoApiError("Pathao returned an invalid authentication response.", "invalid_response");
    }
    return {
      value: parsed.data.access_token,
      refreshToken: parsed.data.refresh_token ?? null,
      expiresAt: this.now() + parsed.data.expires_in * 1000,
    };
  }
}

function positiveId(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new PathaoApiError("A valid Pathao location or store ID is required.", "validation");
  }
  return value;
}

let sharedClient: PathaoClient | null = null;

export function getPathaoClient(config: PathaoConfig): PathaoClient {
  if (!sharedClient) sharedClient = new PathaoClient(config);
  return sharedClient;
}
