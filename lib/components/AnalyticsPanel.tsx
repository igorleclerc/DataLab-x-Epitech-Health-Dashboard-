'use client'

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ComposedChart
} from 'recharts'
import { TrendingUp, Users, Activity, Syringe, AlertTriangle, Info, HelpCircle } from 'lucide-react'
import { ChartExplanation } from './ChartExplanation'
import type { DepartmentData, DataType } from '@/lib/types/dashboard'

interface AnalyticsPanelProps {
  dataType: DataType
  departmentData: DepartmentData[]
  selectedDepartment: string | null
}

export function AnalyticsPanel({ dataType, departmentData, selectedDepartment }: AnalyticsPanelProps) {
  
  const isVaccination = dataType !== 'flu-surveillance'
  const isFluSurveillance = dataType === 'flu-surveillance'
  
  // 1. Classement des départements (Top 10 et Bottom 5)
  const sortedDepartments = [...departmentData].sort((a, b) => {
    const aValue = isVaccination ? (a.vaccinationCoverage || 0) : (a.fluActivity || 0)
    const bValue = isVaccination ? (b.vaccinationCoverage || 0) : (b.fluActivity || 0)
    return isVaccination ? bValue - aValue : aValue - bValue // Pour grippe, plus bas = mieux
  })

  const performanceData = [
    ...sortedDepartments.slice(0, 10).map((dept, index) => ({
      name: dept.name.length > 15 ? dept.name.substring(0, 15) + '...' : dept.name,
      value: isVaccination ? dept.vaccinationCoverage : dept.fluActivity,
      population: dept.population,
      type: 'top',
      rank: index + 1
    })),
    ...sortedDepartments.slice(-5).map((dept, index) => ({
      name: dept.name.length > 15 ? dept.name.substring(0, 15) + '...' : dept.name,
      value: isVaccination ? dept.vaccinationCoverage : dept.fluActivity,
      population: dept.population,
      type: 'bottom',
      rank: sortedDepartments.length - 4 + index
    }))
  ]

  // 2. Distribution des performances par tranches (pour vaccination seulement)
  const getVaccinationDistributionData = () => {
    if (!isVaccination) return []
    
    const ranges = [
      { range: '< 50%', min: 0, max: 50, color: '#ef4444' },
      { range: '50-60%', min: 50, max: 60, color: '#f59e0b' },
      { range: '60-70%', min: 60, max: 70, color: '#eab308' },
      { range: '70-80%', min: 70, max: 80, color: '#22c55e' },
      { range: '≥ 80%', min: 80, max: 100, color: '#16a34a' }
    ]

    return ranges.map(range => ({
      range: range.range,
      count: departmentData.filter(dept => {
        const value = dept.vaccinationCoverage
        return value !== undefined && value >= range.min && value < range.max
      }).length,
      color: range.color
    }))
  }

  // 3. Données pour les indicateurs de surveillance grippe
  const getFluIndicatorsData = () => {
    if (!isFluSurveillance) return []
    
    const avgUrgency = departmentData.reduce((sum, d) => sum + (d.fluDetails?.urgencyVisits || 0), 0) / departmentData.length
    const avgHospitalizations = departmentData.reduce((sum, d) => sum + (d.fluDetails?.hospitalizations || 0), 0) / departmentData.length
    const avgSOS = departmentData.reduce((sum, d) => sum + (d.fluDetails?.sosConsultations || 0), 0) / departmentData.length

    return [
      { indicator: 'Urgences', value: avgUrgency, color: '#ef4444' },
      { indicator: 'Hospitalisations', value: avgHospitalizations, color: '#dc2626' },
      { indicator: 'SOS Médecins', value: avgSOS, color: '#f59e0b' }
    ]
  }

  // 3. Distribution des performances par tranches
  const getDistributionData = () => {
    const ranges = dataType === 'vaccination' 
      ? [
          { range: '< 50%', min: 0, max: 50, color: '#ef4444' },
          { range: '50-60%', min: 50, max: 60, color: '#f59e0b' },
          { range: '60-70%', min: 60, max: 70, color: '#eab308' },
          { range: '70-80%', min: 70, max: 80, color: '#22c55e' },
          { range: '≥ 80%', min: 80, max: 100, color: '#16a34a' }
        ]
      : [
          { range: '< 20', min: 0, max: 20, color: '#16a34a' },
          { range: '20-40', min: 20, max: 40, color: '#22c55e' },
          { range: '40-60', min: 40, max: 60, color: '#eab308' },
          { range: '60-80', min: 60, max: 80, color: '#f59e0b' },
          { range: '≥ 80', min: 80, max: 200, color: '#ef4444' }
        ]

    return ranges.map(range => ({
      range: range.range,
      count: departmentData.filter(dept => {
        const value = dataType === 'vaccination' ? dept.vaccinationCoverage : dept.fluActivity
        return value !== undefined && value >= range.min && value < range.max
      }).length,
      color: range.color
    }))
  }

  // 4. Évolution saisonnière réaliste
  const seasonalData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    let vaccinationBase = 65 // Base de 65%
    let fluBase = 25 // Base de 25/100k
    
    // Saisonnalité vaccination (pic automne/hiver)
    if (month >= 9 || month <= 2) vaccinationBase += 15 // Campagne grippe
    if (month >= 6 && month <= 8) vaccinationBase -= 10 // Été plus faible
    
    // Saisonnalité grippe (pic hiver)
    if (month >= 11 || month <= 3) fluBase += 30 // Pic hivernal
    if (month >= 5 && month <= 9) fluBase -= 15 // Été plus faible
    
    return {
      month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i],
      vaccination: vaccinationBase + (Math.random() - 0.5) * 8,
      grippe: fluBase + (Math.random() - 0.5) * 12,
      objectifVaccination: 75,
      seuilAlerteGrippe: 50
    }
  })

  // 5. Analyse par types de vaccins (données réelles moyennes)
  const vaccineTypesData = dataType === 'vaccination' ? 
    departmentData.reduce((acc, dept) => {
      if (dept.vaccineTypes) {
        acc.grippe65Plus += dept.vaccineTypes.grippe65Plus
        acc.grippeMoins65 += dept.vaccineTypes.grippeMoins65
        acc.hpvFilles += dept.vaccineTypes.hpvFilles
        acc.hpvGarcons += dept.vaccineTypes.hpvGarcons
        acc.meningocoque += dept.vaccineTypes.meningocoque
        acc.covid19 += dept.vaccineTypes.covid19
        acc.count++
      }
      return acc
    }, { grippe65Plus: 0, grippeMoins65: 0, hpvFilles: 0, hpvGarcons: 0, meningocoque: 0, covid19: 0, count: 0 })
    : null

  const vaccineChartData = vaccineTypesData ? [
    { name: 'Grippe 65+', value: (vaccineTypesData.grippe65Plus / vaccineTypesData.count).toFixed(1), color: '#3b82f6', target: 75 },
    { name: 'COVID-19', value: (vaccineTypesData.covid19 / vaccineTypesData.count).toFixed(1), color: '#ef4444', target: 80 },
    { name: 'HPV Filles', value: (vaccineTypesData.hpvFilles / vaccineTypesData.count).toFixed(1), color: '#f59e0b', target: 60 },
    { name: 'Méningocoque', value: (vaccineTypesData.meningocoque / vaccineTypesData.count).toFixed(1), color: '#10b981', target: 70 },
    { name: 'Grippe <65', value: (vaccineTypesData.grippeMoins65 / vaccineTypesData.count).toFixed(1), color: '#60a5fa', target: 30 },
    { name: 'HPV Garçons', value: (vaccineTypesData.hpvGarcons / vaccineTypesData.count).toFixed(1), color: '#fbbf24', target: 60 }
  ] : []

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Analyses Avancées
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {dataType === 'vaccination' ? 'Analyses de la couverture vaccinale' : 'Analyses de la surveillance grippale'}
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* 1. Performance des départements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Classement des Départements - {isVaccination ? 'Couverture Vaccinale' : 'Activité Grippale'}
            </h3>
            <ChartExplanation
              title="Classement des Départements"
              explanation={isVaccination 
                ? "Ce graphique compare les 10 meilleurs et 5 moins performants départements en termes de couverture vaccinale. Une couverture élevée indique une meilleure protection de la population."
                : "Ce graphique montre les départements avec la plus faible et la plus forte activité grippale. Une activité faible indique moins de cas de grippe diagnostiqués."
              }
              insights={isVaccination 
                ? [
                    "Les départements en vert ont une couverture élevée",
                    "Les départements en rouge nécessitent des actions prioritaires",
                    "Les disparités peuvent s'expliquer par l'accessibilité, la démographie ou les campagnes locales"
                  ]
                : [
                    "Les départements en vert ont une faible circulation grippale",
                    "Les départements en rouge montrent une forte activité épidémique",
                    "L'activité varie selon la saison, la densité de population et les mesures préventives"
                  ]
              }
            />
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis 
                  label={{ 
                    value: isVaccination ? 'Couverture (%)' : 'Cas (/100k)', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value?.toFixed(1)}${isVaccination ? '%' : '/100k'}`,
                    isVaccination ? 'Couverture' : 'Cas diagnostiqués',
                    `Rang: ${props.payload.rank}/${departmentData.length}`
                  ]}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {performanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.type === 'top' ? '#22c55e' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Distribution des performances - Seulement si pertinent */}
        {isVaccination && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Distribution des Départements par Niveau de Couverture
              </h3>
              <ChartExplanation
                title="Distribution des Performances"
                explanation="Ce graphique montre combien de départements se situent dans chaque tranche de couverture vaccinale, permettant d'identifier les zones d'amélioration prioritaires."
                insights={[
                  "Rouge (<50%) : Départements nécessitant une intervention urgente",
                  "Orange/Jaune (50-70%) : Départements à améliorer progressivement", 
                  "Vert (>70%) : Départements atteignant les objectifs de santé publique",
                  "L'objectif est d'avoir le maximum de départements en vert"
                ]}
              />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getVaccinationDistributionData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis label={{ value: 'Nombre de départements', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} départements`, 'Nombre']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {getVaccinationDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Analyse spécifique à la surveillance grippe */}
        {isFluSurveillance && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Répartition des Indicateurs de Surveillance
              </h3>
              <ChartExplanation
                title="Indicateurs de Surveillance Grippe"
                explanation="Ce graphique montre la répartition des différents indicateurs de surveillance grippale : passages aux urgences, hospitalisations et consultations SOS Médecins."
                insights={[
                  "Les consultations SOS Médecins sont généralement les plus nombreuses",
                  "Les passages aux urgences indiquent la gravité des cas",
                  "Les hospitalisations représentent les cas les plus sévères",
                  "Ces indicateurs permettent de suivre l'évolution de l'épidémie"
                ]}
              />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getFluIndicatorsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="indicator" />
                  <YAxis label={{ value: 'Moyenne nationale (/100k)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {getFluIndicatorsData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}



        {/* 4. Indicateurs clés simplifiés */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Indicateurs Clés
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {departmentData.length}
              </div>
              <div className="text-sm text-gray-600">Départements analysés</div>
            </div>

            {isVaccination && (
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-3">
                  <Syringe className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {(departmentData.reduce((sum, d) => sum + (d.vaccinationCoverage || 0), 0) / departmentData.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Couverture moyenne</div>
              </div>
            )}

            {isFluSurveillance && (
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-3">
                  <Activity className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {(departmentData.reduce((sum, d) => sum + (d.fluActivity || 0), 0) / departmentData.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Cas moyens (/100k)</div>
              </div>
            )}

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isVaccination 
                  ? departmentData.filter(d => (d.vaccinationCoverage || 0) < 50).length
                  : departmentData.filter(d => (d.fluActivity || 0) > 50).length
                }
              </div>
              <div className="text-sm text-gray-600">
                {isVaccination ? 'Dép. faible couverture' : 'Dép. forte activité'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}