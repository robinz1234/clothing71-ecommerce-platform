"use client";

import { useState } from "react";
import Image from "next/image";

type CategoryCardImageProps = {
  src: string;
  alt: string;
};

export function CategoryCardImage({ src, alt }: CategoryCardImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div aria-hidden={failed} className="absolute inset-0 overflow-hidden bg-muted/60">
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 33vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
