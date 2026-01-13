"use client";

import { X, Star, MapPin, Building2, Clock, Shield, ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types";

interface ProductDetailModalProps {
  product: Supplier;
  onClose: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const ProductDetailModal = ({ product, onClose, onSelect, isSelected }: ProductDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images?.length > 0 ? product.images : [product.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getMatchColor = () => {
    if (product.matchScore >= 80) return "text-match-high";
    if (product.matchScore >= 60) return "text-match-medium";
    return "text-match-low";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 md:p-6 lg:p-8">
      <div className="relative max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 lg:px-8">
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground">{product.productName}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
          <div className="grid gap-8 p-6 lg:p-8 lg:grid-cols-[1fr,1.2fr]">
            {/* Left: Image Carousel */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <img
                  src={images[currentImageIndex]}
                  alt={product.productName}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image indicators */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        idx === currentImageIndex
                          ? "bg-primary w-4"
                          : "bg-background/60 hover:bg-background"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-primary/50"
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Match Score */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Correspondance avec vos critères</span>
                  <span className={cn("text-2xl font-bold", getMatchColor())}>
                    {product.matchScore}%
                  </span>
                </div>

                {product.matchGaps && product.matchGaps.length > 0 && (
                  <div className="space-y-1.5">
                    {product.matchGaps.map((gap, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-warning mt-0.5">⚠</span>
                        <span className="text-muted-foreground">{gap}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Caractéristiques</h3>
                <div className="space-y-2">
                  {product.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                        spec.matches === false ? "bg-warning/10" : "bg-muted/50"
                      )}
                    >
                      <span className="text-muted-foreground">{spec.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          spec.matches === false ? "text-warning" : "text-foreground"
                        )}>
                          {spec.value}
                        </span>
                        {spec.matches === false && spec.expected && (
                          <span className="text-xs text-muted-foreground">
                            (demandé : {spec.expected})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Supplier Info */}
          <div className="p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">À propos du fournisseur</h3>

            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground">
                    {product.supplier.name}
                  </h4>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {product.supplier.rating.toFixed(1)}
                      <span className="text-muted-foreground/70">
                        ({product.supplier.reviewCount} avis)
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {product.supplier.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Répond en {product.supplier.responseTime}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {product.supplier.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {product.supplier.yearsActive} ans d&apos;expérience
                </Badge>
                {product.supplier.certifications.map((cert, idx) => (
                  <Badge key={idx} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Retour à la liste
            </button>

            {isSelected ? (
              <div className="flex items-center gap-3">
                {/* Selected state badge */}
                <div className="flex items-center gap-2 rounded-full bg-match-high/15 border border-match-high/30 px-4 py-2">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-match-high">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-match-high">Produit sélectionné</span>
                </div>

                {/* Remove button - clearly destructive */}
                <Button
                  variant="outline"
                  onClick={() => {
                    onSelect();
                  }}
                  className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                >
                  <Trash2 className="h-4 w-4" />
                  Retirer de la sélection
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  onSelect();
                  onClose();
                }}
                className="px-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Ajouter à ma sélection
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
