'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, AreaChart, Area
} from 'recharts'
import { TrendingUp, Users, Activity, Target, Award, AlertCircle, BarChart3, TrendingDown } from 'lucide-react'
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

  // Calcul des chiffres clés
  const getKeyMetrics = () => {
    if (isVaccination) {
      const coverages = departmentData.map(d => d.vaccinationCoverage || 0).filter(v => v > 0)
      const moyenne = coverages.length > 0 ? coverages.reduce((sum, v) => sum + v, 0) / coverages.length : 0
      const max = coverages.length > 0 ? Math.max(...coverages) : 0
      const min = coverages.length > 0 ? Math.min(...coverages) : 0
      
      return {
        moyenne: moyenne,
        max: max,
        min: min,
        ecart: max - min,
        departementsSousObjectif: coverages.filter(v => v < 75).length,
        pourcentageSousObjectif: coverages.length > 0 ? (coverages.filter(v => v < 75).length / coverages.length) * 100 : 0,
        departementsEnAlerte: 0,
        pourcentageEnAlerte: 0
      }
    } else {
      const activities = departmentData.map(d => d.fluActivity || 0).filter(v => v > 0)
      const moyenne = activities.length > 0 ? activities.reduce((sum, v) => sum + v, 0) / activities.length : 0
      const max = activities.length > 0 ? Math.max(...activities) : 0
      const min = activities.length > 0 ? Math.min(...activities) : 0
      
      return {
        moyenne: moyenne,
        max: max,
        min: min,
        ecart: max - min,
        departementsEnAlerte: activities.filter(v => v >= 50).length,
        pourcentageEnAlerte: activities.length > 0 ? (activities.filter(v => v >= 50).length / activities.length) * 100 : 0,
        departementsSousObjectif: 0,
        pourcentageSousObjectif: 0
      }
    }
  }

  const keyMetrics = getKeyMetrics()

  // === GRAPHIQUES POUR VACCINATION ===
  
  // Top 10 départements vaccination
  const getVaccinationTopDepartments = () => {
    return [...departmentData]
      .filter(d => d.vaccinationCoverage && d.vaccinationCoverage > 0)
      .sort((a, b) => (b.vaccinationCoverage || 0) - (a.vaccinationCoverage || 0))
      .slice(0, 10)
      .map(dept => ({
        name: dept.name.length > 15 ? dept.name.substring(0, 15) + '...' : dept.name,
        value: dept.vaccinationCoverage || 0,
        fullName: dept.name
      }))
  }

  // Répartition par tranches de couverture vaccinale
  const getVaccinationDistribution = () => {
    const ranges = [
      { name: 'Très faible (<50%)', min: 0, max: 50, color: '#dc2626' },
      { name: 'Faible (50-65%)', min: 50, max: 65, color: '#ea580c' },
      { name: 'Moyenne (65-75%)', min: 65, max: 75, color: '#ca8a04' },
      { name: 'Bonne (75-85%)', min: 75, max: 85, color: '#16a34a' },
      { name: 'Excellente (>85%)', min: 85, max: 100, color: '#059669' }
    ]

    return ranges.map(range => ({
      name: range.name,
      value: departmentData.filter(d => {
        const coverage = d.vaccinationCoverage || 0
        return coverage >= range.min && coverage < range.max
      }).length,
      color: range.color
    })).filter(item => item.value > 0)
  }

  // Comparaison par groupes d'âge vaccination
  const getVaccinationAgeComparison = () => {
    const over65 = departmentData.map(d => d.ageGroups?.['65+'] || 0).filter(v => v > 0)
    const under65 = departmentData.map(d => d.ageGroups?.['<65'] || 0).filter(v => v > 0)
    
    return [
      {
        group: '65 ans et plus',
        moyenne: over65.length > 0 ? over65.reduce((sum, v) => sum + v, 0) / over65.length : 0,
        color: '#3b82f6'
      },
      {
        group: 'Moins de 65 ans',
        moyenne: under65.length > 0 ? under65.reduce((sum, v) => sum + v, 0) / under65.length : 0,
        color: '#10b981'
      }
    ]
  }

  // Évolution temporelle vaccination (simulée)
  const getVaccinationTrend = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return months.map((month, index) => ({
      month,
      couverture: 60 + Math.sin(index * 0.5) * 8 + index * 1.2,
      objectif: 75
    }))
  }

  // === GRAPHIQUES POUR SURVEILLANCE GRIPPE ===

  // Top 10 départements avec plus forte activité grippale
  const getFluTopActivity = () => {
    return [...departmentData]
      .filter(d => d.fluActivity && d.fluActivity > 0)
      .sort((a, b) => (b.fluActivity || 0) - (a.fluActivity || 0))
      .slice(0, 10)
      .map(dept => ({
        name: dept.name.length > 15 ? dept.name.substring(0, 15) + '...' : dept.name,
        value: dept.fluActivity || 0,
        fullName: dept.name
      }))
  }

  // Répartition des niveaux d'activité grippale
  const getFluActivityDistribution = () => {
    return [
      { 
        name: 'Faible (<30/100k)', 
        value: departmentData.filter(d => (d.fluActivity || 0) < 30).length, 
        color: '#22c55e' 
      },
      { 
        name: 'Modérée (30-50/100k)', 
        value: departmentData.filter(d => (d.fluActivity || 0) >= 30 && (d.fluActivity || 0) < 50).length, 
        color: '#eab308' 
      },
      { 
        name: 'Élevée (≥50/100k)', 
        value: departmentData.filter(d => (d.fluActivity || 0) >= 50).length, 
        color: '#ef4444' 
      }
    ].filter(item => item.value > 0)
  }

  // Indicateurs de surveillance grippe
  const getFluIndicators = () => {
    return [
      { indicator: 'SOS Médecins', value: 42.5, color: '#f59e0b' },
      { indicator: 'Urgences', value: 28.3, color: '#ef4444' },
      { indicator: 'Hospitalisations', value: 11.8, color: '#dc2626' },
      { indicator: 'Réanimation', value: 3.2, color: '#991b1b' }
    ]
  }

  // Évolution hebdomadaire grippe (simulée)
  const getFluWeeklyTrend = () => {
    const weeks = Array.from({length: 12}, (_, i) => `S${i + 1}`)
    return weeks.map((week, index) => ({
      week,
      activite: 20 + Math.sin(index * 0.8) * 15 + Math.random() * 8,
      seuilAlerte: 50
    }))
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header avec chiffres clés */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Analyses & Tendances
            </h2>
            <p className="text-sm text-gray-600">
              {isVaccination ? 'Couverture vaccinale par département' : 'Surveillance de l\'activité grippale'}
            </p>
          </div>
        </div>

        {/* Chiffres clés - responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-600 truncate">Moyenne Nationale</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">
                  {formatNumber(keyMetrics.moyenne, 1)}{isVaccination ? '%' : '/100k'}
                </p>
              </div>
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-600 truncate">
                  {isVaccination ? 'Maximum' : 'Minimum'}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">
                  {formatNumber(isVaccination ? keyMetrics.max : keyMetrics.min, 1)}{isVaccination ? '%' : '/100k'}
                </p>
              </div>
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-orange-600 truncate">Écart</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-900">
                  {formatNumber(keyMetrics.ecart, 1)}{isVaccination ? '%' : '/100k'}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-red-600 truncate">
                  {isVaccination ? 'Sous objectif' : 'En alerte'}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-900">
                  {isVaccination ? keyMetrics.departementsSousObjectif : keyMetrics.departementsEnAlerte}
                </p>
                <p className="text-xs text-red-600">
                  ({formatNumber(isVaccination ? keyMetrics.pourcentageSousObjectif : keyMetrics.pourcentageEnAlerte, 0)}%)
                </p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques - responsive */}
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* === GRAPHIQUES VACCINATION === */}
          {isVaccination && (
            <>
              {/* Top 10 départements */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top 10 Départements
                  </h3>
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={getVaccinationTopDepartments()} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={10}
                      />
                      <YAxis 
                        label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Couverture']}
                        labelFormatter={(label) => getVaccinationTopDepartments().find(d => d.name === label)?.fullName || label}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Répartition par niveaux */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Répartition par Niveaux
                  </h3>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getVaccinationDistribution()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {getVaccinationDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} départements`, 'Nombre']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparaison par âge */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Comparaison par Âge
                  </h3>
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getVaccinationAgeComparison()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Moyenne']} />
                      <Bar dataKey="moyenne" radius={[4, 4, 0, 0]} barSize={100}>
                        {getVaccinationAgeComparison().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Évolution temporelle */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Évolution 2024
                  </h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getVaccinationTrend()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any, name: string) => [
                        `${Number(value).toFixed(1)}%`, 
                        name === 'couverture' ? 'Couverture' : 'Objectif'
                      ]} />
                      <Area 
                        type="monotone" 
                        dataKey="couverture" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="objectif" 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* === GRAPHIQUES SURVEILLANCE GRIPPE === */}
          {isFluSurveillance && (
            <>
              {/* Top 10 activité grippale */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Départements les Plus Touchés
                  </h3>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={getFluTopActivity()} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={10}
                      />
                      <YAxis 
                        label={{ value: 'Activité (/100k)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${Number(value).toFixed(1)}/100k`, 'Activité']}
                        labelFormatter={(label) => getFluTopActivity().find(d => d.name === label)?.fullName || label}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Répartition niveaux d'activité */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Niveaux d'Activité
                  </h3>
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getFluActivityDistribution()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {getFluActivityDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} départements`, 'Nombre']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Indicateurs de surveillance */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Indicateurs Nationaux
                  </h3>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFluIndicators()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="indicator" />
                      <YAxis label={{ value: 'Cas (/100k)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}/100k`, 'Moyenne']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={80}>
                        {getFluIndicators().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Évolution hebdomadaire */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Évolution Hebdomadaire
                  </h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getFluWeeklyTrend()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis label={{ value: 'Activité (/100k)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any, name: string) => [
                        `${Number(value).toFixed(1)}/100k`, 
                        name === 'activite' ? 'Activité' : 'Seuil d\'alerte'
                      ]} />
                      <Line 
                        type="monotone" 
                        dataKey="activite" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="seuilAlerte" 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}