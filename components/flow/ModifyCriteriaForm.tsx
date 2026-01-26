'use client';

import { Plus, X, GripVertical, Sparkles, Target, Gift, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { trackModifyCriteriaModalView, trackCriteriaModified } from "@/lib/analytics";

interface ModifyCriteriaFormProps {
  onBack: () => void;
}

interface Criterion {
  id: string;
  label: string;
  value: string | string[];
  isMulti?: boolean;
}

const AVAILABLE_CRITERIA = [
  { id: "type", label: "Type de pont", options: ["2 colonnes", "4 colonnes", "Ciseaux", "Fosse"], isMulti: false },
  { id: "capacity", label: "Capacité", options: ["2,5 tonnes", "3 tonnes", "3,5 tonnes", "4 tonnes", "5 tonnes", "6 tonnes"], isMulti: false },
  { id: "voltage", label: "Alimentation", options: ["230V monophasé", "400V triphasé"], isMulti: true },
  { id: "zone", label: "Zone géographique", options: ["Île-de-France", "Paris (75)", "Nord", "Est", "Ouest", "Sud", "France entière"], isMulti: false },
  { id: "traverse", label: "Traverse supérieure", options: ["Oui", "Non"], isMulti: false },
  { id: "bras", label: "Bras télescopiques", options: ["Oui", "Non"], isMulti: false },
  { id: "led", label: "Éclairage LED", options: ["Oui", "Non"], isMulti: false },
  { id: "antichute", label: "Protection anti-chute", options: ["Oui", "Non"], isMulti: false },
];

const ModifyCriteriaForm = ({ onBack }: ModifyCriteriaFormProps) => {
  const [essentialCriteria, setEssentialCriteria] = useState<Criterion[]>([
    { id: "type", label: "Type de pont", value: "2 colonnes" },
    { id: "capacity", label: "Capacité", value: "4 tonnes" },
    { id: "voltage", label: "Alimentation", value: ["400V triphasé"], isMulti: true },
  ]);

  const [nonEssentialCriteria, setNonEssentialCriteria] = useState<Criterion[]>([
    { id: "traverse", label: "Traverse supérieure", value: "Oui" },
    { id: "zone", label: "Zone géographique", value: "Île-de-France" },
  ]);

  const [showAddEssential, setShowAddEssential] = useState(false);
  const [showAddNonEssential, setShowAddNonEssential] = useState(false);

  // Ref pour éviter les doubles appels en StrictMode
  const hasTrackedView = useRef(false);

  // Track modal view on mount (only once per session)
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      trackModifyCriteriaModalView();
    }
  }, []);

  const getAvailableCriteria = (currentList: Criterion[], otherList: Criterion[]) => {
    const usedIds = [...currentList, ...otherList].map(c => c.id);
    return AVAILABLE_CRITERIA.filter(c => !usedIds.includes(c.id));
  };

  const addCriterion = (criterionDef: typeof AVAILABLE_CRITERIA[0], isEssential: boolean) => {
    const newCriterion: Criterion = {
      id: criterionDef.id,
      label: criterionDef.label,
      value: criterionDef.isMulti ? [criterionDef.options[0]] : criterionDef.options[0],
      isMulti: criterionDef.isMulti,
    };

    if (isEssential) {
      setEssentialCriteria([...essentialCriteria, newCriterion]);
      setShowAddEssential(false);
    } else {
      setNonEssentialCriteria([...nonEssentialCriteria, newCriterion]);
      setShowAddNonEssential(false);
    }
  };

  const removeCriterion = (id: string, isEssential: boolean) => {
    if (isEssential) {
      setEssentialCriteria(essentialCriteria.filter(c => c.id !== id));
    } else {
      setNonEssentialCriteria(nonEssentialCriteria.filter(c => c.id !== id));
    }
  };

  const updateCriterionValue = (id: string, value: string | string[], isEssential: boolean) => {
    if (isEssential) {
      setEssentialCriteria(essentialCriteria.map(c =>
        c.id === id ? { ...c, value } : c
      ));
    } else {
      setNonEssentialCriteria(nonEssentialCriteria.map(c =>
        c.id === id ? { ...c, value } : c
      ));
    }
  };

  const toggleMultiValue = (id: string, option: string, isEssential: boolean) => {
    const list = isEssential ? essentialCriteria : nonEssentialCriteria;
    const criterion = list.find(c => c.id === id);
    if (!criterion || !Array.isArray(criterion.value)) return;

    const currentValues = criterion.value as string[];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];

    // Don't allow empty selection
    if (newValues.length === 0) return;

    updateCriterionValue(id, newValues, isEssential);
  };

  const getOptionsForCriterion = (id: string) => {
    return AVAILABLE_CRITERIA.find(c => c.id === id)?.options || [];
  };

  const handleApply = () => {
    // Track criteria modification
    const modifiedFields = [...essentialCriteria, ...nonEssentialCriteria].map(c => c.id);
    const criteriaCount = essentialCriteria.length + nonEssentialCriteria.length;
    trackCriteriaModified(criteriaCount, modifiedFields);
    onBack();
  };

  const CriterionCard = ({
    criterion,
    isEssential,
    canRemove = true
  }: {
    criterion: Criterion;
    isEssential: boolean;
    canRemove?: boolean;
  }) => {
    const isMulti = criterion.isMulti || Array.isArray(criterion.value);
    const options = getOptionsForCriterion(criterion.id);

    return (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm">
        <div className="flex-shrink-0 text-muted-foreground/40 mt-1">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-muted-foreground mb-1.5">
            {criterion.label}
          </div>

          {isMulti ? (
            <div className="flex flex-wrap gap-1.5">
              {options.map((option) => {
                const isSelected = Array.isArray(criterion.value) && criterion.value.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleMultiValue(criterion.id, option, isEssential)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <select
              value={criterion.value as string}
              onChange={(e) => updateCriterionValue(criterion.id, e.target.value, isEssential)}
              className="w-full rounded-lg border-0 bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>

        {canRemove && (
          <button
            onClick={() => removeCriterion(criterion.id, isEssential)}
            className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Supprimer ce critère"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const AddCriterionDropdown = ({
    isEssential,
    onClose
  }: {
    isEssential: boolean;
    onClose: () => void;
  }) => {
    const available = getAvailableCriteria(
      isEssential ? essentialCriteria : nonEssentialCriteria,
      isEssential ? nonEssentialCriteria : essentialCriteria
    );

    if (available.length === 0) {
      return (
        <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
          Tous les critères ont été ajoutés
          <button
            onClick={onClose}
            className="ml-2 text-primary hover:underline"
          >
            Fermer
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border bg-card p-2 shadow-lg">
        <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
          Ajouter un critère
        </div>
        {available.map((criterionDef) => (
          <button
            key={criterionDef.id}
            onClick={() => addCriterion(criterionDef, isEssential)}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {criterionDef.label}
          </button>
        ))}
        <div className="border-t border-border mt-1 pt-1">
          <button
            onClick={onClose}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      <div className="mx-auto max-w-2xl w-full flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border-2 border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Mes préférences
          </h2>
          <p className="mt-1 text-muted-foreground text-xs max-w-md mx-auto">
            <Sparkles className="inline h-3 w-3 mr-1 text-primary" />
            Ces critères guident notre recommandation, mais ne sont pas des filtres stricts.
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pb-4">
          {/* Essential Criteria Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Ce qui compte vraiment
              </h3>
              <span className="text-xs text-muted-foreground">
                — priorité haute
              </span>
            </div>

            <div className="space-y-2">
              {essentialCriteria.map((criterion) => (
                <CriterionCard
                  key={criterion.id}
                  criterion={criterion}
                  isEssential={true}
                  canRemove={essentialCriteria.length > 1}
                />
              ))}

              {showAddEssential ? (
                <AddCriterionDropdown
                  isEssential={true}
                  onClose={() => setShowAddEssential(false)}
                />
              ) : (
                <button
                  onClick={() => setShowAddEssential(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un critère essentiel
                </button>
              )}
            </div>
          </div>

          {/* Non-Essential Criteria Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-amber-500/10">
                <Gift className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Les petits plus
              </h3>
              <span className="text-xs text-muted-foreground">
                — appréciés mais pas indispensables
              </span>
            </div>

            <div className="space-y-2">
              {nonEssentialCriteria.map((criterion) => (
                <CriterionCard
                  key={criterion.id}
                  criterion={criterion}
                  isEssential={false}
                />
              ))}

              {showAddNonEssential ? (
                <AddCriterionDropdown
                  isEssential={false}
                  onClose={() => setShowAddNonEssential(false)}
                />
              ) : (
                <button
                  onClick={() => setShowAddNonEssential(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un critère secondaire
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Actions at bottom */}
        <div className="flex-shrink-0 pt-4 border-t border-border bg-background">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={onBack}
              className="order-2 sm:order-1 w-full sm:w-auto rounded-lg border-2 border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              className="order-1 sm:order-2 w-full sm:w-auto flex-1 sm:flex-none rounded-lg bg-accent px-8 py-2.5 text-base font-semibold text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Affiner mes recommandations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyCriteriaForm;
