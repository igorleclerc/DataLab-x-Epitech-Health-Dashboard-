export interface FluSurveillanceNationalData {
  premierJourSemaine: string;
  semaine: string;
  classeAge: string;
  tauxPassagesUrgences: number;
  tauxHospitalisations: number;
  tauxActesSOS: number;
}

export interface FluSurveillanceDepartmentalData {
  premierJourSemaine: string;
  semaine: string;
  departementCode: string;
  departement: string;
  classeAge: string;
  tauxPassagesUrgences: number;
  tauxHospitalisations: number;
  tauxActesSOS: number;
  region: string;
  regionCode: string;
}

export interface Department {
  code: string;
  name: string;
  region: string;
  regionCode: string;
}

export interface FluAgeGroup {
  key: string;
  label: string;
}

export const GROUPES_AGE_GRIPPE: FluAgeGroup[] = [
  { key: '00-04 ans', label: '0-4 ans' },
  { key: '05-14 ans', label: '5-14 ans' },
  { key: '15-64 ans', label: '15-64 ans' },
  { key: '65 ans ou plus', label: '65 ans et plus' },
  { key: 'Tous âges', label: 'Tous âges' },
];

export const METRIQUES_GRIPPE = {
  tauxPassagesUrgences: 'Taux de passages aux urgences pour grippe',
  tauxHospitalisations: 'Taux d\'hospitalisations après passages aux urgences pour grippe',
  tauxActesSOS: 'Taux d\'actes médicaux SOS Médecins pour grippe',
} as const;