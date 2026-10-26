import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminOrderControls } from "@/components/admin/admin-order-controls";
import { OrderFulfillmentEditor } from "@/components/admin/order-fulfillment-editor";
import { PathaoFulfillment } from "@/components/admin/pathao-fulfillment";
import { PrintButton } from "@/components/admin/print-button";
import { getAdminOrder, getAdminPathaoShipment } from "@/lib/admin/queries";
import { hasAdminPermission, requireAdminPermission } from "@/lib/auth/admin";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("orders.read");
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const canManageOrders = await hasAdminPermission("orders.manage");
  const pathaoShipment = canManageOrders
    ? await getAdminPathaoShipment(order.id)
    : null;

  return (
    <main className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider hover:underline">&larr; All orders</Link>
        <PrintButton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="border-b border-border pb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Order detail</span>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{order.orderNumber}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>

          <section className="border border-border p-6">
            <h3 className="text-sm font-black uppercase tracking-wider">Customer & delivery</h3>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</p>
                <p className="mt-1">{order.customerName}</p>
                <p className="mt-1 text-muted-foreground">{order.customerEmail}</p>
                <p className="mt-1 text-muted-foreground">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</p>
                <p className="mt-1">{order.addressLine}</p>
                <p className="mt-1 text-muted-foreground">{order.areaLocality}, {order.cityDistrict}</p>
                <p className="mt-1 text-muted-foreground">Zone: {order.deliveryZone}</p>
                {order.deliveryNote && <p className="mt-1 text-muted-foreground">Customer note: {order.deliveryNote}</p>}
              {order.promoCode && (
                <p className="mt-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground">Promo Code:</span>{" "}
                  <span className="font-mono font-bold bg-muted px-2 py-0.5 border border-border">{order.promoCode}</span>
                </p>
              )}
            </div>
            </div>
            <div className="mt-5 border-t border-border pt-4 text-xs">
              <p><span className="font-bold uppercase">Courier:</span> {order.fulfillmentCourier ?? "Not assigned"}</p>
              <p className="mt-1"><span className="font-bold uppercase">Booking:</span> {order.fulfillmentBookingStatus.replace("_", " ")}</p>
              {order.fulfillmentTrackingNumber && <p className="mt-1"><span className="font-bold uppercase">Tracking:</span> {order.fulfillmentTrackingNumber}</p>}
              {order.fulfillmentDispatchedAt && <p className="mt-1"><span className="font-bold uppercase">Dispatched:</span> {new Date(order.fulfillmentDispatchedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>}
            </div>
          </section>

          <section className="border border-border p-6">
            <h3 className="text-sm font-black uppercase tracking-wider">Purchased items</h3>
            <div className="mt-5 divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden border border-border bg-muted/40">
                    {item.imagePublicUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imagePublicUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground text-center px-1">
                        No image
                      </div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between gap-2 text-sm sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="font-bold leading-snug">{item.productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.color} / {item.size}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
                        SKU {item.sku}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <p className="text-xs text-muted-foreground">Qty {item.quantity} × ৳{item.unitPriceBdt.toLocaleString()}</p>
                      <p className="font-bold tabular-nums">৳{item.lineTotalBdt.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>BDT {order.subtotalBdt.toLocaleString()}</span></div>
              {order.discountBdt ? (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount ({order.promoCode ?? "SPD10"})</span>
                  <span>- BDT {order.discountBdt.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>BDT {order.deliveryFeeBdt.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-black"><span>Total</span><span>BDT {order.totalBdt.toLocaleString()}</span></div>
            </div>
          </section>

          <section className="border border-border p-6">
            <h3 className="text-sm font-black uppercase tracking-wider">Internal notes</h3>
            {order.internalNotes.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No internal notes have been added.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {order.internalNotes.map((note) => (
                  <li key={note.id} className="border-t border-border pt-3">
                    <p className="whitespace-pre-wrap text-sm">{note.note}</p>
                    <time className="mt-2 block text-[10px] text-muted-foreground" dateTime={note.createdAt}>
                      {new Date(note.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-4 print:hidden">
          {canManageOrders ? (
            <>
              <AdminOrderControls orderId={order.id} orderStatus={order.orderStatus} paymentStatus={order.paymentStatus} />
              <OrderFulfillmentEditor
                orderId={order.id}
                initialCourier={order.fulfillmentCourier}
                initialBookingStatus={order.fulfillmentBookingStatus}
                initialTrackingNumber={order.fulfillmentTrackingNumber}
                initialDispatched={order.fulfillmentDispatchedAt !== null}
              />
              <PathaoFulfillment
                order={order}
                initialShipment={pathaoShipment}
              />
            </>
          ) : (
            <p className="border border-border p-4 text-sm text-muted-foreground">You have read-only order access.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
