"use client";

import { Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CriteriaTagsProps {
  criteria: string[];
  onModify?: () => void;
}

const CriteriaTags = ({ criteria, onModify }: CriteriaTagsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {criteria.map((criterion, index) => (
        <span
          key={index}
          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
        >
          {criterion}
        </span>
      ))}
      {onModify && (
        <button
          onClick={onModify}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Modifier
        </button>
      )}
    </div>
  );
};

export default CriteriaTags;
