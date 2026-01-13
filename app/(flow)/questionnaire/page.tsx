import type { Metadata } from 'next';
import QuestionnaireClient from './questionnaire-client';

export const metadata: Metadata = {
  title: 'Questionnaire - Définissez vos besoins',
  description: 'Répondez à quelques questions pour nous aider à trouver les fournisseurs adaptés à vos besoins.',
};

export default function QuestionnairePage() {
  return <QuestionnaireClient />;
}
