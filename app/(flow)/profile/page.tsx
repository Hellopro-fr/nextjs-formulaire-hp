import type { Metadata } from 'next';
import ProfileClient from './profile-client';

export const metadata: Metadata = {
  title: 'Profil - Vos informations',
  description: 'Renseignez vos informations professionnelles pour recevoir des devis personnalisés.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
