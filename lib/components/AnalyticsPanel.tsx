'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, ScatterChart, Scatter, ComposedChart, Area, AreaChart
} from 'recharts'
import { TrendingUp, Users, Activity, AlertTriangle } from 'lucide-react'
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
  
  // Fonction helper pour formater les nombres
  const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

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
      { range: '50-60%', min: 50, max: 60, color: '#f97316' },
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

  // 4. Analyse par groupes d'âge pour vaccination grippe
  const getAgeGroupAnalysis = () => {
    if (!isVaccination) return []
    
    const ageGroupData = departmentData.reduce((acc, dept) => {
      if (dept.vaccineTypes) {
        acc.grippe65Plus += dept.vaccineTypes.grippe65Plus
        acc.grippeMoins65 += dept.vaccineTypes.grippeMoins65
        acc.count++
      }
      return acc
    }, { grippe65Plus: 0, grippeMoins65: 0, count: 0 })

    if (ageGroupData.count === 0) return []

    return [
      { 
        group: '65 ans et +', 
        coverage: ageGroupData.grippe65Plus / ageGroupData.count,
        target: 75,
        population: 'Prioritaire',
        color: '#3b82f6'
      },
      { 
        group: 'Moins de 65 ans', 
        coverage: ageGroupData.grippeMoins65 / ageGroupData.count,
        target: 30,
        population: 'Générale',
        color: '#93c5fd'
      }
    ]
  }

  // 5. Corrélation population vs couverture vaccinale
  const getPopulationCoverageData = () => {
    if (!isVaccination) return []
    
    return departmentData
      .filter(d => d.vaccinationCoverage !== undefined && d.population !== undefined)
      .map(d => ({
        name: d.name,
        population: d.population! / 1000, // En milliers
        coverage: d.vaccinationCoverage!,
        size: Math.log(d.population! / 1000) * 10 // Taille du point basée sur la population
      }))
      .slice(0, 50) // Limiter pour la lisibilité
  }

  // 6. Évolution saisonnière simulée (données réalistes)
  const getSeasonalTrend = () => {
    if (!isVaccination) return []
    
    const months = [
      'Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mars', 'Avr'
    ]
    
    // Simulation d'une campagne de vaccination grippale réaliste
    const baseData = [15, 35, 55, 68, 72, 74, 75, 75] // Progression typique
    
    return months.map((month, index) => ({
      month,
      coverage: baseData[index],
      target: 75,
      optimal: index < 3 ? baseData[index] + 5 : 75 // Courbe optimale
    }))
  }

  // 7. Analyse des types de vaccins (pour vaccination)
  const getVaccineTypesComparison = () => {
    if (!isVaccination) return []
    
    const vaccineData = departmentData.reduce((acc, dept) => {
      if (dept.vaccineTypes) {
        acc.grippe += (dept.vaccineTypes.grippe65Plus + dept.vaccineTypes.grippeMoins65) / 2
        acc.hpv += (dept.vaccineTypes.hpvFilles + dept.vaccineTypes.hpvGarcons) / 2
        acc.covid += dept.vaccineTypes.covid19
        acc.meningocoque += dept.vaccineTypes.meningocoque
        acc.count++
      }
      return acc
    }, { grippe: 0, hpv: 0, covid: 0, meningocoque: 0, count: 0 })

    if (vaccineData.count === 0) return []

    return [
      { 
        vaccine: 'Grippe', 
        coverage: vaccineData.grippe / vaccineData.count,
        target: 75,
        priority: 'Haute',
        color: '#3b82f6'
      },
      { 
        vaccine: 'COVID-19', 
        coverage: vaccineData.covid / vaccineData.count,
        target: 80,
        priority: 'Haute',
        color: '#ef4444'
      },
      { 
        vaccine: 'HPV', 
        coverage: vaccineData.hpv / vaccineData.count,
        target: 60,
        priority: 'Moyenne',
        color: '#f59e0b'
      },
      { 
        vaccine: 'Méningocoque', 
        coverage: vaccineData.meningocoque / vaccineData.count,
        target: 70,
        priority: 'Moyenne',
        color: '#10b981'
      }
    ]
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center mb-1">
          <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Analyses Avancées
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {isVaccination ? 'Analyses de la couverture vaccinale' : 'Analyses de la surveillance grippale'}
        </p>
      </div>

      {/* Organic Layout */}
      <div className="p-6 space-y-8">
          
        {/* Key Indicators - Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center mb-3">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h4 className="text-lg font-medium text-blue-900">Départements</h4>
            </div>
            <div className="text-3xl font-bold text-blue-900">{departmentData.length}</div>
            <div className="text-sm text-blue-700 mt-1">Total analysés</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center mb-3">
              <Activity className="w-6 h-6 text-green-600 mr-3" />
              <h4 className="text-lg font-medium text-green-900">Moyenne</h4>
            </div>
            <div className="text-3xl font-bold text-green-900">
              {(() => {
                const validData = departmentData.filter(d => 
                  isVaccination ? d.vaccinationCoverage !== undefined : d.fluActivity !== undefined
                )
                const avg = validData.length > 0 
                  ? validData.reduce((sum, d) => sum + (isVaccination ? (d.vaccinationCoverage || 0) : (d.fluActivity || 0)), 0) / validData.length
                  : 0
                return formatNumber(avg)
              })()}
              <span className="text-lg font-normal text-green-700 ml-1">
                {isVaccination ? '%' : '/100k'}
              </span>
            </div>
            <div className="text-sm text-green-700 mt-1">Nationale</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
              <h4 className="text-lg font-medium text-purple-900">Meilleur</h4>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {(() => {
                const best = sortedDepartments[0]
                const value = isVaccination ? best?.vaccinationCoverage : best?.fluActivity
                return value ? formatNumber(value) : 'N/A'
              })()}
              <span className="text-lg font-normal text-purple-700 ml-1">
                {isVaccination ? '%' : '/100k'}
              </span>
            </div>
            <div className="text-sm text-purple-700 mt-1">{sortedDepartments[0]?.name}</div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Classement des Départements - {isVaccination ? 'Couverture Vaccinale' : 'Activité Grippale'}
            </h3>
            <ChartExplanation
              title="Classement des Départements"
              explanation={isVaccination 
                ? "Ce graphique compare les 10 meilleurs et 5 moins performants départements en termes de couverture vaccinale."
                : "Ce graphique montre les départements avec la plus faible et la plus forte activité grippale."
              }
              insights={isVaccination 
                ? [
                    "Vert : Départements avec la meilleure couverture vaccinale",
                    "Rouge : Départements nécessitant des efforts supplémentaires",
                    "L'objectif est d'atteindre une couverture élevée pour tous"
                  ]
                : [
                    "Vert : Départements avec la plus faible activité grippale",
                    "Rouge : Départements avec la plus forte activité",
                    "L'activité varie selon la saison et les mesures préventives"
                  ]
              }
            />
          </div>
          <div className="h-80">
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

        {/* Vaccination Analysis - Multiple Charts */}
        {isVaccination && (
          <>
            {/* Age Group Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Couverture par Groupe d'Âge
                  </h3>
                  <ChartExplanation
                    title="Analyse par Âge - Grippe"
                    explanation="Comparaison de la couverture vaccinale grippe entre les groupes d'âge prioritaires."
                    insights={[
                      "65+ ans : Population prioritaire (objectif 75%)",
                      "<65 ans : Population générale (objectif 30%)",
                      "Écart important entre les groupes d'âge"
                    ]}
                  />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getAgeGroupAnalysis()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any, name: string) => [
                        `${Number(value).toFixed(1)}%`, 
                        name === 'coverage' ? 'Couverture actuelle' : 'Objectif'
                      ]} />
                      <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                        {getAgeGroupAnalysis().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Distribution par Niveau
                  </h3>
                  <ChartExplanation
                    title="Distribution des Performances"
                    explanation="Répartition des départements par tranche de couverture vaccinale."
                    insights={[
                      "Rouge (<50%) : Intervention urgente",
                      "Orange/Jaune (50-70%) : À améliorer", 
                      "Vert (>70%) : Objectifs atteints"
                    ]}
                  />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getVaccinationDistributionData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
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
            </div>

            {/* Seasonal Trend Analysis */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Évolution Saisonnière de la Vaccination Grippe
                </h3>
                <ChartExplanation
                  title="Campagne Vaccinale Saisonnière"
                  explanation="Progression de la couverture vaccinale grippe au cours de la saison."
                  insights={[
                    "Pic de vaccination en octobre-novembre",
                    "Objectif 75% à atteindre avant décembre",
                    "Courbe optimale vs réalité terrain"
                  ]}
                />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getSeasonalTrend()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any, name: string) => [
                      `${value}%`, 
                      name === 'coverage' ? 'Couverture réelle' : 
                      name === 'target' ? 'Objectif' : 'Courbe optimale'
                    ]} />
                    <Area 
                      type="monotone" 
                      dataKey="optimal" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="coverage" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-Vaccine Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Comparaison Multi-Vaccins
                  </h3>
                  <ChartExplanation
                    title="Performance par Type de Vaccin"
                    explanation="Comparaison des couvertures vaccinales par type de vaccin."
                    insights={[
                      "Grippe et COVID : priorités sanitaires",
                      "HPV : enjeu de prévention cancer",
                      "Méningocoque : protection communautaire"
                    ]}
                  />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getVaccineTypesComparison()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vaccine" />
                      <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any, name: string) => [
                        `${Number(value).toFixed(1)}%`, 
                        name === 'coverage' ? 'Couverture' : 'Objectif'
                      ]} />
                      <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                        {getVaccineTypesComparison().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Population vs Coverage Scatter */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Population vs Couverture
                  </h3>
                  <ChartExplanation
                    title="Corrélation Démographique"
                    explanation="Relation entre taille de population et performance vaccinale."
                    insights={[
                      "Taille des bulles = population",
                      "Pas de corrélation systématique",
                      "Défis spécifiques par territoire"
                    ]}
                  />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={getPopulationCoverageData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="population" 
                        type="number" 
                        domain={['dataMin', 'dataMax']}
                        label={{ value: 'Population (milliers)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        dataKey="coverage" 
                        type="number" 
                        domain={[0, 100]}
                        label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'coverage' ? `${Number(value).toFixed(1)}%` : `${Number(value).toFixed(0)}k`,
                          name === 'coverage' ? 'Couverture' : 'Population'
                        ]}
                        labelFormatter={(label) => `Département: ${label}`}
                      />
                      <Scatter 
                        dataKey="coverage" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Flu Surveillance Chart - Only for flu surveillance */}
        {isFluSurveillance && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Indicateurs de Surveillance
              </h3>
              <ChartExplanation
                title="Surveillance Grippe"
                explanation="Répartition des indicateurs de surveillance grippale."
                insights={[
                  "SOS Médecins : consultations ambulatoires",
                  "Urgences : cas nécessitant une prise en charge immédiate",
                  "Hospitalisations : cas les plus sévères"
                ]}
              />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getFluIndicatorsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="indicator" />
                  <YAxis />
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

      </div>
    </div>
  )
}