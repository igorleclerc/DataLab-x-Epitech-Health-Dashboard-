import type { VaccineInfo, DataType } from '@/lib/types/dashboard'

export const VACCINE_CONFIG: Record<DataType, VaccineInfo> = {
  'grippe-vaccination': {
    id: 'grippe-vaccination',
    name: 'Vaccination Grippe',
    description: 'Vaccination antigrippale saisonnière',
    targetPopulation: '65 ans et plus + personnes à risque',
    objective: 75,
    unit: '%',
    color: '#000091' // Bleu France
  },
  'hpv-vaccination': {
    id: 'hpv-vaccination',
    name: 'Vaccination HPV',
    description: 'Vaccination contre le papillomavirus humain',
    targetPopulation: 'Adolescents 11-14 ans (filles et garçons)',
    objective: 60,
    unit: '%',
    color: '#18753c' // Vert gouvernemental
  },
  'covid-vaccination': {
    id: 'covid-vaccination',
    name: 'Vaccination COVID-19',
    description: 'Vaccination contre le SARS-CoV-2',
    targetPopulation: 'Population générale 12 ans et plus',
    objective: 80,
    unit: '%',
    color: '#0063cb' // Bleu info gouvernemental
  },
  'meningocoque-vaccination': {
    id: 'meningocoque-vaccination',
    name: 'Vaccination Méningocoque',
    description: 'Vaccination contre les méningites à méningocoque C',
    targetPopulation: 'Nourrissons et jeunes adultes',
    objective: 70,
    unit: '%',
    color: '#fc5d00' // Orange gouvernemental
  },
  'flu-surveillance': {
    id: 'flu-surveillance',
    name: 'Surveillance Grippe',
    description: 'Surveillance épidémiologique des cas de grippe',
    targetPopulation: 'Cas de grippe diagnostiqués',
    objective: 50, // Seuil épidémique (pas un objectif vaccinal)
    unit: '/100k',
    color: '#e1000f' // Rouge Marianne
  }
}

export const VACCINATION_TYPES: DataType[] = [
  'grippe-vaccination',
  'hpv-vaccination', 
  'covid-vaccination',
  'meningocoque-vaccination'
]

export const SURVEILLANCE_TYPES: DataType[] = [
  'flu-surveillance'
]

export const ALL_DATA_TYPES: DataType[] = [
  ...VACCINATION_TYPES,
  ...SURVEILLANCE_TYPES
]