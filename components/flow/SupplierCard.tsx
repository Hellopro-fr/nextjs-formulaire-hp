"use client";

import { useState } from "react";
import { Check, MapPin, CheckCircle, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ProductSpec } from "@/types";

interface SupplierCardProps {
  id: string;
  productName: string;
  supplierName: string;
  rating: number;
  distance: number;
  matchScore: number;
  image: string;
  description?: string;
  specs?: ProductSpec[];
  isRecommended?: boolean;
  isCertified?: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onViewDetails?: (id: string) => void;
  matchGaps?: string[];
}

const SupplierCard = ({
  id,
  productName,
  distance,
  matchScore,
  image,
  specs = [],
  isRecommended = false,
  isCertified = false,
  isSelected,
  onToggle,
  onViewDetails,
  matchGaps = [],
}: SupplierCardProps) => {
  const [showAllGaps, setShowAllGaps] = useState(false);

  const getMatchBadgeStyle = () => {
    if (matchScore >= 80) return "bg-match-high text-white";
    if (matchScore >= 60) return "bg-match-medium text-white";
    return "bg-match-low text-white";
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.checkbox-area')) {
      return;
    }
    onViewDetails?.(id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };

  const matchingSpecs = specs.filter((spec) => spec.matches === true);
  const nonMatchingSpecs = specs.filter((spec) => spec.matches === false);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-primary bg-recommended shadow-md ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/40 hover:shadow-md",
        isRecommended && !isSelected && "border-recommended-border"
      )}
      onClick={handleCardClick}
    >
      {/* Checkbox - positioned top right */}
      <div
        className="checkbox-area absolute top-3 right-3 z-10"
        onClick={handleCheckboxClick}
      >
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all duration-200 shadow-sm",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30 bg-background/90 backdrop-blur-sm group-hover:border-primary/50"
          )}
        >
          {isSelected && (
            <Check className="h-4 w-4 text-primary-foreground animate-check-bounce" />
          )}
        </div>
      </div>

      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            Recommandé
          </span>
        </div>
      )}

      {/* Product Image - Large */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={productName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Match Score Overlay - solid background for visibility */}
        <div className={cn(
          "absolute bottom-3 right-3 rounded-lg px-3 py-1.5 font-bold text-sm shadow-lg",
          getMatchBadgeStyle()
        )}>
          {matchScore}%
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title - fixed height for 2 lines */}
        <h4 className="font-semibold text-foreground text-base leading-tight line-clamp-2 min-h-[2.5rem]">
          {productName}
        </h4>

        {/* Certified Badge - fixed height slot */}
        <div className="h-7 mt-2">
          {isCertified && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Fournisseur certifié
            </div>
          )}
        </div>

        {/* Distance + OK specs count on same line */}
        <div className="flex items-center justify-between text-sm mt-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{distance} km</span>
          </div>
          {matchingSpecs.length > 0 && (
            <div className="flex items-center gap-1 text-match-high">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">{matchingSpecs.length}/{specs.length} critères</span>
            </div>
          )}
        </div>

        {/* Specs KO with explanations - collapsible if more than 2 */}
        {nonMatchingSpecs.length > 0 && (
          <div className="space-y-1.5 mt-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Écarts ({nonMatchingSpecs.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(showAllGaps ? nonMatchingSpecs : nonMatchingSpecs.slice(0, 2)).map((spec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {spec.label}: {spec.value}
                  {spec.expected && (
                    <span className="text-amber-600">(demandé {spec.expected})</span>
                  )}
                </span>
              ))}
            </div>
            {nonMatchingSpecs.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllGaps(!showAllGaps);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
              >
                {showAllGaps ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    +{nonMatchingSpecs.length - 2} autre(s) écart(s)
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Additional Match Gaps - collapsible if more than 2 */}
        {matchGaps.length > 0 && nonMatchingSpecs.length === 0 && (
          <div className="space-y-1.5 mt-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Écarts ({matchGaps.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(showAllGaps ? matchGaps : matchGaps.slice(0, 2)).map((gap, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {gap}
                </span>
              ))}
            </div>
            {matchGaps.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllGaps(!showAllGaps);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
              >
                {showAllGaps ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    +{matchGaps.length - 2} autre(s) écart(s)
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Details Footer */}
      <div className="border-t border-border px-4 py-3 text-center">
        <span className="text-sm font-medium text-primary group-hover:underline">
          Voir les détails →
        </span>
      </div>
    </div>
  );
};

export default SupplierCard;
