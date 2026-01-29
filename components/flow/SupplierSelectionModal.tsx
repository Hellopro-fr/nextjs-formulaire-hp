'use client';

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, RotateCcw, ArrowLeft, Send, Search, LayoutGrid, List, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn, getAssetPath } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useFlowStore } from "@/lib/stores/flow-store";
import ProgressHeader from "./ProgressHeader";
import CriteriaTags from "./CriteriaTags";
import SupplierCard from "./SupplierCard";
import WarningBanner from "./WarningBanner";
import ContactForm from "./ContactForm";
import ModifyCriteriaForm from "./ModifyCriteriaForm";
import CustomNeedForm from "./CustomNeedForm";
import ProductDetailModal from "./ProductDetailModal";
import ProductComparisonModal from "./ProductComparisonModal";
import CriteriaChangedBanner from "./CriteriaChangedBanner";
import {
  trackComparisonModalView,
  trackProductSelectionChange,
  trackProductModalView,
} from "@/lib/analytics";
import { Supplier } from "@/types";

type ViewState = "selection" | "contact" | "modify-criteria" | "custom-need";

const STEPS = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];
interface SupplierSelectionModalProps {
  RECOMMENDED_SUPPLIERS : Supplier[];
  OTHER_SUPPLIERS       : Supplier[];
  userAnswers          ?: Record<number, string[]>;
  onBackToQuestionnaire?: () => void;
}

