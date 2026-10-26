"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/types/product";
import Link from "next/link";

interface ProductAccordionsProps {
  product: Product;
}

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-70"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-5 text-xs leading-relaxed text-muted-foreground animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductAccordions({ product }: ProductAccordionsProps) {
  const careInstructions = product.careInstructions.filter(
    (instruction) => instruction.trim() !== "" && instruction.trim().toLowerCase() !== "n/a"
  );
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    details: true,
    fabric: false,
    care: false,
    delivery: false,
    returns: false,
  });

  const toggle = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="border-t border-border pt-2 divide-y-0">
      {/* 1. PRODUCT DETAILS */}
      <AccordionItem
        title="PRODUCT DETAILS"
        isOpen={openSections.details}
        onToggle={() => toggle("details")}
      >
        <p className="text-foreground font-medium mb-3">{product.description}</p>
        <ul className="space-y-1.5 list-disc pl-4">
          {product.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
          <li>SKU: {product.sku}</li>
          <li>Category: {product.category.toUpperCase()} &middot; {product.productType.replace("-", " ").toUpperCase()}</li>
        </ul>
      </AccordionItem>

      {/* 2. FABRIC & FIT */}
      <AccordionItem
        title="FABRIC & FIT"
        isOpen={openSections.fabric}
        onToggle={() => toggle("fabric")}
      >
        <div className="space-y-2.5">
          <div>
            <span className="font-bold uppercase tracking-wider text-foreground">Fabric Composition:</span>
            <p className="mt-0.5">{product.fabric}</p>
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-foreground">Fit Profile:</span>
            <p className="mt-0.5">{product.fit} silhouette engineered in our Dhaka factory.</p>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Pre-shrunk fabric construction ensures fit stability wash after wash.
          </p>
        </div>
      </AccordionItem>

      {/* 3. CARE INSTRUCTIONS */}
      {careInstructions.length > 0 && (
        <AccordionItem
          title="CARE INSTRUCTIONS"
          isOpen={openSections.care}
          onToggle={() => toggle("care")}
        >
          <ul className="space-y-1.5 list-disc pl-4">
            {careInstructions.map((care, i) => (
              <li key={i}>{care}</li>
            ))}
          </ul>
        </AccordionItem>
      )}

      {/* 4. DELIVERY */}
      <AccordionItem
        title="DELIVERY"
        isOpen={openSections.delivery}
        onToggle={() => toggle("delivery")}
      >
        <div className="space-y-3">
          <p>
            <span className="font-bold text-foreground">Cash on Delivery available nationwide</span>
            {" "}through Pathao Courier.
          </p>
          <div className="border border-border bg-muted/40 p-3 space-y-2">
            <p className="flex justify-between gap-3 font-medium">
              <span>Inside Dhaka &amp; Nearby Areas</span>
              <span className="shrink-0 font-bold text-foreground">৳80</span>
            </p>
            <p className="text-[11px]">Estimated delivery: 1–2 days</p>
            <p className="flex justify-between gap-3 border-t border-border pt-2 font-medium">
              <span>Outside Dhaka</span>
              <span className="shrink-0 font-bold text-foreground">৳120</span>
            </p>
            <p className="text-[11px]">Estimated delivery: 2–4 days</p>
          </div>
          <p>
            International shipping is available through DHL, FedEx, and UPS. Full advance payment is required. Contact us for a shipping quotation; international checkout is not available online.
          </p>
          <Link href="/shipping" className="inline-flex min-h-11 items-center font-bold text-foreground underline underline-offset-4">
            Full shipping information
          </Link>
        </div>
      </AccordionItem>

      {/* 5. RETURN & EXCHANGE */}
      <AccordionItem
        title="RETURN & EXCHANGE POLICY"
        isOpen={openSections.returns}
        onToggle={() => toggle("returns")}
      >
        <div className="space-y-3">
          <div>
            <span className="font-bold uppercase tracking-wider text-foreground">Return:</span>
            <p className="mt-0.5">
              Returns must be made to the delivery person at the time of delivery. No complaints or returns are accepted afterward. Return delivery charge is paid by the customer.
            </p>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-foreground">Exchange:</span>
            <p className="mt-0.5">
              Size or color exchanges may be requested within 2–4 working days after receiving the order. Exchange delivery charges are paid by the customer.
            </p>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-foreground">Damaged / Incorrect Product:</span>
            <p className="mt-0.5">
              Customer must report it immediately upon delivery. Claims after the delivery person leaves are not accepted.
            </p>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-foreground">Refund Policy:</span>
            <p className="mt-0.5">
              No refunds. All sales are final. Eligible products may be exchanged under the exchange policy.
            </p>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}
