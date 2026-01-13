"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Send, Search, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressHeader from "./ProgressHeader";
import CriteriaTags from "./CriteriaTags";
import SupplierCard from "./SupplierCard";
import WarningBanner from "./WarningBanner";
import ContactForm from "./ContactForm";
import ModifyCriteriaForm from "./ModifyCriteriaForm";
import CustomNeedForm from "./CustomNeedForm";
import CriteriaChangedBanner from "./CriteriaChangedBanner";
import { RECOMMENDED_SUPPLIERS_DATA, OTHER_SUPPLIERS_DATA, ALL_SUPPLIERS_DATA } from "@/data/suppliers";
import { DEFAULT_CRITERIA } from "@/data/criteria";
import { useFlowStore } from "@/lib/stores/flow-store";
import type { ViewState, Supplier } from "@/types";

// Analytics imports
import {
  trackSelectionPageView,
  trackSupplierCardClick,
  trackSupplierSelectionChange,
  trackComparisonModalOpen,
} from "@/lib/analytics/gtm";
import { trackGA4SupplierSelection } from "@/lib/analytics/ga4";
import { tagHotjarUser, HOTJAR_TAGS } from "@/lib/analytics/hotjar";

interface SupplierSelectionModalProps {
  userAnswers?: Record<number, string[]>;
  onBackToQuestionnaire?: () => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];

const SupplierSelectionModal = ({
  userAnswers,
  onBackToQuestionnaire,
  onClose,
}: SupplierSelectionModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(RECOMMENDED_SUPPLIERS_DATA.map((s) => s.id))
  );
  const [animatingCount, setAnimatingCount] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("selection");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [criteriaModified, setCriteriaModified] = useState(false);
  const [showCriteriaChangedBanner, setShowCriteriaChangedBanner] = useState(false);

  const { setSelectedSupplierIds } = useFlowStore();

  // Track page view on mount
  useEffect(() => {
    trackSelectionPageView(
      RECOMMENDED_SUPPLIERS_DATA.length,
      ALL_SUPPLIERS_DATA.length
    );
  }, []);

  // Update store when selection changes
  useEffect(() => {
    setSelectedSupplierIds(Array.from(selectedIds));
  }, [selectedIds, setSelectedSupplierIds]);

  // Separate products based on selection
  const selectedSuppliersList = useMemo(() => {
    return ALL_SUPPLIERS_DATA.filter((s) => selectedIds.has(s.id));
  }, [selectedIds]);

  const unselectedSuppliersList = useMemo(() => {
    const unselected = ALL_SUPPLIERS_DATA.filter((s) => !selectedIds.has(s.id));
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
    () => new Set(RECOMMENDED_SUPPLIERS_DATA.map((s) => s.id)),
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
    const supplier = ALL_SUPPLIERS_DATA.find((s) => s.id === id);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      const action = next.has(id) ? "deselect" : "select";

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      // Track selection change
      const totalSelected = next.size;
      const selectionAction = action === "select" ? "add" : "remove";
      trackSupplierSelectionChange(id, selectionAction, totalSelected);
      trackGA4SupplierSelection(id, selectionAction, totalSelected);

      return next;
    });
    setAnimatingCount(true);
  };

  const resetSelection = () => {
    setSelectedIds(new Set(RECOMMENDED_SUPPLIERS_DATA.map((s) => s.id)));
    setIsExpanded(false);
  };

  const handleViewDetails = (id: string) => {
    const supplier = ALL_SUPPLIERS_DATA.find((s) => s.id === id);
    if (supplier) {
      trackSupplierCardClick(id, supplier.supplierName, supplier.matchScore, 'view_details');
    }
    setSelectedProductId(id);
  };

  const handleOpenComparison = () => {
    trackComparisonModalOpen(Array.from(selectedIds));
    tagHotjarUser(HOTJAR_TAGS.USED_COMPARISON);
    setShowComparison(true);
  };

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
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewState === "selection" && (
          <div className="mx-auto max-w-7xl p-6 lg:p-10 space-y-8">
            {/* Title */}
            <div className="text-center">
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
              criteria={DEFAULT_CRITERIA}
              onModify={() => {
                setViewState("modify-criteria");
                setCriteriaModified(true);
              }}
            />

            {/* Criteria Changed Banner */}
            {showCriteriaChangedBanner && (
              <CriteriaChangedBanner
                onNewSelection={() => {
                  setSelectedIds(new Set());
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {selectedSuppliersList.map((supplier) => (
                    <SupplierCard
                      key={supplier.id}
                      {...supplier}
                      isSelected={true}
                      onToggle={toggleSupplier}
                      onViewDetails={handleViewDetails}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {selectedSuppliersList.map((supplier) => (
                          <SupplierCard
                            key={supplier.id}
                            {...supplier}
                            isSelected={true}
                            onToggle={toggleSupplier}
                            onViewDetails={handleViewDetails}
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

                    {/* Search bar */}
                    <div className="relative">
                      <div className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <Search className="h-5 w-5 text-primary" />
                        <input
                          type="text"
                          placeholder="Rechercher parmi les autres résultats..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                          >
                            Effacer
                          </button>
                        )}
                      </div>
                    </div>

                    {unselectedSuppliersList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {unselectedSuppliersList.map((supplier) => (
                          <SupplierCard
                            key={supplier.id}
                            {...supplier}
                            isSelected={false}
                            onToggle={toggleSupplier}
                            onViewDetails={handleViewDetails}
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
                className="flex w-full items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <ModifyCriteriaForm
            onBack={() => {
              setViewState("selection");
              if (selectedIds.size > 0) {
                setShowCriteriaChangedBanner(true);
              }
            }}
          />
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
                onClick={handleOpenComparison}
                className="flex-1 sm:flex-none rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Comparer
              </button>

              <button
                onClick={() => setViewState("modify-criteria")}
                className="flex-1 sm:flex-none rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                Modifier critères
              </button>

              <button
                onClick={() => setViewState("custom-need")}
                className="flex-1 sm:flex-none rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                Besoin différent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSelectionModal;
