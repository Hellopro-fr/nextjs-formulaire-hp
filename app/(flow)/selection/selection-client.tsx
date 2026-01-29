"use client";

import { useEffect, useRef } from 'react';
import SupplierSelectionModal from '@/components/flow/SupplierSelectionModal';
import { useFlowStore } from '@/lib/stores/flow-store';
import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import { trackSelectionPageView } from '@/lib/analytics';
import { Supplier } from '@/types';
import { getAssetPath } from "@/lib/utils";

export default function SelectionClient() {
  const { userAnswers } = useFlowStore();
  const { goToQuestionnaire } = useFlowNavigation();
  const hasTrackedView = useRef(false);

  // Track selection page view au montage
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      // Valeurs par défaut - seront mises à jour par le composant si nécessaire
      trackSelectionPageView(4, 12); // 4 recommandés, 12 total
    }
  }, []);

  const handleBackToQuestionnaire = () => {
    // Navigate back to questionnaire (with GET params preserved)
    goToQuestionnaire();
  };

  
  const productLift1 = getAssetPath("/images/product-lift-1.jpg");
  const productLift2 = getAssetPath("/images/product-lift-2.jpg");
  const productLift3 = getAssetPath("/images/product-lift-3.jpg");
  const productLift4 = getAssetPath("/images/product-lift-4.jpg");
  const productLift5 = getAssetPath("/images/product-lift-5.jpg");
  const productLift6 = getAssetPath("/images/product-lift-6.jpg");
  const productLift7 = getAssetPath("/images/product-lift-7.jpg");

  const logoProvac = getAssetPath("/images/logo-provac.webp");
  const logoNussbaum = getAssetPath("/images/logo-nussbaum.png");
  const logoRavaglioli = getAssetPath("/images/logo-ravaglioli.jpg");


  const RECOMMENDED_SUPPLIERS: Supplier[] = [
    {
      id: "1",
      productName: "Pont élévateur Pro 4000 TEST",
      supplierName: "ÉQUIPGARAGE",
      rating: 4.8,
      distance: 35,
      matchScore: 92,
      image: productLift1,
      images: [productLift1, productLift2, productLift3],
      media: [
        { type: "image", url: productLift1 },
        { type: "video", url: "https://www.youtube.com/watch?v=4GcgS2DZxvM" },
        { type: "image", url: productLift2 },
        { type: "image", url: productLift3 },
      ],
      isRecommended: true,
      isCertified: true,
      matchGaps: ["Délai de livraison 3 semaines"],
      description: "Pont élévateur professionnel 2 colonnes avec traverse supérieure.",
      descriptionHtml: `
        <p><strong>Pont élévateur professionnel 2 colonnes</strong> avec traverse supérieure, conçu pour répondre aux exigences des garages automobiles modernes et des centres de contrôle technique.</p>
        
        <p>Ce modèle offre un <strong>excellent rapport qualité-prix</strong> et bénéficie d'une conception robuste pour un usage intensif quotidien. Fabriqué en Europe selon les normes les plus strictes, il représente le choix idéal pour les professionnels exigeants.</p>
        
        <p><strong>Points forts du produit :</strong></p>
        <ul>
          <li><strong>Capacité de levage :</strong> 4 tonnes pour véhicules légers et utilitaires légers</li>
          <li><strong>Hauteur de levée maximale :</strong> 1.95m pour un accès confortable sous le véhicule</li>
          <li><strong>Système hydraulique haute performance</strong> avec synchronisation parfaite des colonnes</li>
          <li><strong>Sécurité anti-chute</strong> à verrouillage automatique sur chaque colonne</li>
          <li><strong>Bras de levage asymétriques</strong> pour faciliter l'ouverture des portières</li>
          <li><strong>Patins caoutchouc réglables</strong> pour s'adapter à tous types de véhicules</li>
          <li><strong>Commande bimanuelle</strong> pour une sécurité optimale de l'opérateur</li>
        </ul>
        
        <p><strong>Installation et mise en service :</strong></p>
        <p>L'installation est réalisée par nos techniciens qualifiés dans un délai de 2 à 3 semaines après validation de la commande. La mise en service comprend une formation complète de votre équipe et la remise de tous les documents de conformité CE.</p>
        
        <p><strong>Garantie et SAV :</strong></p>
        <p>Ce pont élévateur bénéficie d'une garantie constructeur de 2 ans pièces et main d'œuvre. Notre réseau de techniciens intervient sous 48h sur toute la France métropolitaine. Les pièces détachées sont disponibles pendant 10 ans minimum.</p>
        
        <p>Idéal pour les garages automobiles, centres de contrôle technique, concessions automobiles et ateliers de mécanique générale recherchant un équipement fiable et durable.</p>
      `,
      specs: [
        { label: "Capacité", value: "4 tonnes", matches: true, isRequested: true },
        { label: "Type", value: "2 colonnes", matches: true, isRequested: true },
        { label: "Traverse", value: "Supérieure", matches: true, isRequested: true },
        { label: "Alimentation", value: "400V triphasé", matches: true, isRequested: true },
        { label: "Hauteur de levée", value: "1.95m", matches: true, isRequested: true },
        { label: "Véhicules compatibles", value: "Citadines, Berlines, SUV, Utilitaires légers", isRequested: false },
        { label: "Certifications et normes de sécurité", value: "CE, ISO 9001", isRequested: false },
        { label: "Garantie", value: "2 ans pièces et main d'œuvre", isRequested: false },
      ],
      supplier: {
        name: "PROVAC",
        description: "Spécialiste français de l'équipement de garage depuis 1985. Nous proposons une gamme complète de ponts élévateurs, équilibreuses et démonte-pneus. Service après-vente réactif et pièces détachées disponibles.",
        location: "Créteil (94)",
        responseTime: "< 2h",
        logo: logoProvac,
        rating: 4.8,
        reviewCount: 127,
        yearsActive: 39,
        certifications: ["ISO 9001", "CE"],
      },
      price: { amount: 4500 },
    },
    {
      id: "2",
      productName: "Pont 2 colonnes hydraulique 4T",
      supplierName: "GARAGE ÉQUIPEMENT",
      rating: 4.5,
      distance: 50,
      matchScore: 85,
      image: productLift2,
      images: [productLift2, productLift4],
      isRecommended: true,
      matchGaps: ["Hauteur levée 1.80m (demandé 1.90m)", "Garantie non renseignée"],
      description: "Pont élévateur 2 colonnes avec système hydraulique synchronisé. Structure renforcée en acier haute résistance. Convient aux véhicules légers et utilitaires jusqu'à 4 tonnes.",
      specs: [
        { label: "Capacité", value: "4 tonnes", matches: true },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.80m", matches: false, expected: "1.90m" },
        { label: "Garantie", value: "Non renseigné", matches: undefined },
      ],
      supplier: {
        name: "NUSSBAUM",
        description: "Distributeur agréé d'équipements pour ateliers mécaniques. Large choix de ponts élévateurs et outillage professionnel.",
        location: "Nanterre (92)",
        responseTime: "< 4h",
        logo: logoNussbaum,
        rating: 4.5,
        reviewCount: 89,
        yearsActive: 25,
        certifications: ["CE", "NF"],
      },
      price: { amount: 3800 },
    },
    {
      id: "3",
      productName: "Élévateur 2 colonnes traverse haute",
      supplierName: "AUTOMOTIVE PRO",
      rating: 4.3,
      distance: 42,
      matchScore: 80,
      image: productLift3,
      images: [productLift3, productLift1],
      isRecommended: true,
      isCertified: true,
      matchGaps: ["Capacité 3.5T (demandé 4T)", "Délai livraison non renseigné"],
      description: "Élévateur électro-hydraulique 2 colonnes avec traverse haute. Design compact adapté aux espaces réduits. Bras asymétriques pour un accès facilité aux portières.",
      specs: [
        { label: "Capacité", value: "3.5 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.95m", matches: true },
        { label: "Délai de livraison", value: "Non renseigné", matches: undefined },
      ],
      supplier: {
        name: "RAVAGLIOLI",
        description: "Fournisseur d'équipements professionnels pour l'automobile. Solutions sur mesure pour garages et concessionnaires.",
        location: "Versailles (78)",
        responseTime: "< 6h",
        logo: logoRavaglioli,
        rating: 4.3,
        reviewCount: 64,
        yearsActive: 18,
        certifications: ["CE", "ISO 14001"],
      },
      price: { amount: 4200, isStartingFrom: true },
    },
    {
      id: "4",
      productName: "Pont élévateur professionnel 4T",
      supplierName: "LIFTPRO FRANCE",
      rating: 4.1,
      distance: 65,
      matchScore: 72,
      image: productLift4,
      images: [productLift4, productLift5, productLift6],
      isRecommended: true,
      matchGaps: ["Capacité 3.5T (demandé 4T)", "Distance 65km"],
      description: "Pont élévateur robuste pour usage intensif. Motorisation puissante et silencieuse. Installation et mise en service incluses.",
      specs: [
        { label: "Capacité", value: "3.5 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.85m", matches: true },
      ],
      supplier: {
        name: "LIFTPRO FRANCE",
        description: "Importateur et distributeur de ponts élévateurs européens. Réseau de techniciens pour l'installation et la maintenance.",
        location: "Meaux (77)",
        responseTime: "< 24h",
        rating: 4.1,
        reviewCount: 52,
        yearsActive: 12,
        certifications: ["CE"],
      },
    },
  ];
  
  const OTHER_SUPPLIERS: Supplier[] = [
    {
      id: "5",
      productName: "Pont garage 2 colonnes",
      supplierName: "MECATOOLS",
      rating: 3.9,
      distance: 90,
      matchScore: 58,
      image: productLift5,
      images: [productLift5],
      isRecommended: false,
      matchGaps: ["Capacité 3T (demandé 4T)", "Distance 90km", "Traverse basse", "Garantie non renseignée"],
      description: "Pont élévateur entrée de gamme pour petits garages. Adapté aux véhicules légers uniquement.",
      specs: [
        { label: "Capacité", value: "3 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Basse", matches: false, expected: "Supérieure" },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.75m", matches: true },
        { label: "Garantie", value: "Non renseigné", matches: undefined },
      ],
      supplier: {
        name: "MECATOOLS",
        description: "Vente d'outillage et équipements pour ateliers. Prix compétitifs.",
        location: "Orléans (45)",
        responseTime: "< 48h",
        rating: 3.9,
        reviewCount: 34,
        yearsActive: 8,
        certifications: ["CE"],
      },
    },
    {
      id: "6",
      productName: "Élévateur auto 4T basique",
      supplierName: "AUTOEQUIP",
      rating: 3.7,
      distance: 120,
      matchScore: 52,
      image: productLift6,
      images: [productLift6, productLift7],
      isRecommended: false,
      matchGaps: ["Distance 120km", "230V (demandé 400V)"],
      description: "Pont élévateur économique. Alimentation monophasée, idéal pour les particuliers et petits ateliers.",
      specs: [
        { label: "Capacité", value: "4 tonnes", matches: true },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "230V monophasé", matches: false, expected: "400V triphasé" },
        { label: "Hauteur de levée", value: "1.90m", matches: true },
      ],
      supplier: {
        name: "AUTOEQUIP",
        description: "Équipements automobile à prix discount. Livraison France entière.",
        location: "Chartres (28)",
        responseTime: "< 48h",
        rating: 3.7,
        reviewCount: 28,
        yearsActive: 6,
        certifications: ["CE"],
      },
    },
    {
      id: "7",
      productName: "Pont élévateur économique",
      supplierName: "DISCOUNT GARAGE",
      rating: 3.5,
      distance: 80,
      matchScore: 45,
      image: productLift7,
      images: [productLift7],
      isRecommended: false,
      matchGaps: ["Capacité 2.5T (demandé 4T)", "Sans traverse"],
      description: "Solution économique pour levage occasionnel. Garantie limitée 1 an.",
      specs: [
        { label: "Capacité", value: "2.5 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Sans", matches: false, expected: "Supérieure" },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.70m", matches: true },
      ],
      supplier: {
        name: "DISCOUNT GARAGE",
        description: "Import direct de matériel garage. Petit prix, stock limité.",
        location: "Évry (91)",
        responseTime: "2-3 jours",
        rating: 3.5,
        reviewCount: 19,
        yearsActive: 4,
        certifications: [],
      },
    },
    {
      id: "8",
      productName: "Pont 2 colonnes PRO-LIFT",
      supplierName: "PROLIFT EUROPE",
      rating: 4.0,
      distance: 150,
      matchScore: 55,
      image: productLift1,
      images: [productLift1, productLift2],
      isRecommended: false,
      matchGaps: ["Distance 150km", "Capacité 3.5T"],
      description: "Pont élévateur importé d'Italie. Qualité professionnelle à prix compétitif.",
      specs: [
        { label: "Capacité", value: "3.5 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.85m", matches: true },
      ],
      supplier: {
        name: "PROLIFT EUROPE",
        description: "Importateur européen d'équipements de garage.",
        location: "Lyon (69)",
        responseTime: "< 24h",
        rating: 4.0,
        reviewCount: 45,
        yearsActive: 10,
        certifications: ["CE"],
      },
    },
    {
      id: "9",
      productName: "Élévateur TITAN 4000",
      supplierName: "TITAN ÉQUIPEMENT",
      rating: 3.8,
      distance: 110,
      matchScore: 48,
      image: productLift3,
      images: [productLift3],
      isRecommended: false,
      matchGaps: ["Distance 110km", "Traverse basse"],
      description: "Pont robuste pour usage intensif. Structure renforcée.",
      specs: [
        { label: "Capacité", value: "4 tonnes", matches: true },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Basse", matches: false, expected: "Supérieure" },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.90m", matches: true },
      ],
      supplier: {
        name: "TITAN ÉQUIPEMENT",
        description: "Spécialiste du matériel lourd pour garages.",
        location: "Marseille (13)",
        responseTime: "< 48h",
        rating: 3.8,
        reviewCount: 31,
        yearsActive: 7,
        certifications: ["CE"],
      },
    },
    {
      id: "10",
      productName: "Pont RAPIDO 2C",
      supplierName: "RAPIDO GARAGE",
      rating: 3.6,
      distance: 95,
      matchScore: 42,
      image: productLift4,
      images: [productLift4],
      isRecommended: false,
      matchGaps: ["Capacité 3T", "Sans options"],
      description: "Solution d'entrée de gamme pour petits garages.",
      specs: [
        { label: "Capacité", value: "3 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "1.75m", matches: true },
      ],
      supplier: {
        name: "RAPIDO GARAGE",
        description: "Équipements garage à prix accessibles.",
        location: "Toulouse (31)",
        responseTime: "2-3 jours",
        rating: 3.6,
        reviewCount: 22,
        yearsActive: 5,
        certifications: [],
      },
    },
    {
      id: "11",
      productName: "Pont MASTER PRO 4T",
      supplierName: "MASTER ÉQUIP",
      rating: 4.2,
      distance: 180,
      matchScore: 60,
      image: productLift5,
      images: [productLift5, productLift6],
      isRecommended: false,
      isCertified: true,
      matchGaps: ["Distance 180km"],
      description: "Pont haut de gamme avec toutes les options. Installation incluse.",
      specs: [
        { label: "Capacité", value: "4 tonnes", matches: true },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Supérieure", matches: true },
        { label: "Alimentation", value: "400V triphasé", matches: true },
        { label: "Hauteur de levée", value: "2.00m", matches: true },
      ],
      supplier: {
        name: "MASTER ÉQUIP",
        description: "Fournisseur premium d'équipements professionnels.",
        location: "Bordeaux (33)",
        responseTime: "< 4h",
        rating: 4.2,
        reviewCount: 76,
        yearsActive: 15,
        certifications: ["ISO 9001", "CE"],
      },
    },
    {
      id: "12",
      productName: "Élévateur BUDGET-LIFT",
      supplierName: "BUDGET AUTO",
      rating: 3.3,
      distance: 70,
      matchScore: 38,
      image: productLift6,
      images: [productLift6],
      isRecommended: false,
      matchGaps: ["Capacité 2.5T", "230V mono", "Sans traverse"],
      description: "Option la plus économique du marché.",
      specs: [
        { label: "Capacité", value: "2.5 tonnes", matches: false, expected: "4 tonnes" },
        { label: "Type", value: "2 colonnes", matches: true },
        { label: "Traverse", value: "Sans", matches: false, expected: "Supérieure" },
        { label: "Alimentation", value: "230V monophasé", matches: false, expected: "400V triphasé" },
        { label: "Hauteur de levée", value: "1.65m", matches: true },
      ],
      supplier: {
        name: "BUDGET AUTO",
        description: "Le moins cher du marché, qualité basique.",
        location: "Nantes (44)",
        responseTime: "3-5 jours",
        rating: 3.3,
        reviewCount: 15,
        yearsActive: 3,
        certifications: [],
      },
    },
  ];

  const { matchingResults } = useFlowStore();

  // if (!matchingResults) {
  //   return <div>Chargement ou redirection...</div>;
  // }

  //tODO changer RECOMMENDED_SUPPLIERS par result matchingResults

  return (
    <SupplierSelectionModal
      RECOMMENDED_SUPPLIERS={RECOMMENDED_SUPPLIERS}
      OTHER_SUPPLIERS={OTHER_SUPPLIERS}
      userAnswers={userAnswers}
      onBackToQuestionnaire={handleBackToQuestionnaire}
    />
  );
}
