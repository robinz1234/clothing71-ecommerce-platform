import assert from "node:assert/strict";
import test from "node:test";
import { PathaoApiError, PathaoClient } from "./client";
import type { PathaoConfig } from "./config";

const sandboxConfig: PathaoConfig = {
  environment: "sandbox",
  baseUrl: "https://courier-api-sandbox.pathao.com",
  clientId: "test-client",
  clientSecret: "test-secret",
  username: "test-user",
  password: "test-password",
  storeId: "7",
  webhookSecret: "test-webhook-secret",
  productionBookingEnabled: false,
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("issues a token and refreshes it before expiry", async () => {
  let now = 1_000;
  const grants: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/issue-token")) {
      const requestBody = JSON.parse(String(init?.body)) as { grant_type: string };
      grants.push(requestBody.grant_type);
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 1,
        access_token: `access-${grants.length}`,
        refresh_token: `refresh-${grants.length}`,
      });
    }
    return jsonResponse({ data: { data: [{ city_id: 1, city_name: "Dhaka" }] } });
  };
  const client = new PathaoClient(sandboxConfig, fetcher, () => now);

  assert.deepEqual(await client.getCities(), [{ id: 1, name: "Dhaka" }]);
  now += 2_000;
  assert.deepEqual(await client.getCities(), [{ id: 1, name: "Dhaka" }]);
  assert.deepEqual(grants, ["password", "refresh_token"]);
});

test("uses the expected methods and response shapes across the mocked Pathao workflow", async () => {
  const requests: Array<{ path: string; method: string; body: unknown }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) as unknown : null;
    requests.push({ path: url.pathname, method, body });
    if (url.pathname.endsWith("/issue-token")) {
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 3_600,
        access_token: "mock-access",
        refresh_token: "mock-refresh",
      });
    }
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer mock-access");
    if (url.pathname.endsWith("/stores")) {
      return jsonResponse({ data: { data: [{ store_id: 7, store_name: "Test pickup", is_default: true }] } });
    }
    if (url.pathname.endsWith("/city-list")) {
      return jsonResponse({ data: { data: [{ city_id: 1, city_name: "Dhaka" }] } });
    }
    if (url.pathname.endsWith("/zone-list")) {
      return jsonResponse({ data: [{ zone_id: 11, zone_name: "Uttara" }] });
    }
    if (url.pathname.endsWith("/area-list")) {
      return jsonResponse({ data: { data: [{
        area_id: 101,
        area_name: "Sector 1",
        home_delivery_available: true,
        pickup_available: false,
      }] } });
    }
    if (url.pathname.endsWith("/price-plan")) {
      return jsonResponse({ data: { price: 95, discount: 5, promo_discount: 0 } });
    }
    if (url.pathname === "/aladdin/api/v1/orders" && method === "POST") {
      return jsonResponse({ data: {
        consignment_id: "PC-MOCK-123",
        merchant_order_id: "C71-MOCK-1",
        order_status: "Pending",
        delivery_fee: 90,
      } });
    }
    if (url.pathname.endsWith("/PC-MOCK-123/info")) {
      return jsonResponse({ data: {
        consignment_id: "PC-MOCK-123",
        merchant_order_id: "C71-MOCK-1",
        order_status_slug: "in_transit",
        updated_at: "2026-10-22T10:00:00Z",
        delivery_fee: 90,
      } });
    }
    throw new Error(`Unexpected mocked request: ${method} ${url.pathname}`);
  };
  const client = new PathaoClient(sandboxConfig, fetcher);

  assert.deepEqual(await client.getStores(), [{
    id: 7,
    name: "Test pickup",
    isDefault: true,
  }]);
  assert.deepEqual(await client.getCities(), [{ id: 1, name: "Dhaka" }]);
  assert.deepEqual(await client.getZones(1), [{ id: 11, name: "Uttara" }]);
  assert.deepEqual(await client.getAreas(11), [{
    id: 101,
    name: "Sector 1",
    homeDeliveryAvailable: true,
    pickupAvailable: false,
  }]);
  assert.deepEqual(
    await client.estimatePrice({ storeId: 7, cityId: 1, zoneId: 11, weightKg: 1 }),
    { price: 95, discount: 5, promoDiscount: 0 },
  );
  assert.deepEqual(
    await client.createOrder({
      storeId: 7,
      merchantOrderId: "C71-MOCK-1",
      recipientName: "Mock Recipient",
      recipientPhone: "01712345678",
      recipientAddress: "House 1, Road 2, Uttara, Dhaka",
      cityId: 1,
      zoneId: 11,
      areaId: 101,
      quantity: 2,
      weightKg: 1,
      amountToCollect: 2_080,
      specialInstruction: null,
    }),
    {
      consignmentId: "PC-MOCK-123",
      merchantOrderId: "C71-MOCK-1",
      status: "Pending",
      deliveryFee: 90,
    },
  );
  assert.deepEqual(await client.getOrderInfo("PC-MOCK-123"), {
    consignmentId: "PC-MOCK-123",
    merchantOrderId: "C71-MOCK-1",
    status: "in_transit",
    updatedAt: "2026-10-22T10:00:00Z",
    deliveryFee: 90,
  });
  assert.deepEqual(
    requests.map(({ path, method }) => [path, method]),
    [
      ["/aladdin/api/v1/issue-token", "POST"],
      ["/aladdin/api/v1/stores", "GET"],
      ["/aladdin/api/v1/city-list", "GET"],
      ["/aladdin/api/v1/cities/1/zone-list", "GET"],
      ["/aladdin/api/v1/zones/11/area-list", "GET"],
      ["/aladdin/api/v1/merchant/price-plan", "POST"],
      ["/aladdin/api/v1/orders", "POST"],
      ["/aladdin/api/v1/orders/PC-MOCK-123/info", "GET"],
    ],
  );
  const booking = requests.find(({ path, method }) => path === "/aladdin/api/v1/orders" && method === "POST");
  assert.deepEqual(booking?.body, {
    store_id: 7,
    merchant_order_id: "C71-MOCK-1",
    recipient_name: "Mock Recipient",
    recipient_phone: "01712345678",
    recipient_address: "House 1, Road 2, Uttara, Dhaka",
    recipient_city: 1,
    recipient_zone: 11,
    recipient_area: 101,
    delivery_type: 48,
    item_type: 2,
    special_instruction: "",
    item_quantity: 2,
    item_weight: 1,
    item_description: "Clothing item",
    amount_to_collect: 2_080,
  });
});

