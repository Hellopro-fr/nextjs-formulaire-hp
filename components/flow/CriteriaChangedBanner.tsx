"use client";

import { RefreshCw, X } from "lucide-react";

interface CriteriaChangedBannerProps {
  onNewSelection: () => void;
  onDismiss: () => void;
}

const CriteriaChangedBanner = ({ onNewSelection, onDismiss }: CriteriaChangedBannerProps) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/10 border border-primary/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Vos critères ont été modifiés. Souhaitez-vous une nouvelle sélection ?
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNewSelection}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nouvelle sélection
        </button>
        <button
          onClick={onDismiss}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CriteriaChangedBanner;