const SupplierSelectionModal = ({RECOMMENDED_SUPPLIERS, OTHER_SUPPLIERS, userAnswers, onBackToQuestionnaire }: SupplierSelectionModalProps) => {
  const ALL_SUPPLIERS = [...RECOMMENDED_SUPPLIERS, ...OTHER_SUPPLIERS];

  const [isExpanded, setIsExpanded] = useState(false);
  const [animatingCount, setAnimatingCount] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("selection");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [criteriaModified, setCriteriaModified] = useState(false);
  const [showCriteriaChangedBanner, setShowCriteriaChangedBanner] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<"grid" | "list">("list");

  // Zustand store pour la sélection des fournisseurs
  const { selectedSupplierIds, setSelectedSupplierIds } = useFlowStore();

  // Convertir le tableau en Set pour les opérations
  const selectedIds = useMemo(() => new Set(selectedSupplierIds), [selectedSupplierIds]);

  // Initialiser avec les fournisseurs recommandés si vide
  useEffect(() => {
    if (selectedSupplierIds.length === 0) {
      setSelectedSupplierIds(RECOMMENDED_SUPPLIERS.map((s) => s.id));
    }
  }, []);

  // Séparer les produits en fonction de leur sélection
  const selectedSuppliersList = useMemo(() => {
    return ALL_SUPPLIERS.filter((s) => selectedIds.has(s.id));
  }, [selectedIds]);

  const unselectedSuppliersList = useMemo(() => {
    const unselected = ALL_SUPPLIERS.filter((s) => !selectedIds.has(s.id));
    if (!searchQuery.trim()) return unselected;
    const query = searchQuery.toLowerCase();
    return unselected.filter(
      (s) =>
        s.productName.toLowerCase().includes(query) ||
        s.supplierName.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    );
  }, [selectedIds, searchQuery]);

  const initialSelectedIds = useMemo(
    () => new Set(RECOMMENDED_SUPPLIERS.map((s) => s.id)),
    []
  );

  const isModified = useMemo(() => {
    if (selectedIds.size !== initialSelectedIds.size) return true;
    for (const id of selectedIds) {
      if (!initialSelectedIds.has(id)) return true;
    }
    return false;
  }, [selectedIds, initialSelectedIds]);

  const selectedCount = selectedIds.size;

  const toggleSupplier = (id: string) => {
    const isRemoving = selectedIds.has(id);
    const newIds = isRemoving
      ? selectedSupplierIds.filter((sid) => sid !== id)
      : [...selectedSupplierIds, id];
    setSelectedSupplierIds(newIds);
    setAnimatingCount(true);

    // Track add/remove selection
    trackProductSelectionChange(id, isRemoving ? 'retirer' : 'ajouter', newIds.length);
  };

  const resetSelection = () => {
    setSelectedSupplierIds(RECOMMENDED_SUPPLIERS.map((s) => s.id));
    setIsExpanded(false);
  };

  const handleViewDetails = (id: string) => {
    setSelectedProductId(id);

    // Track product modal view
    const product = ALL_SUPPLIERS.find((s) => s.id === id);
    if (product) {
      trackProductModalView(id, product.productName, product.supplier?.name || product.supplierName);
    }
  };

  const selectedProduct = selectedProductId
    ? ALL_SUPPLIERS.find((s) => s.id === selectedProductId)
    : null;

  useEffect(() => {
    if (animatingCount) {
      const timer = setTimeout(() => setAnimatingCount(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animatingCount]);

  const getProgress = () => {
    switch (viewState) {
      case "selection":
        return 66;
      case "contact":
      case "modify-criteria":
      case "custom-need":
        return 90;
      default:
        return 66;
    }
  };

  const getCurrentStep = () => {
    switch (viewState) {
      case "selection":
        return 2;
      case "contact":
      case "modify-criteria":
      case "custom-need":
        return 3;
      default:
        return 2;
    }
  };

  

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <ProgressHeader
        steps={STEPS}
        currentStep={getCurrentStep()}
        progress={getProgress()}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewState === "selection" && (
          <div className="mx-auto max-w-7xl p-6 lg:p-10 space-y-8">
              {/* Title + View Toggle */}
              <div className="text-center relative">
                <h2 className="text-2xl font-bold text-foreground">
                  Votre sélection personnalisée
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {selectedCount} fournisseur{selectedCount > 1 ? "s" : ""}{" "}
                  recommandé{selectedCount > 1 ? "s" : ""} pour vous
                </p>
              </div>
              {/* Criteria Tags */}
              <CriteriaTags
                essentialCriteria={[
                  { label: "Type", value: "2 colonnes" },
                  { label: "Capacité", value: "4 tonnes" },
                  { label: "Alimentation", value: "400V triphasé" },
                ]}
                secondaryCriteria={[
                  { label: "Traverse", value: "Oui" },
                  { label: "Zone", value: "Île-de-France" },
                ]}
                onModify={() => {
                  setViewState("modify-criteria");
                  setCriteriaModified(true);
                }}
              />

              {/* Criteria Changed Banner */}
              {showCriteriaChangedBanner && (
                <CriteriaChangedBanner
                  onNewSelection={() => {
                    setSelectedSupplierIds([]);
                    setShowCriteriaChangedBanner(false);
                  }}
                  onDismiss={() => setShowCriteriaChangedBanner(false)}
                />
              )}

              {/* Warning Banner (only when expanded and modified) */}
              {isExpanded && isModified && (
                <WarningBanner message="En modifiant notre sélection, vous risquez de passer à côté des fournisseurs les plus adaptés à votre besoin." />
              )}

              {/* Supplier Lists */}
              <div className="space-y-6">
                {/* When collapsed: show only selected suppliers */}
                {!isExpanded && (
                  <div className={cn(
                    "grid gap-4 sm:gap-5",
                    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  )}>
                    {selectedSuppliersList.map((supplier) => (
                      <SupplierCard
                        key={supplier.id}
                        {...supplier}
                        isSelected={true}
                        onToggle={toggleSupplier}
                        onViewDetails={handleViewDetails}
                        viewMode={mobileViewMode}
                      />
                    ))}
                  </div>
                )}

                {/* When expanded: show all with sections */}
                {isExpanded && (
                  <>
                    {/* Selected Section */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        Produits sélectionnés ({selectedSuppliersList.length})
                        <span className="h-px flex-1 bg-border" />
                      </h3>
                      {selectedSuppliersList.length > 0 ? (
                        <div className={cn(
                          "grid gap-4 sm:gap-5",
                          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        )}>
                          {selectedSuppliersList.map((supplier) => (
                            <SupplierCard
                              key={supplier.id}
                              {...supplier}
                              isSelected={true}
                              onToggle={toggleSupplier}
                              onViewDetails={handleViewDetails}
                              viewMode={mobileViewMode}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Aucun produit sélectionné</p>
                        </div>
                      )}
                    </div>

                    {/* Other Results Section */}
                    <div className="space-y-4 pt-4">
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        Autres résultats ({unselectedSuppliersList.length})
                        <span className="h-px flex-1 bg-border" />
                      </h3>
                      

                      {unselectedSuppliersList.length > 0 ? (
                        <div className={cn(
                          "grid gap-4 sm:gap-5",
                          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        )}>
                          {unselectedSuppliersList.map((supplier) => (
                            <SupplierCard
                              key={supplier.id}
                              {...supplier}
                              isSelected={false}
                              onToggle={toggleSupplier}
                              onViewDetails={handleViewDetails}
                              viewMode={mobileViewMode}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery ? (
                            <p>Aucun résultat pour "{searchQuery}"</p>
                          ) : (
                            <p>Tous les produits sont sélectionnés</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reset link */}
                    {isModified && (
                      <button
                        onClick={resetSelection}
                        className="flex w-full items-center justify-center gap-2 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Revenir à la sélection recommandée
                      </button>
                    )}
                  </>
                )}

                {/* Expand/Collapse toggle */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 py-3 text-sm transition-colors rounded-lg border",
                    isExpanded 
                      ? "text-muted-foreground hover:text-foreground border-transparent" 
                      : "text-foreground font-medium border-border hover:bg-muted"
                  )}
                >
                  {isExpanded ? (
                    <>
                      Réduire
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Modifier ma sélection
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {viewState === "contact" && (
            <ContactForm
              selectedSuppliers={selectedSuppliersList}
              onBack={() => setViewState("selection")}
            />
          )}

          {viewState === "modify-criteria" && (
            <ModifyCriteriaForm onBack={() => {
              setViewState("selection");
              if (selectedIds.size > 0) {
                setShowCriteriaChangedBanner(true);
              }
            }} />
          )}

          {viewState === "custom-need" && (
            <CustomNeedForm onBack={() => setViewState("selection")} />
          )}
        </div>

      {/* Footer - Floating compact bar */}
      {viewState === "selection" && (
        <div className="border-t border-border bg-card/95 backdrop-blur-sm px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
            {/* Primary CTA - on top for mobile */}
            <button
              disabled={selectedCount === 0}
              onClick={() => setViewState("contact")}
              className={cn(
                "order-1 sm:order-2 rounded-lg px-6 py-3 text-base font-semibold transition-all duration-200 w-full sm:w-auto",
                selectedCount > 0
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                Recevoir {selectedCount} devis
              </span>
            </button>

            {/* Secondary actions */}
            <div className="order-2 sm:order-1 flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const selectedSupplierIds = Array.from(selectedIds);
                  trackComparisonModalView(selectedSupplierIds);
                  setShowComparison(true);
                }}
                className="hidden flex-1 sm:flex-none h-11 rounded-lg border-2 border-muted-foreground/30 bg-muted/50 px-4 text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/50 transition-colors flex items-center justify-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Comparer
              </button>
              
              <button
                onClick={() => setViewState("modify-criteria")}
                className="hidden flex-1 sm:flex-none h-11 rounded-lg border-2 border-muted-foreground/30 bg-muted/50 px-4 text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/50 transition-colors flex items-center justify-center"
              >
                Modifier critères
              </button>
              
              <button
                onClick={() => setViewState("custom-need")}
                className="hidden flex-1 sm:flex-none h-11 rounded-lg border-2 border-muted-foreground/30 bg-muted/50 px-4 text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/50 transition-colors flex items-center justify-center"
              >
                Pas trouvé ce que vous cherchez ?
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={{
            id: selectedProduct.id,
            name: selectedProduct.productName,
            images: selectedProduct.images,
            media: selectedProduct.media,
            description: selectedProduct.description,
            descriptionHtml: selectedProduct.descriptionHtml,
            specs: selectedProduct.specs,
            supplier: selectedProduct.supplier,
            matchScore: selectedProduct.matchScore,
            matchReasons: selectedProduct.matchGaps,
          }}
          onClose={() => setSelectedProductId(null)}
          onSelect={() => toggleSupplier(selectedProduct.id)}
          isSelected={selectedIds.has(selectedProduct.id)}
        />
      )}
      {/* Comparison Modal */}
      {showComparison && (
        <ProductComparisonModal
          products={ALL_SUPPLIERS}
          selectedIds={selectedIds}
          onToggle={toggleSupplier}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default SupplierSelectionModal;
