"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { Product, ProductColor } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
  selectedColor: ProductColor;
}

export function ProductGallery({ product, selectedColor }: ProductGalleryProps) {
  const galleryImages = (product.productImages ?? [])
    .filter((image) => image.role === "primary" || image.role === "gallery")
    .sort((left, right) => {
      const leftColorMatch = left.color === selectedColor.name ? 0 : left.color ? 2 : 1;
      const rightColorMatch = right.color === selectedColor.name ? 0 : right.color ? 2 : 1;
      return leftColorMatch - rightColorMatch || left.sortOrder - right.sortOrder;
    });

  const visibleImages = galleryImages.some((image) => image.color === selectedColor.name)
    ? galleryImages.filter((image) => !image.color || image.color === selectedColor.name)
    : galleryImages;

  const count = visibleImages.length;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prevColor, setPrevColor] = React.useState(selectedColor.name);

  // Reset active index when color changes without triggering an extra render pass
  if (prevColor !== selectedColor.name) {
    setPrevColor(selectedColor.name);
    setActiveIndex(0);
  }

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  const [zoomScale, setZoomScale] = React.useState(1);
  const [zoomOrigin, setZoomOrigin] = React.useState({ x: 50, y: 50 });

  // Touch/swipe state
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  // Pinch zoom for lightbox
  const pinchStartDistance = React.useRef<number | null>(null);
  const pinchStartScale = React.useRef(1);

  const safeIndex = Math.min(activeIndex, Math.max(0, count - 1));
  const activeImage = visibleImages[safeIndex];

  const goTo = React.useCallback(
    (index: number) => {
      if (count <= 1) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const goPrev = React.useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);
  const goNext = React.useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);

  const openLightbox = () => {
    setLightboxOpen(true);
    setZoomed(false);
    setZoomScale(1);
    setZoomOrigin({ x: 50, y: 50 });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomed(false);
    setZoomScale(1);
  };

  const zoomIn = () => {
    setZoomScale((prev) => {
      const next = Math.min(prev + 0.5, 4);
      setZoomed(next > 1);
      return next;
    });
  };

  const zoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      setZoomed(next > 1);
      return next;
    });
  };

  const handleMainImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (zoomed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
    openLightbox();
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        setZoomed(false);
        setZoomScale(1);
      } else if (event.key === "ArrowLeft") {
        goTo(safeIndex - 1);
      } else if (event.key === "ArrowRight") {
        goTo(safeIndex + 1);
      } else if (event.key === "+" || event.key === "=") {
        setZoomScale((prev) => {
          const next = Math.min(prev + 0.5, 4);
          setZoomed(next > 1);
          return next;
        });
      } else if (event.key === "-") {
        setZoomScale((prev) => {
          const next = Math.max(prev - 0.5, 1);
          setZoomed(next > 1);
          return next;
        });
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, safeIndex, goTo]);

  // Prevent background scroll when lightbox open
  React.useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // Swipe handlers (main gallery)
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = event.changedTouches[0].clientX - touchStartX.current;
    const dy = event.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // Pinch zoom handlers in lightbox
  const getPinchDistance = (event: React.TouchEvent) => {
    if (event.touches.length < 2) return null;
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleLightboxTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      pinchStartDistance.current = getPinchDistance(event);
      pinchStartScale.current = zoomScale;
    } else if (event.touches.length === 1) {
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    }
  };

  const handleLightboxTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && pinchStartDistance.current !== null) {
      const currentDistance = getPinchDistance(event);
      if (currentDistance === null) return;
      const ratio = currentDistance / pinchStartDistance.current;
      const next = Math.min(Math.max(pinchStartScale.current * ratio, 1), 5);
      setZoomScale(next);
      setZoomed(next > 1);
    }
  };

  const handleLightboxTouchEnd = (event: React.TouchEvent) => {
    if (event.touches.length < 2) {
      pinchStartDistance.current = null;
    }
    if (
      touchStartX.current !== null &&
      touchStartY.current !== null &&
      event.changedTouches.length === 1 &&
      zoomScale <= 1.1
    ) {
      const dx = event.changedTouches[0].clientX - touchStartX.current;
      const dy = event.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }
  };

  if (count === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-muted/60 flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Product images are unavailable.
      </div>
    );
  }

  return (
    <>
      {/* Main gallery */}
      <div className="flex flex-col gap-4">
        {/* Active image */}
        <div className="relative" role="region" aria-label={`${product.name} image gallery`}>
          <div
            className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-muted/60 cursor-zoom-in"
            onClick={handleMainImageClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-label={`View full size: ${activeImage?.altText ?? product.name}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openLightbox();
              if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
              if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
            }}
          >
            {activeImage && (
              <Image
                src={activeImage.url}
                alt={activeImage.altText}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-opacity duration-200"
                unoptimized
                priority
              />
            )}

            {/* Prev / Next arrows — only if more than 1 image */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Position indicator */}
            {count > 1 && (
              <div className="absolute bottom-3 right-3 bg-background/75 backdrop-blur-sm border border-border px-2 py-0.5 text-[10px] font-bold tabular-nums z-10" aria-live="polite" aria-atomic="true">
                {safeIndex + 1} / {count}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {count > 1 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5" role="group" aria-label="Image thumbnails">
            {visibleImages.map((image, index) => (
              <button
                key={`${image.url}:${image.role}:${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-[3/4] overflow-hidden border transition-colors ${
                  index === safeIndex
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border hover:border-foreground/60"
                }`}
                aria-label={`Show image ${index + 1}: ${image.altText}`}
                aria-pressed={index === safeIndex}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 22vw, 15vw"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged view: ${activeImage.altText}`}
        >
          {/* Lightbox toolbar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {safeIndex + 1} / {count}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoomScale <= 1}
                className="flex size-9 items-center justify-center border border-border text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoomScale * 100)}%</span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoomScale >= 4}
                className="flex size-9 items-center justify-center border border-border text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="flex size-9 items-center justify-center border border-border text-foreground hover:bg-muted transition-colors ml-2"
                aria-label="Close enlarged view"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Lightbox image area */}
          <div
            className="relative flex-1 overflow-hidden select-none"
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                cursor: zoomed ? "move" : "zoom-in",
              }}
              onClick={() => {
                if (!zoomed) {
                  setZoomScale(2);
                  setZoomed(true);
                }
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: zoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : "center center",
                  transition: "transform 0.2s ease",
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
            </div>

            {/* Lightbox prev/next */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox alt text */}
          {activeImage.altText && (
            <div className="shrink-0 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {activeImage.altText}
            </div>
          )}
        </div>
      )}
    </>
  );
}
