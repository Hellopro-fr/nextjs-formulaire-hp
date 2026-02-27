import { Suspense } from 'react';
import type { Metadata } from 'next';
import GeoZoneClient from './geo-zone-client';

export const metadata: Metadata = {
  title: 'Localisation - Où êtes-vous situé ?',
  description: 'Renseignez votre localisation pour trouver les fournisseurs près de chez vous.',
};

export default function GeoZonePage() {
  return (
    <Suspense fallback={null}>
      <GeoZoneClient />
    </Suspense>
  );
}
