"use client";

import Image from "next/image";
import { Check, Users, Maximize2 } from "lucide-react";
import { BASE_PRICES } from "@/lib/constants";

interface ProductOption {
  name: string;
  description: string;
  capacity: string;
  dimensions: string;
  imageUrl: string;
  glowColor: "purple" | "pink" | "teal";
  basePrice: number;
}

const products: ProductOption[] = [
  {
    name: "Dance Dome",
    description: "Classic igloo-style inflatable nightclub",
    capacity: "10-15 guests",
    dimensions: "16x16",
    imageUrl: "/igloo_shape.jpg",
    glowColor: "pink",
    basePrice: BASE_PRICES["Dance Dome"],
  },
  {
    name: "Light Haus",
    description: "Modern cube design with maximum space",
    capacity: "15-30 guests",
    dimensions: "20x20x12",
    imageUrl: "/box_shape.JPG",
    glowColor: "purple",
    basePrice: BASE_PRICES["Light Haus"],
  },
  {
    name: "Club Noir",
    description: "Premium house-style venue",
    capacity: "15-30 guests",
    dimensions: "23x16x12",
    imageUrl: "/house_shape.jpg",
    glowColor: "teal",
    basePrice: BASE_PRICES["Club Noir"],
  },
];

interface ProductSelectorProps {
  selectedProduct: string | null;
  onProductSelect: (productName: string) => void;
  compact?: boolean;
}

export function ProductSelector({ selectedProduct, onProductSelect, compact = false }: ProductSelectorProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => {
          const isSelected = selectedProduct === product.name;

          return (
            <button
              key={product.name}
              onClick={() => onProductSelect(product.name)}
              className={`rounded-2xl border-2 overflow-hidden transition-all p-4 sm:p-6 ${
                isSelected
                  ? "border-primary bg-primary/10 glow-purple"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden mb-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  quality={85}
                />
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3">{product.description}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-3">Starting at ${product.basePrice}</p>
                <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacity: {product.capacity}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" />
                    Size: {product.dimensions}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Full mode - for booking modal
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const isSelected = selectedProduct === product.name;

        return (
          <button
            key={product.name}
            onClick={() => onProductSelect(product.name)}
            className={`rounded-xl border-2 overflow-hidden transition-all text-left ${
              isSelected
                ? "border-primary bg-primary/10 glow-purple"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="relative h-40 bg-black">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                quality={85}
              />
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base sm:text-lg font-bold">{product.name}</h3>
                <span className="text-base sm:text-lg font-bold text-primary">${product.basePrice}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
              <div className="flex gap-3 text-xs sm:text-sm text-muted-foreground">
                <span>{product.capacity}</span>
                <span>{product.dimensions}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
