"use client";

import * as React from "react";
import Image from "next/image";
import { Ruler } from "lucide-react";
import type { ProductImage, ProductSizeGuide } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SizeGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  sizeGuides: ProductSizeGuide[];
  sizeChartImage?: ProductImage;
}

export function SizeGuideDialog({
  open,
  onOpenChange,
  productName,
  sizeGuides,
  sizeChartImage,
}: SizeGuideDialogProps) {
  const components = ["product", "top", "bottom"] as const;
  const measurementFields = [
    ["waist", "Waist"],
    ["length", "Length"],
    ["legOpening", "Leg Opening"],
    ["thigh", "Thigh"],
    ["chest", "Chest"],
    ["sleeve", "Sleeve"],
  ] as const;
  const visibleFields = measurementFields.filter(([key]) =>
    sizeGuides.some((row) => row[key] !== null && row[key] !== ""),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 sm:p-8">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Ruler className="size-5 text-foreground" />
            <DialogTitle>SIZE GUIDE</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {productName} measurements. Values are shown in the supplied unit.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto py-2">
          {sizeChartImage && (
            <div className="relative aspect-square w-full overflow-hidden border border-border bg-muted/30">
              <Image
                src={sizeChartImage.url}
                alt={sizeChartImage.altText}
                fill
                sizes="(max-width: 640px) 88vw, 520px"
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          {visibleFields.length > 0 && components.map((component) => {
            const rows = sizeGuides.filter((row) => row.component === component);
            if (rows.length === 0) return null;
            return (
              <section key={component} aria-label={`${component} measurements`}>
                {sizeGuides.some((row) => row.component !== "product") && (
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider">
                    {component === "product" ? "Product" : component}
                  </h3>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-y border-border">
                        <th className="px-3 py-2 font-bold uppercase">Size</th>
                        {visibleFields.map(([, label]) => (
                          <th key={label} className="px-3 py-2 font-bold uppercase">{label}</th>
                        ))}
                        <th className="px-3 py-2 font-bold uppercase">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={`${row.component}-${row.size}`} className="border-b border-border">
                          <th scope="row" className="px-3 py-2 font-bold">{row.size}</th>
                          {visibleFields.map(([key]) => (
                            <td key={key} className="px-3 py-2 tabular-nums">{row[key] ?? "-"}</td>
                          ))}
                          <td className="px-3 py-2">{row.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
          {visibleFields.length === 0 && !sizeChartImage && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No size guide is available for this product.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
