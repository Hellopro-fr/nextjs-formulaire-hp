"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";

interface ModifyCriteriaFormProps {
  onBack: () => void;
}

const LIFT_TYPE_OPTIONS = [
  { value: "2-colonnes", label: "2 colonnes" },
  { value: "4-colonnes", label: "4 colonnes" },
  { value: "ciseaux", label: "Ciseaux" },
  { value: "fosse", label: "Fosse" },
];

const CAPACITY_OPTIONS = [
  { value: "2.5t", label: "2,5 tonnes" },
  { value: "3t", label: "3 tonnes" },
  { value: "3.5t", label: "3,5 tonnes" },
  { value: "4t", label: "4 tonnes" },
  { value: "5t", label: "5 tonnes" },
  { value: "6t", label: "6 tonnes" },
];

const VOLTAGE_OPTIONS = [
  { value: "230v", label: "230V monophasé" },
  { value: "400v", label: "400V triphasé" },
];

const ZONE_OPTIONS = [
  { value: "idf", label: "Île-de-France" },
  { value: "75", label: "Paris (75)" },
  { value: "77", label: "Seine-et-Marne (77)" },
  { value: "78", label: "Yvelines (78)" },
  { value: "91", label: "Essonne (91)" },
  { value: "92", label: "Hauts-de-Seine (92)" },
  { value: "93", label: "Seine-Saint-Denis (93)" },
  { value: "94", label: "Val-de-Marne (94)" },
  { value: "95", label: "Val-d'Oise (95)" },
  { value: "nord", label: "Nord" },
  { value: "est", label: "Est" },
  { value: "ouest", label: "Ouest" },
  { value: "sud", label: "Sud" },
  { value: "france", label: "France entière" },
];

const OPTIONS_LIST = [
  { value: "traverseSuperieure", label: "Traverse supérieure" },
  { value: "passageRoue", label: "Passage de roue ajustable" },
  { value: "brasTelescopic", label: "Bras télescopiques" },
  { value: "verinFosse", label: "Vérin de fosse intégré" },
  { value: "eclairageLed", label: "Éclairage LED intégré" },
  { value: "telecommande", label: "Télécommande sans fil" },
  { value: "detecteurPosition", label: "Détecteur de position" },
  { value: "protectionAntiChute", label: "Protection anti-chute renforcée" },
];

const ModifyCriteriaForm = ({ onBack }: ModifyCriteriaFormProps) => {
  const [criteria, setCriteria] = useState({
    type: "2-colonnes",
    voltage: "400v",
  });

  const [selectedCapacities, setSelectedCapacities] = useState<string[]>(["4t"]);
  const [selectedZones, setSelectedZones] = useState<string[]>(["idf"]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["traverseSuperieure"]);

  const [expansions, setExpansions] = useState({
    capacity35t: false,
    allVoltages: false,
    allFrance: false,
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border-2 border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Modifier les critères
          </h2>
          <p className="mt-1 text-muted-foreground">
            Affinez votre recherche pour trouver les fournisseurs idéaux
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Two column layout for selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type de pont - Single select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Type de pont
              </label>
              <select
                value={criteria.type}
                onChange={(e) => setCriteria({ ...criteria, type: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {LIFT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacité - Multi select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Capacité
              </label>
              <MultiSelectDropdown
                options={CAPACITY_OPTIONS}
                selected={selectedCapacities}
                onChange={setSelectedCapacities}
                placeholder="Sélectionner les capacités..."
                searchPlaceholder="Rechercher une capacité..."
              />
            </div>

            {/* Alimentation - Single select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alimentation
              </label>
              <select
                value={criteria.voltage}
                onChange={(e) =>
                  setCriteria({ ...criteria, voltage: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {VOLTAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone - Multi select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Zone géographique
              </label>
              <MultiSelectDropdown
                options={ZONE_OPTIONS}
                selected={selectedZones}
                onChange={setSelectedZones}
                placeholder="Sélectionner les zones..."
                searchPlaceholder="Rechercher une zone..."
              />
            </div>
          </div>

          {/* Options - Multi select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Options
            </label>
            <MultiSelectDropdown
              options={OPTIONS_LIST}
              selected={selectedOptions}
              onChange={setSelectedOptions}
              placeholder="Sélectionner les options..."
              searchPlaceholder="Rechercher une option..."
            />
          </div>

          {/* Expansion suggestions */}
          <div className="rounded-xl bg-secondary p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Élargir la recherche
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: "capacity35t" as const,
                  label: "Ponts 3,5T",
                  count: 5,
                  checked: expansions.capacity35t,
                },
                {
                  key: "allVoltages" as const,
                  label: "Tous voltages",
                  count: 3,
                  checked: expansions.allVoltages,
                },
                {
                  key: "allFrance" as const,
                  label: "France entière",
                  count: 12,
                  checked: expansions.allFrance,
                },
              ].map((expansion) => (
                <label
                  key={expansion.key}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                      expansion.checked
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}
                    onClick={() =>
                      setExpansions({
                        ...expansions,
                        [expansion.key]: !expansion.checked,
                      })
                    }
                  >
                    {expansion.checked && (
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground">
                    {expansion.label}{" "}
                    <span className="text-primary">(+{expansion.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={onBack}
                className="order-2 sm:order-1 w-full sm:w-auto rounded-lg border-2 border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onBack}
                className="order-1 sm:order-2 w-full sm:w-auto flex-1 sm:flex-none rounded-lg bg-accent px-8 py-3 text-base font-semibold text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                Voir les résultats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyCriteriaForm;
