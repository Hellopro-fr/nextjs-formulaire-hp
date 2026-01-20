import type { Metadata } from 'next';
import QuestionnaireClient from './(flow)/questionnaire/questionnaire-client';

// import {AppProvider} from '@/components/providers';

export const metadata: Metadata = {
  title: 'Questionnaire - Définissez vos besoins',
  description: 'Répondez à quelques questions pour nous aider à trouver les fournisseurs adaptés à vos besoins.',
};

// // On définit le type pour les paramètres d'URL
// interface PageProps {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }


export default async function Home() {
// export default async function Home({ searchParams }: PageProps) {
  // On attend la résolution des paramètres de recherche
  // const params = await searchParams;
  // const idCategorie = params.id_categorie;

  // Vérification de la présence de id_categorie
  // if (!idCategorie) {
  //   return (
  //     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //       <h1 style={{ color: 'red', fontFamily: 'sans-serif' }}>
  //         Erreur : id_categorie est absente de l'URL
  //       </h1>
  //     </div>
  //   );
  // }

  return(    
      <QuestionnaireClient />    
  );
}
