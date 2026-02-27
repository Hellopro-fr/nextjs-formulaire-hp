'use client';

import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressHeader from "./ProgressHeader";

const COUNTRIES = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola",
  "Antigua-et-Barbuda", "Arabie saoudite", "Argentine", "Arménie", "Australie", "Autriche",
  "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin",
  "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil",
  "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada", "Cap-Vert",
  "Centrafrique", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Corée du Nord", "Corée du Sud",
  "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique",
  "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini",
  "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce",
  "Grenade", "Guatemala", "Guinée", "Guinée équatoriale", "Guinée-Bissau", "Guyana", "Haïti",
  "Honduras", "Hongrie", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël",
  "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati",
  "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein",
  "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives",
  "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie",
  "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal", "Nicaragua",
  "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Oman", "Ouganda", "Ouzbékistan", "Pakistan",
  "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou",
  "Philippines", "Pologne", "Portugal", "Qatar", "République dominicaine", "République tchèque",
  "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Kitts-et-Nevis", "Saint-Vincent-et-les-Grenadines",
  "Sainte-Lucie", "Salomon", "Salvador", "Samoa", "São Tomé-et-Príncipe", "Sénégal", "Serbie",
  "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan",
  "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie", "Tadjikistan", "Tanzanie",
  "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie",
  "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela",
  "Viêt Nam", "Yémen", "Zambie", "Zimbabwe"
];

const POSTAL_CODE_CITIES = [
  { postalCode: "75001", city: "Paris 1er" },
  { postalCode: "75002", city: "Paris 2e" },
  { postalCode: "75003", city: "Paris 3e" },
  { postalCode: "75004", city: "Paris 4e" },
  { postalCode: "75005", city: "Paris 5e" },
  { postalCode: "75006", city: "Paris 6e" },
  { postalCode: "75007", city: "Paris 7e" },
  { postalCode: "75008", city: "Paris 8e" },
  { postalCode: "75009", city: "Paris 9e" },
  { postalCode: "75010", city: "Paris 10e" },
  { postalCode: "75011", city: "Paris 11e" },
  { postalCode: "75012", city: "Paris 12e" },
  { postalCode: "69001", city: "Lyon 1er" },
  { postalCode: "69002", city: "Lyon 2e" },
  { postalCode: "69003", city: "Lyon 3e" },
  { postalCode: "69100", city: "Villeurbanne" },
  { postalCode: "33000", city: "Bordeaux" },
  { postalCode: "33100", city: "Bordeaux" },
  { postalCode: "31000", city: "Toulouse" },
  { postalCode: "13001", city: "Marseille 1er" },
  { postalCode: "44000", city: "Nantes" },
  { postalCode: "59000", city: "Lille" },
  { postalCode: "92000", city: "Nanterre" },
  { postalCode: "92100", city: "Boulogne-Billancourt" },
  { postalCode: "94000", city: "Créteil" },
  { postalCode: "78000", city: "Versailles" },
  { postalCode: "45000", city: "Orléans" },
  { postalCode: "91000", city: "Évry-Courcouronnes" },
];

const STEPS = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];

export interface GeoData {
  country: string;
  postalCode: string;
  city: string;
}

interface GeoZoneStepProps {
  onComplete: (data: GeoData) => void;
  onBack: () => void;
}

const GeoZoneStep = ({ onComplete, onBack }: GeoZoneStepProps) => {
  const [country, setCountry] = useState("France");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [showPostalCodeSuggestions, setShowPostalCodeSuggestions] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const postalCodeSuggestions = useMemo(() => {
    if (postalCode.length < 2) return [];
    return POSTAL_CODE_CITIES.filter((item) =>
      item.postalCode.startsWith(postalCode)
    ).slice(0, 8);
  }, [postalCode]);

  const isFrance = country === "France";

  const isValid = useMemo(() => {
    if (!country.trim()) return false;
    if (isFrance) return postalCode.trim().length >= 5 && city.trim().length > 0;
    return true;
  }, [country, postalCode, city, isFrance]);

  const handleNext = () => {
    if (!isValid) return;
    onComplete({ country, postalCode: isFrance ? postalCode : "", city: isFrance ? city : "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <ProgressHeader
        steps={STEPS}
        currentStep={1}
        progress={80}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 p-4 sm:p-6 lg:p-10 pb-32 sm:pb-6">
            <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
              {/* Title */}
              <div className="text-center space-y-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  Où êtes-vous situé ?
                </h2>

                <div className="inline-flex items-center gap-3 rounded-full bg-accent/15 border border-accent/30 px-5 py-2.5 shadow-sm">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm sm:text-base text-foreground">
                    <span className="font-semibold">Pourquoi cette info ?</span>
                    {" "}Pour vous proposer uniquement les fournisseurs qui livrent et installent <span className="font-semibold text-accent">près de chez vous</span>
                  </span>
                </div>
              </div>

              {/* Country selector */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pays *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-foreground hover:border-primary/50 transition-colors"
                    >
                      <span>{country || "Sélectionnez un pays"}</span>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-border">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Rechercher un pays..."
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          {filteredCountries.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setCountry(c);
                                setShowCountryDropdown(false);
                                setCountrySearch("");
                                if (c !== "France") { setPostalCode(""); setCity(""); }
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                                c === country ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                              )}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Postal code + City side by side - only if France */}
                {isFrance && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Code postal *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                            setPostalCode(val);
                            setCity("");
                            setShowPostalCodeSuggestions(true);
                          }}
                          onFocus={() => setShowPostalCodeSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowPostalCodeSuggestions(false), 200)}
                          placeholder="Ex: 75011"
                          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          maxLength={5}
                        />
                        {showPostalCodeSuggestions && postalCodeSuggestions.length > 0 && (
                          <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                            {postalCodeSuggestions.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setPostalCode(item.postalCode);
                                  setCity(item.city);
                                  setShowPostalCodeSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                              >
                                <span className="font-medium">{item.postalCode}</span> — {item.city}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Ville *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Paris 11e"
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="hidden sm:flex items-center justify-between pt-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 rounded-lg border-2 border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isValid}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all",
                    isValid
                      ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile sticky footer */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={onBack}
                    className="flex items-center justify-center rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isValid}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold transition-all",
                      isValid
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    Suivant
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoZoneStep;
