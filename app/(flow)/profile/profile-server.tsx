import { fetchCountries, formatCountriesForUI } from '@/lib/api/services/countries.service';
import ProfileClient from './profile-client';

export default async function ProfileServer() {
  // Récupérer les pays côté serveur
  const response = await fetchCountries();

  let priorityCountries: string[] = [];
  let otherCountries: string[] = [];

  if (response.data) {
    const formatted         = (response.data);
          priorityCountries = formatted.principal;
          otherCountries    = formatted.complet;

  } else {
    // Fallback sur les données locales
    console.warn('Fallback sur données locales de pays');
    priorityCountries = ['Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Maroc', 'Algérie', 'Tunisie'];
    otherCountries = ['Afghanistan', 'Afrique du Sud', 'Albanie']; // Vos données locales
  }

  return (
    <ProfileClient
      priorityCountries={priorityCountries}
      otherCountries={otherCountries}
    />
  );
}