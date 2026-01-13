"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Search, Building2, Sparkles, Globe, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressHeader from "./ProgressHeader";
import { COMPANIES_DATA } from "@/data/companies";
import { POSTAL_CODE_CITIES_DATA, COUNTRIES_DATA } from "@/data/location";
import { useFlowStore } from "@/lib/stores/flow-store";
import type { ProfileType, CompanyResult, ProfileData } from "@/types";

// Analytics imports
import { trackProfileTypeSelected, trackCompanySearch, trackProfileComplete } from "@/lib/analytics/gtm";
import { trackGA4ProfileComplete } from "@/lib/analytics/ga4";
import { tagHotjarUser, HOTJAR_TAGS } from "@/lib/analytics/hotjar";

interface ProfileTypeStepProps {
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];

const ProfileTypeStep = ({ onComplete, onBack, onClose }: ProfileTypeStepProps) => {
  const [selectedType, setSelectedType] = useState<ProfileType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showPostalCodeSuggestions, setShowPostalCodeSuggestions] = useState(false);

  const { setProfileData } = useFlowStore();

  // Filter postal code suggestions based on input
  const postalCodeSuggestions = useMemo(() => {
    if (postalCode.length < 2) return [];
    return POSTAL_CODE_CITIES_DATA.filter((item) =>
      item.postalCode.startsWith(postalCode)
    ).slice(0, 8);
  }, [postalCode]);

  // Filter companies based on search
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();

    // Track search
    if (searchQuery.length >= 2) {
      trackCompanySearch(searchQuery, COMPANIES_DATA.filter(
        c => c.name.toLowerCase().includes(query) || c.siren.includes(searchQuery)
      ).length);
    }

    return COMPANIES_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.siren.includes(searchQuery)
    ).slice(0, 10);
  }, [searchQuery]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES_DATA;
    return COUNTRIES_DATA.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Check if form is valid
  const isValid = useMemo(() => {
    switch (selectedType) {
      case "pro_france":
        return selectedCompany !== null;
      case "creation":
        return postalCode.trim().length >= 5 && city.trim().length > 0;
      case "pro_foreign":
        return companyName.trim().length > 0 && country.trim().length > 0;
      case "particulier":
        return postalCode.trim().length >= 5 && city.trim().length > 0;
      default:
        return false;
    }
  }, [selectedType, selectedCompany, postalCode, city, companyName, country]);

  const handleTypeSelect = (type: ProfileType) => {
    setSelectedType(type);
    setSelectedCompany(null);
    setSearchQuery("");

    if (type) {
      trackProfileTypeSelected(type);
    }
  };

  const handleNext = () => {
    if (!isValid) return;

    const data: ProfileData = { type: selectedType };

    switch (selectedType) {
      case "pro_france":
        data.company = selectedCompany!;
        break;
      case "creation":
      case "particulier":
        data.postalCode = postalCode;
        data.city = city;
        break;
      case "pro_foreign":
        data.companyName = companyName;
        data.country = country;
        break;
    }

    // Track completion
    trackProfileComplete(selectedType || '', !!selectedCompany);
    trackGA4ProfileComplete(selectedType || '', !!selectedCompany);
    tagHotjarUser(HOTJAR_TAGS.COMPLETED_PROFILE);

    // Save to store
    setProfileData(data);

    onComplete(data);
  };

  const handleSelectCompany = (company: CompanyResult) => {
    setSelectedCompany(company);
    setSearchQuery(company.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <ProgressHeader
        steps={STEPS}
        currentStep={1}
        progress={90}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 p-4 sm:p-6 lg:p-10 pb-32 sm:pb-6">
            <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
              {/* Title */}
              <div className="text-center space-y-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  Êtes-vous un professionnel ou un particulier ?
                </h2>

                {/* Reassurance banner - connected to the question */}
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

              {/* Options */}
              <div className="space-y-3">
                {/* Option 1: Professional based in France */}
                <div
                  className={cn(
                    "rounded-xl border-2 p-4 transition-all",
                    selectedType === "pro_france"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <button
                    onClick={() => handleTypeSelect("pro_france")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selectedType === "pro_france"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedType === "pro_france" && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Professionnel basé en France</span>
                        <span className="text-sm text-muted-foreground">(entreprises, associations, collectivités...)</span>
                      </div>
                    </div>
                  </button>

                  {selectedType === "pro_france" && (
                    <div className="mt-4 ml-8 space-y-3">
                      <label className="text-sm text-muted-foreground">
                        Saisissez le nom de votre structure ou le SIREN
                      </label>
                      <div className="relative">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setSelectedCompany(null);
                            }}
                            placeholder="Ex: Orange, 832435325"
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Company suggestions */}
                      {searchQuery.length >= 2 && !selectedCompany && (
                        <div className="space-y-2">
                          <p className="text-sm text-center text-muted-foreground">
                            Sélectionnez votre structure si elle s'affiche :
                          </p>
                          <button className="mx-auto block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            Ma structure n'est pas dans la liste
                          </button>

                          <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                            {filteredCompanies.length > 0 ? (
                              filteredCompanies.map((company, index) => (
                                <button
                                  key={company.siren}
                                  onClick={() => handleSelectCompany(company)}
                                  className={cn(
                                    "w-full text-left px-4 py-3 hover:bg-muted transition-colors",
                                    index !== filteredCompanies.length - 1 && "border-b border-border"
                                  )}
                                >
                                  <div className="font-medium text-foreground">{company.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    SIREN : {company.siren} &nbsp;&nbsp; {company.address}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-muted-foreground text-center bg-card">
                                Aucune entreprise trouvée
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedCompany && (
                        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                          <div className="font-medium text-foreground">{selectedCompany.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SIREN : {selectedCompany.siren} &nbsp;&nbsp; {selectedCompany.address}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Option 2: Company being created */}
                <div
                  className={cn(
                    "rounded-xl border-2 p-4 transition-all",
                    selectedType === "creation"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <button
                    onClick={() => handleTypeSelect("creation")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selectedType === "creation"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedType === "creation" && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">Société en cours de création</span>
                      </div>
                    </div>
                  </button>

                  {selectedType === "creation" && (
                    <div className="mt-4 ml-8 space-y-3">
                      <p className="text-sm text-muted-foreground">Merci de renseigner votre localisation</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <label className="text-sm text-muted-foreground">Code postal</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => {
                              const newPostalCode = e.target.value.replace(/\D/g, "").slice(0, 5);
                              setPostalCode(newPostalCode);
                              setCity("");
                              setShowPostalCodeSuggestions(newPostalCode.length >= 2);
                            }}
                            onFocus={() => postalCode.length >= 2 && setShowPostalCodeSuggestions(true)}
                            placeholder="75001"
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />

                          {showPostalCodeSuggestions && postalCodeSuggestions.length > 0 && !city && (
                            <div className="absolute z-50 mt-1 w-[calc(200%+0.75rem)] rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                              {postalCodeSuggestions.map((item, index) => (
                                <button
                                  key={`${item.postalCode}-${item.city}-${index}`}
                                  onClick={() => {
                                    setPostalCode(item.postalCode);
                                    setCity(item.city);
                                    setShowPostalCodeSuggestions(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors",
                                    index === 0 && "rounded-t-lg",
                                    index === postalCodeSuggestions.length - 1 && "rounded-b-lg"
                                  )}
                                >
                                  <span className="font-medium">{item.postalCode}</span>
                                  <span className="text-muted-foreground"> — {item.city}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Ville</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ville"
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Professional outside France */}
                <div
                  className={cn(
                    "rounded-xl border-2 p-4 transition-all",
                    selectedType === "pro_foreign"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <button
                    onClick={() => handleTypeSelect("pro_foreign")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selectedType === "pro_foreign"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedType === "pro_foreign" && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">Professionnel hors de France</span>
                      </div>
                    </div>
                  </button>

                  {selectedType === "pro_foreign" && (
                    <div className="mt-4 ml-8 space-y-3">
                      <p className="text-sm text-muted-foreground">Merci de renseigner vos informations</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Votre structure</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Nom de votre société / association / collectivité..."
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="relative">
                          <label className="text-sm text-muted-foreground">Pays</label>
                          <button
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="mt-1 w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-left focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <span className={country ? "text-foreground" : "text-muted-foreground"}>
                              {country || "Sélectionner un pays"}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                          </button>

                          {showCountryDropdown && (
                            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                              <div className="p-2 border-b border-border">
                                <input
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder="Rechercher..."
                                  className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredCountries.map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => {
                                      setCountry(c);
                                      setShowCountryDropdown(false);
                                      setCountrySearch("");
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 4: Individual */}
                <div
                  className={cn(
                    "rounded-xl border-2 p-4 transition-all",
                    selectedType === "particulier"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <button
                    onClick={() => handleTypeSelect("particulier")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selectedType === "particulier"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedType === "particulier" && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">Particulier</span>
                      </div>
                    </div>
                  </button>

                  {selectedType === "particulier" && (
                    <div className="mt-4 ml-8 space-y-3">
                      <p className="text-sm text-muted-foreground">Merci de renseigner votre localisation</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <label className="text-sm text-muted-foreground">Code postal</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => {
                              const newPostalCode = e.target.value.replace(/\D/g, "").slice(0, 5);
                              setPostalCode(newPostalCode);
                              setCity("");
                              setShowPostalCodeSuggestions(newPostalCode.length >= 2);
                            }}
                            onFocus={() => postalCode.length >= 2 && setShowPostalCodeSuggestions(true)}
                            placeholder="75001"
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />

                          {showPostalCodeSuggestions && postalCodeSuggestions.length > 0 && !city && (
                            <div className="absolute z-50 mt-1 w-[calc(200%+0.75rem)] rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                              {postalCodeSuggestions.map((item, index) => (
                                <button
                                  key={`${item.postalCode}-${item.city}-${index}`}
                                  onClick={() => {
                                    setPostalCode(item.postalCode);
                                    setCity(item.city);
                                    setShowPostalCodeSuggestions(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors",
                                    index === 0 && "rounded-t-lg",
                                    index === postalCodeSuggestions.length - 1 && "rounded-b-lg"
                                  )}
                                >
                                  <span className="font-medium">{item.postalCode}</span>
                                  <span className="text-muted-foreground"> — {item.city}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Ville</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ville"
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop navigation */}
              <div className="hidden sm:flex items-center justify-between pt-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 rounded-lg border-2 border-border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-muted text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
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
            </div>
          </div>

          {/* Mobile sticky footer */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center justify-center rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted text-foreground"
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
  );
};

export default ProfileTypeStep;