test("falls back to password authentication when a refresh token is rejected", async () => {
  let now = 1_000;
  const grants: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    if (String(input).endsWith("/issue-token")) {
      const body = JSON.parse(String(init?.body)) as { grant_type: string };
      grants.push(body.grant_type);
      if (body.grant_type === "refresh_token") {
        return jsonResponse({ message: "expired refresh token" }, 401);
      }
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 3_600,
        access_token: `access-${grants.length}`,
        refresh_token: `refresh-${grants.length}`,
      });
    }
    return jsonResponse({ data: [{ city_id: 1, city_name: "Dhaka" }] });
  };
  const client = new PathaoClient(sandboxConfig, fetcher, () => now);

  assert.deepEqual(await client.getCities(), [{ id: 1, name: "Dhaka" }]);
  now += 3_700_000;
  assert.deepEqual(await client.getCities(), [{ id: 1, name: "Dhaka" }]);
  assert.deepEqual(grants, ["password", "refresh_token", "password"]);
});

test("validates location lookup and estimate response schemas", async () => {
  const fetcher: typeof fetch = async (input, init) => {
    if (String(input).endsWith("/issue-token")) {
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 600,
        access_token: "access-token",
        refresh_token: "refresh-token",
      });
    }
    if (String(input).endsWith("/merchant/price-plan")) {
      const requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      assert.equal(requestBody.store_id, 7);
      assert.equal(requestBody.item_type, 2);
      assert.equal(requestBody.delivery_type, 48);
      assert.equal(requestBody.item_weight, 1);
      assert.equal(requestBody.recipient_city, 1);
      assert.equal(requestBody.recipient_zone, 11);
      return jsonResponse({ data: { price: 95, discount: 5, promo_discount: 0 } });
    }
    return jsonResponse({
      data: {
        data: [{
          area_id: 101,
          area_name: "Uttara",
          home_delivery_available: true,
          pickup_available: false,
        }],
      },
    });
  };
  const client = new PathaoClient(sandboxConfig, fetcher);
  assert.deepEqual(await client.getAreas(11), [{
    id: 101,
    name: "Uttara",
    homeDeliveryAvailable: true,
    pickupAvailable: false,
  }]);
  assert.deepEqual(
    await client.estimatePrice({ storeId: 7, cityId: 1, zoneId: 11, weightKg: 1 }),
    { price: 95, discount: 5, promoDiscount: 0 },
  );
});

test("rejects area data without an explicit home-delivery coverage flag", async () => {
  const fetcher: typeof fetch = async (input) => {
    if (String(input).endsWith("/issue-token")) {
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 600,
        access_token: "access-token",
        refresh_token: "refresh-token",
      });
    }
    return jsonResponse({
      data: [{
        area_id: 101,
        area_name: "Uttara",
      }],
    });
  };
  const client = new PathaoClient(sandboxConfig, fetcher);

  await assert.rejects(
    client.getAreas(11),
    (error: unknown) =>
      error instanceof PathaoApiError && error.category === "invalid_response",
  );
});

