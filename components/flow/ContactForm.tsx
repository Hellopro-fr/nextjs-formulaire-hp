"use client";

import { ArrowLeft, Send, Shield, Clock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLeadSubmission } from "@/hooks/api/useLeadSubmission";
import { useFlowStore } from "@/lib/stores/flow-store";
import type { Supplier, ContactFormData } from "@/types";

// Analytics imports
import { trackContactFormView, trackFormSubmitAttempt } from "@/lib/analytics/gtm";

interface ContactFormProps {
  selectedSuppliers: Supplier[];
  onBack: () => void;
}

const ContactForm = ({ selectedSuppliers, onBack }: ContactFormProps) => {
  const router = useRouter();
  const { userAnswers, profileData, selectedSupplierIds } = useFlowStore();
  const leadSubmission = useLeadSubmission();

  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    firstName: "",
    lastName: "",
    company: profileData?.company?.name || profileData?.companyName || "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  // Track form view on mount
  useState(() => {
    trackContactFormView(selectedSuppliers.length);
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when field is modified
    if (errors[name as keyof ContactFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Prénom requis";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Nom requis";
    }
    if (!formData.company.trim()) {
      newErrors.company = "Société requise";
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Téléphone invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    const missingFields = Object.keys(errors);

    trackFormSubmitAttempt(isValid, missingFields);

    if (!isValid) return;

    // Submit lead
    leadSubmission.mutate({
      contact: formData,
      profile: profileData!,
      answers: userAnswers,
      selectedSupplierIds: selectedSupplierIds,
      submittedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Modifier ma sélection
      </button>

      {/* Centered content container */}
      <div className="mx-auto max-w-xl space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vos coordonnées</h2>
          <p className="mt-1 text-muted-foreground">
            Recevez vos devis personnalisés sous 48h
          </p>
        </div>

        {/* Selected suppliers summary */}
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-sm font-medium text-foreground mb-3">
            Votre demande sera envoyée à :
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm"
              >
                <div className="h-5 w-5 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={supplier.image}
                    alt=""
                    width={20}
                    height={20}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-medium">{supplier.supplierName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Email professionnel *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.email ? 'border-destructive' : 'border-input'} bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              placeholder="vous@entreprise.com"
            />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-lg border ${errors.firstName ? 'border-destructive' : 'border-input'} bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-lg border ${errors.lastName ? 'border-destructive' : 'border-input'} bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Société *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.company ? 'border-destructive' : 'border-input'} bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            />
            {errors.company && <p className="mt-1 text-sm text-destructive">{errors.company}</p>}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.phone ? 'border-destructive' : 'border-input'} bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              placeholder="06 12 34 56 78"
            />
            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Précisions pour les fournisseurs{" "}
              <span className="text-muted-foreground">(optionnel)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Délais souhaités, contraintes techniques..."
            />
          </div>

          {/* Reassurance */}
          <div className="flex flex-col gap-2 rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Ces fournisseurs s'engagent à vous répondre sous 48h
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Vos coordonnées sont uniquement partagées avec les fournisseurs
              choisis
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={leadSubmission.isPending}
            className="w-full rounded-xl bg-accent py-4 text-lg font-semibold text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {leadSubmission.isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Envoyer ma demande
              </>
            )}
          </button>

          {leadSubmission.isError && (
            <p className="text-center text-sm text-destructive">
              Une erreur est survenue. Veuillez réessayer.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
