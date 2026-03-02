"use client";

import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import ContactFormSimple from '@/components/flow/ContactFormSimple';

export default function ContactSimpleClient() {
  const { goToProfile, goToSomethingToAdd } = useFlowNavigation();

  return (
    <ContactFormSimple
      onBack={goToSomethingToAdd}
      onContactComplete={(isExistingBuyer) => {
        if (isExistingBuyer) {
          // Acheteur connu : le formulaire a déjà soumis le lead et navigue automatiquement
          // Pas besoin d'action supplémentaire ici
        } else {
          // Acheteur inconnu : naviguer vers Profile pour compléter les informations
          goToProfile();
        }
      }}
    />
  );
}
