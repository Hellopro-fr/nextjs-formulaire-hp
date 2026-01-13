"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { submitLead } from '@/lib/api/services/leads.service';
import type { LeadSubmission } from '@/types';

// Analytics imports
import { trackLeadSubmitted, trackLeadSubmissionError } from '@/lib/analytics/gtm';
import { trackGA4LeadSubmitted } from '@/lib/analytics/ga4';
import { tagHotjarUser, HOTJAR_TAGS } from '@/lib/analytics/hotjar';

export function useLeadSubmission() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LeadSubmission) => submitLead(data),
    onSuccess: (response, variables) => {
      // Track successful lead submission
      if (response.data?.leadId) {
        const profileType = variables.profile.type ?? 'unknown';
        trackLeadSubmitted(
          response.data.leadId,
          variables.selectedSupplierIds.length,
          profileType
        );
        trackGA4LeadSubmitted(
          response.data.leadId,
          variables.selectedSupplierIds.length,
          profileType
        );
        tagHotjarUser(HOTJAR_TAGS.CONVERTED);
      }

      // Navigate to confirmation page
      if (response.data?.redirectUrl) {
        router.push(response.data.redirectUrl);
      }
    },
    onError: (error) => {
      // Track submission error
      trackLeadSubmissionError(
        'submission_failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    },
  });
}
