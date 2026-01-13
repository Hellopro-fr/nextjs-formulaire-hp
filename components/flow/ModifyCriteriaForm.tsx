"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CAPACITY_OPTIONS,
  ZONE_OPTIONS,
  VOLTAGE_OPTIONS,
  LIFT_TYPE_OPTIONS,
  ADDITIONAL_OPTIONS,
} from "@/data/criteria";

interface ModifyCriteriaFormProps {
  onBack: () => void;
}

const ModifyCriteriaForm = ({ onBack }: ModifyCriteriaFormProps) => {
  const [liftType, setLiftType] = useState("2-colonnes");
  const [capacities, setCapacities] = useState<string[]>(["4t"]);
  const [voltage, setVoltage] = useState("400v");
  const [zones, setZones] = useState<string[]>(["ile-de-france"]);
  const [options, setOptions] = useState<string[]>(["traverse-sup"]);
  const [expandSearch, setExpandSearch] = useState(false);

  const toggleCapacity = (value: string) => {
    if (capacities.includes(value)) {
      setCapacities(capacities.filter((c) => c !== value));
    } else {
      setCapacities([...capacities, value]);
    }
  };

  const toggleZone = (value: string) => {
    if (zones.includes(value)) {
      setZones(zones.filter((z) => z !== value));
    } else {
      setZones([...zones, value]);
    }
  };

  const toggleOption = (value: string) => {
    if (options.includes(value)) {
      setOptions(options.filter((o) => o !== value));
    } else {
      setOptions([...options, value]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la sélection
      </button>

      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Modifier vos critères</h2>
          <p className="mt-1 text-muted-foreground">
            Affinez votre recherche pour des résultats plus pertinents
          </p>
        </div>

        {/* Lift Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Type de pont</label>
          <div className="grid grid-cols-2 gap-2">
            {LIFT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setLiftType(option.value)}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  liftType === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Capacities */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Capacité (multi-sélection)</label>
          <div className="flex flex-wrap gap-2">
            {CAPACITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleCapacity(option.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  capacities.includes(option.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voltage */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Alimentation</label>
          <div className="flex gap-2">
            {VOLTAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setVoltage(option.value)}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors flex-1",
                  voltage === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zones */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Zone géographique</label>
          <div className="flex flex-wrap gap-2">
            {ZONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleZone(option.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  zones.includes(option.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Options supplémentaires</label>
          <div className="flex flex-wrap gap-2">
            {ADDITIONAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  options.includes(option.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expand Search */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
          <input
            type="checkbox"
            id="expand-search"
            checked={expandSearch}
            onChange={(e) => setExpandSearch(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="expand-search" className="text-sm text-foreground">
            Élargir la recherche aux produits légèrement hors critères
          </label>
        </div>

        {/* Apply Button */}
        <button
          onClick={onBack}
          className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Appliquer les modifications
        </button>
      </div>
    </div>
  );
};

export default ModifyCriteriaForm;
