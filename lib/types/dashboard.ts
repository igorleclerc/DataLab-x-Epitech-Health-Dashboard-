export type DataType = 'grippe-vaccination' | 'hpv-vaccination' | 'covid-vaccination' | 'meningocoque-vaccination' | 'flu-surveillance'
export type ViewType = 'map' | 'statistics' | 'analytics'

export interface VaccineTypeData {
  grippe65ansPlus: number
  grippeMoins65: number
  hpvFilles: number
  hpvGarcons: number
  meningocoque: number
  covid19: number
}

export interface VaccineInfo {
  id: DataType
  name: string
  description: string
  targetPopulation: string
  objective: number
  unit: string
  color: string
}

export interface DepartmentData {
  code: string
  name: string
  population?: number
  vaccinationCoverage?: number
  fluActivity?: number
  year?: number
  ageGroups?: {
    '65+': number
    '<65': number
  }
  vaccineTypes?: VaccineTypeData
  fluDetails?: {
    urgencyVisits: number
    hospitalizations: number
    sosConsultations: number
    weeklyTrend: 'up' | 'down' | 'stable'
    seasonalComparison: number // Comparaison avec la même période l'année précédente
  }
  ranking?: number
  percentile?: number
}

export interface NationalStats {
  totalPopulation: number
  overallCoverage: number
  averageFluActivity: number
  ageGroupBreakdown: {
    '65+': number
    '<65': number
  }
  trend: 'up' | 'down' | 'stable'
}

export interface DepartmentStats {
  department: DepartmentData
  nationalComparison: {
    coverageVsNational: number
    populationRank: number
    performancePercentile: number
  }
  demographics: {
    ageGroups: Array<{
      group: string
      value: number
      percentage: number
    }>
  }
  trends: {
    coverage: 'up' | 'down' | 'stable'
    fluActivity: 'up' | 'down' | 'stable'
  }
}

export interface ColorScale {
  domain: [number, number]
  range: [string, string]
  steps: number
}

export interface MapTooltipData {
  departmentName: string
  primaryMetric: number
  population: number
  rank?: number
}