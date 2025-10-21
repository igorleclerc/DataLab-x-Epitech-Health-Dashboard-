export const TEXTES_INTERFACE = {
  // Navigation et titre
  titre: 'Tableau de Bord Vaccination et Grippe',
  sousTitre: 'Données de surveillance épidémiologique - France',
  
  // Sections principales
  sections: {
    vaccination: 'Vaccination',
    grippe: 'Surveillance Grippe',
    predictions: 'Prédictions',
  },
  
  // Filtres
  filtres: {
    titre: 'Filtres',
    annees: 'Années',
    regions: 'Régions',
    groupesAge: 'Groupes d\'âge',
    periode: 'Période',
    toutSelectionner: 'Tout sélectionner',
    aucuneSelection: 'Aucune sélection',
    appliquer: 'Appliquer',
    reinitialiser: 'Réinitialiser',
  },
  
  // Vaccination
  vaccination: {
    couverture: 'Couverture Vaccinale',
    campagnes: 'Progression des Campagnes',
    demographics: 'Répartition Démographique',
    geographique: 'Vue Géographique',
    actes: 'Actes de Vaccination',
    doses: 'Doses Administrées',
    objectifs: 'Objectifs vs Réalisé',
  },
  
  // Grippe
  grippe: {
    urgences: 'Passages aux Urgences',
    hospitalisations: 'Hospitalisations',
    sosmedecins: 'Consultations SOS Médecins',
    tendances: 'Tendances Hebdomadaires',
    comparaisonRegionale: 'Comparaison Régionale',
    repartitionAge: 'Répartition par Âge',
  },
  
  // États de chargement et erreurs
  etats: {
    chargement: 'Chargement des données...',
    erreurChargement: 'Erreur lors du chargement des données',
    aucuneDonnee: 'Aucune donnée disponible',
    donneesIncompletes: 'Données incomplètes',
    reessayer: 'Réessayer',
  },
  
  // Qualité des données
  qualite: {
    titre: 'Qualité des Données',
    succes: 'Données valides',
    erreur: 'Erreur de validation',
    avertissement: 'Données partielles',
    derniereMiseAJour: 'Dernière mise à jour',
    nombreEnregistrements: 'Nombre d\'enregistrements',
  },
  
  // Graphiques
  graphiques: {
    legende: 'Légende',
    axeX: 'Axe X',
    axeY: 'Axe Y',
    valeur: 'Valeur',
    date: 'Date',
    region: 'Région',
    pourcentage: 'Pourcentage',
    nombre: 'Nombre',
    taux: 'Taux',
    zoom: 'Zoomer',
    reinitialiserZoom: 'Réinitialiser le zoom',
    telecharger: 'Télécharger',
    pleinEcran: 'Plein écran',
  },
  
  // Unités et formats
  unites: {
    pourcentage: '%',
    milliers: 'k',
    millions: 'M',
    parSemaine: 'par semaine',
    par100k: 'pour 100 000 habitants',
    doses: 'doses',
    actes: 'actes',
  },
  
  // Mois en français
  mois: {
    janvier: 'Janvier',
    fevrier: 'Février',
    mars: 'Mars',
    avril: 'Avril',
    mai: 'Mai',
    juin: 'Juin',
    juillet: 'Juillet',
    aout: 'Août',
    septembre: 'Septembre',
    octobre: 'Octobre',
    novembre: 'Novembre',
    decembre: 'Décembre',
  },
  
  // Jours de la semaine
  jours: {
    lundi: 'Lundi',
    mardi: 'Mardi',
    mercredi: 'Mercredi',
    jeudi: 'Jeudi',
    vendredi: 'Vendredi',
    samedi: 'Samedi',
    dimanche: 'Dimanche',
  },
} as const;