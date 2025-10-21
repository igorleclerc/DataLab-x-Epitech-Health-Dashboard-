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
        color: '#3b82f6'
      },
      { 
        group: 'Moins de 65 ans', 
        coverage: ageGroupData.grippeMoins65 / ageGroupData.count,
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
        coverage: d.vaccinationCoverage!
      }))
      .slice(0, 40) // Limiter pour la lisibilité
  }

  // 6. Analyse des types de vaccins (pour vaccination)
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
        color: '#3b82f6'
      },
      { 
        vaccine: 'COVID-19', 
        coverage: vaccineData.covid / vaccineData.count,
        color: '#ef4444'
      },
      { 
        vaccine: 'HPV', 
        coverage: vaccineData.hpv / vaccineData.count,
        color: '#f59e0b'
      },
      { 
        vaccine: 'Méningocoque', 
        coverage: vaccineData.meningocoque / vaccineData.count,
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

        {/* Vaccination Analysis - Pertinent Charts */}
        {isVaccination && (
          <>
            {/* Disparités Géographiques - Carte de chaleur */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Disparités Géographiques de Couverture
                </h3>
                <ChartExplanation
                  title="Inégalités Territoriales"
                  explanation="Analyse des écarts de couverture vaccinale entre départements."
                  insights={[
                    "Identification des zones sous-vaccinées",
                    "Corrélation avec la densité de population",
                    "Facteurs socio-économiques territoriaux"
                  ]}
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
                    <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: any) => [`${value?.toFixed(1)}%`, 'Couverture vaccinale']}
                      labelFormatter={(label) => `Département: ${label}`}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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

            {/* Analyse Démographique Détaillée */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Couverture par Tranche d'Âge
                  </h3>
                  <ChartExplanation
                    title="Analyse Démographique"
                    explanation="Différences de couverture entre les groupes d'âge."
                    insights={[
                      "65+ ans : Population à risque élevé",
                      "Moins de 65 ans : Couverture plus faible",
                      "Écart générationnel significatif"
                    ]}
                  />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAgeGroupAnalysis()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Couverture']} />
                      <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                        {getAgeGroupAnalysis().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Corrélation Taille vs Performance */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Taille vs Performance
                  </h3>
                  <ChartExplanation
                    title="Impact de la Démographie"
                    explanation="Relation entre population départementale et couverture vaccinale."
                    insights={[
                      "Départements ruraux vs urbains",
                      "Effet de la densité médicale",
                      "Accessibilité aux soins"
                    ]}
                  />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={getPopulationCoverageData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="population" 
                        type="number" 
                        domain={['dataMin', 'dataMax']}
                        label={{ value: 'Population (milliers)', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        dataKey="coverage" 
                        type="number" 
                        domain={[30, 90]}
                        label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'coverage' ? `${Number(value).toFixed(1)}%` : `${Number(value).toFixed(0)}k hab.`,
                          name === 'coverage' ? 'Couverture' : 'Population'
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Scatter 
                        dataKey="coverage" 
                        fill="#3b82f6" 
                        fillOpacity={0.7}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Comparaison Multi-Vaccins Réelle */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Panorama Vaccinal par Type
                </h3>
                <ChartExplanation
                  title="Comparaison Inter-Vaccins"
                  explanation="Performance relative des différents programmes vaccinaux."
                  insights={[
                    "COVID-19 : Mobilisation exceptionnelle",
                    "Grippe : Vaccination saisonnière établie",
                    "HPV : Enjeux d'acceptabilité sociale"
                  ]}
                />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getVaccineTypesComparison()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vaccine" />
                    <YAxis label={{ value: 'Couverture Moyenne (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Couverture moyenne']} />
                    <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                      {getVaccineTypesComparison().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Statistique */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Répartition des Performances Départementales
                </h3>
                <ChartExplanation
                  title="Distribution Statistique"
                  explanation="Analyse de la répartition des taux de couverture."
                  insights={[
                    "Concentration des départements par tranche",
                    "Identification des valeurs aberrantes",
                    "Médiane et écart-type national"
                  ]}
                />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getVaccinationDistributionData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis label={{ value: 'Nombre de départements', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} départements`, 'Effectif']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {getVaccinationDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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