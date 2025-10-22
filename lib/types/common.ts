export interface EtatFiltres {
  annees: string[];
  regions: string[];
  groupesAge: string[];
  periodeDate: {
    debut: string;
    fin: string;
  };
}

export interface ResultatValidation {
  estValide: boolean;
  erreurs: string[];
  avertissements: string[];
  statutFichiers: Record<string, 'succes' | 'erreur' | 'avertissement'>;
}

export interface IndicateurQualiteDonnees {
  nomFichier: string;
  statut: 'succes' | 'erreur' | 'avertissement';
  message: string;
  nombreEnregistrements: number;
  derniereMiseAJour: string;
}

export interface ProprietesGraphique {
  donnees: any[];
  type: 'ligne' | 'barres' | 'aire' | 'secteurs';
  filtres: EtatFiltres;
  surChangementFiltre: (filtres: EtatFiltres) => void;
  chargement?: boolean;
  erreur?: string;
}

export interface PaletteCouleurs {
  primaire: string;
  arrierePlan: string;
  accent: string;
  nuancesPrimaires: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  nuancesAccent: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
}

export const PALETTE_COULEURS: PaletteCouleurs = {
  primaire: '#10162F',
  arrierePlan: '#FFFFFF',
  accent: '#B01E09',
  nuancesPrimaires: {
    50: '#f0f1f7',
    100: '#e1e4ef',
    500: '#10162F',
    600: '#0d1228',
    700: '#0a0e21',
  },
  nuancesAccent: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#B01E09',
    600: '#991b1b',
    700: '#7f1d1d',
  },
};