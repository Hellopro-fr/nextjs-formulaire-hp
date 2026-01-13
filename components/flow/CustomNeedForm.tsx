"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

interface CustomNeedFormProps {
  onBack: () => void;
}

const CustomNeedForm = ({ onBack }: CustomNeedFormProps) => {
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission
    console.log("Custom need submitted:", { description, email, phone });
    onBack();
  };

  const isValid = description.trim().length > 20 && email.trim().length > 0;

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

      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Décrivez votre besoin</h2>
          <p className="mt-1 text-muted-foreground">
            Vous n'avez pas trouvé ce que vous cherchez ? Décrivez votre besoin et nous vous mettrons en contact avec les bons fournisseurs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Votre besoin *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Décrivez précisément votre besoin : type de véhicule, usage prévu, contraintes particulières..."
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Minimum 20 caractères ({description.length}/20)
            </p>
          </div>

          <div>
            <label
              htmlFor="custom-email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Email *
            </label>
            <input
              type="email"
              id="custom-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.com"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="custom-phone"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Téléphone{" "}
              <span className="text-muted-foreground">(optionnel)</span>
            </label>
            <input
              type="tel"
              id="custom-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            Envoyer ma demande
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomNeedForm;
