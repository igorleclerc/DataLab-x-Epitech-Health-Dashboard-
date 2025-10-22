export interface VaccinationCampaignData {
  campagne: string;
  date: string;
  variable: 'ACTE(VGP)' | 'DOSES(J07E1)' | 'UNIVERS' | 'PHARMACIES';
  valeur: number;
  cible: number;
}

export interface VaccinationCoverageData {
  region: string;
  code: string;
  variable: 'ACTE(VGP)' | 'DOSES(J07E1)';
  groupe: '65 ans et plus' | 'moins de 65 ans';
  valeur: number;
}

export interface VaccinationDosesActesData {
  campagne: string;
  date: string;
  jour: number;
  variable: 'ACTE(VGP)' | 'DOSES(J07E1)';
  groupe: '65 ans et plus' | 'moins de 65 ans';
  valeur: number;
}

export interface Region {
  code: string;
  name: string;
}

export interface AgeGroup {
  key: string;
  label: string;
}

export const GROUPES_AGE: AgeGroup[] = [
  { key: '65 ans et plus', label: '65 ans et plus' },
  { key: 'moins de 65 ans', label: 'Moins de 65 ans' },
];

export const VARIABLES_VACCINATION = {
  'ACTE(VGP)': 'Actes de vaccination grippe',
  'DOSES(J07E1)': 'Doses administrées',
  'UNIVERS': 'Univers de vaccination',
  'PHARMACIES': 'Pharmacies participantes',
} as const;