test("creates a shipment with the merchant reference and validates the response", async () => {
  const bookingRequests: Record<string, unknown>[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    if (String(input).endsWith("/issue-token")) {
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 600,
        access_token: "access-token",
        refresh_token: "refresh-token",
      });
    }
    bookingRequests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return jsonResponse({
      data: {
        consignment_id: "PC-123",
        merchant_order_id: "C71-ORDER-1",
        order_status: "Pending",
        delivery_fee: 90,
      },
    });
  };
  const client = new PathaoClient(sandboxConfig, fetcher);
  const result = await client.createOrder({
    storeId: 7,
    merchantOrderId: "C71-ORDER-1",
    recipientName: "Test Recipient",
    recipientPhone: "01712345678",
    recipientAddress: "House 1, Road 2, Dhaka",
    cityId: 1,
    zoneId: 11,
    areaId: 101,
    quantity: 2,
    weightKg: 1,
    amountToCollect: 2_000,
    specialInstruction: null,
  });

  assert.equal(result.consignmentId, "PC-123");
  assert.equal(result.deliveryFee, 90);
  assert.equal(bookingRequests[0]?.merchant_order_id, "C71-ORDER-1");
  assert.equal(bookingRequests[0]?.amount_to_collect, 2_000);
  assert.equal(bookingRequests[0]?.recipient_area, 101);
});

test("marks a lost booking response as unknown and does not retry it", async () => {
  let bookingCalls = 0;
  const fetcher: typeof fetch = async (input) => {
    if (String(input).endsWith("/issue-token")) {
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 600,
        access_token: "access-token",
        refresh_token: "refresh-token",
      });
    }
    bookingCalls++;
    throw new Error("simulated timeout");
  };
  const client = new PathaoClient(sandboxConfig, fetcher);

  await assert.rejects(
    client.createOrder({
      storeId: 7,
      merchantOrderId: "C71-ORDER-2",
      recipientName: "Test Recipient",
      recipientPhone: "01712345678",
      recipientAddress: "House 1, Road 2, Dhaka",
      cityId: 1,
      zoneId: 11,
      areaId: 101,
      quantity: 1,
      weightKg: 0.5,
      amountToCollect: 0,
      specialInstruction: null,
    }),
    (error: unknown) =>
      error instanceof PathaoApiError && error.outcomeUnknown,
  );
  assert.equal(bookingCalls, 1);
});

test("treats ambiguous HTTP booking responses as unknown", async () => {
  const fetcher: typeof fetch = async (input) => {
    if (String(input).endsWith("/issue-token")) {
      return jsonResponse({
        token_type: "Bearer",
        expires_in: 600,
        access_token: "access-token",
        refresh_token: "refresh-token",
      });
    }
    return new Response("unreadable response", { status: 409 });
  };
  const client = new PathaoClient(sandboxConfig, fetcher);

  await assert.rejects(
    client.createOrder({
      storeId: 7,
      merchantOrderId: "C71-ORDER-4",
      recipientName: "Test Recipient",
      recipientPhone: "01712345678",
      recipientAddress: "House 1, Road 2, Dhaka",
      cityId: 1,
      zoneId: 11,
      areaId: 101,
      quantity: 1,
      weightKg: 0.5,
      amountToCollect: 0,
      specialInstruction: null,
    }),
    (error: unknown) =>
      error instanceof PathaoApiError &&
      error.status === 409 &&
      error.outcomeUnknown,
  );
});

test("prevents production booking unless explicitly enabled", async () => {
  let requestCount = 0;
  const fetcher: typeof fetch = async () => {
    requestCount++;
    return jsonResponse({});
  };
  const productionClient = new PathaoClient({
    ...sandboxConfig,
    environment: "production",
    baseUrl: "https://api-hermes.pathao.com",
  }, fetcher);

  await assert.rejects(
    productionClient.createOrder({
      storeId: 7,
      merchantOrderId: "C71-ORDER-3",
      recipientName: "Test Recipient",
      recipientPhone: "01712345678",
      recipientAddress: "House 1, Road 2, Dhaka",
      cityId: 1,
      zoneId: 11,
      areaId: 101,
      quantity: 1,
      weightKg: 0.5,
      amountToCollect: 1_000,
      specialInstruction: null,
    }),
    (error: unknown) =>
      error instanceof PathaoApiError && error.category === "configuration",
  );
  assert.equal(requestCount, 0);
});
