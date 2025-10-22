'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, RadialBarChart, RadialBar, LineChart, Line, AreaChart, Area,
  ComposedChart, Scatter, ScatterChart
} from 'recharts'
import { TrendingUp, Users, Activity, Target, Award, AlertCircle, Calendar, BarChart3, TrendingDown } from 'lucide-react'
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
      const ecartType = coverages.length > 0 ? Math.sqrt(coverages.reduce((sum, v) => sum + Math.pow(v - moyenne, 2), 0) / coverages.length) : 0
      
      return {
        moyenne: moyenne,
        max: max,
        min: min,
        ecart: max - min,
        ecartType: ecartType,
        objectif: 75, // Objectif national
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
        seuilAlerte: 50, // Seuil d'alerte épidémique
        departementsEnAlerte: activities.filter(v => v >= 50).length,
        pourcentageEnAlerte: activities.length > 0 ? (activities.filter(v => v >= 50).length / activities.length) * 100 : 0,
        departementsSousObjectif: 0,
        pourcentageSousObjectif: 0
      }
    }
  }

  // Données de tendance temporelle simulée (évolution sur 4 ans)
  const getTrendData = () => {
    const years = [2021, 2022, 2023, 2024]
    return years.map(year => {
      // Simulation d'évolution réaliste
      let baseValue: number
      let trend: number
      
      if (isVaccination) {
        // Tendance générale à l'amélioration pour la vaccination
        baseValue = 65 + (year - 2021) * 2.5 // Progression de 2.5% par an
        trend = Math.sin((year - 2021) * 0.5) * 3 // Variation saisonnière
      } else {
        // Variation cyclique pour la grippe
        baseValue = 35 + Math.sin((year - 2021) * 1.2) * 8 // Cycles épidémiques
        trend = Math.random() * 5 - 2.5 // Variation aléatoire
      }
      
      return {
        year: year,
        value: Math.max(0, baseValue + trend),
        objectif: isVaccination ? 75 : 30,
        variation: year > 2021 ? (Math.random() - 0.5) * 10 : 0
      }
    })
  }

  // Analyse comparative par groupes d'âge
  const getAgeGroupAnalysis = () => {
    const over65Data = departmentData.map(d => d.ageGroups?.['65+'] || 0).filter(v => v > 0)
    const under65Data = departmentData.map(d => d.ageGroups?.['<65'] || 0).filter(v => v > 0)
    
    const over65Avg = over65Data.length > 0 ? over65Data.reduce((sum, v) => sum + v, 0) / over65Data.length : 0
    const under65Avg = under65Data.length > 0 ? under65Data.reduce((sum, v) => sum + v, 0) / under65Data.length : 0
    
    return [
      {
        group: '65 ans et +',
        moyenne: over65Avg,
        min: over65Data.length > 0 ? Math.min(...over65Data) : 0,
        max: over65Data.length > 0 ? Math.max(...over65Data) : 0,
        count: over65Data.length,
        color: '#3b82f6'
      },
      {
        group: 'Moins de 65 ans',
        moyenne: under65Avg,
        min: under65Data.length > 0 ? Math.min(...under65Data) : 0,
        max: under65Data.length > 0 ? Math.max(...under65Data) : 0,
        count: under65Data.length,
        color: '#10b981'
      }
    ]
  }

  // Analyse des disparités géographiques
  const getDisparityAnalysis = () => {
    const values = departmentData.map(d => 
      isVaccination ? (d.vaccinationCoverage || 0) : (d.fluActivity || 0)
    ).filter(v => v > 0)
    
    if (values.length === 0) {
      return {
        q1: 0, median: 0, q3: 0, iqr: 0,
        outliers: 0, range: 0
      }
    }
    
    values.sort((a, b) => a - b)
    const q1 = values[Math.floor(values.length * 0.25)]
    const median = values[Math.floor(values.length * 0.5)]
    const q3 = values[Math.floor(values.length * 0.75)]
    const iqr = q3 - q1
    
    return {
      q1, median, q3, iqr,
      outliers: values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length,
      range: Math.max(...values) - Math.min(...values)
    }
  }

  // Données de corrélation (population vs couverture)
  const getCorrelationData = () => {
    return departmentData
      .filter(d => d.population && (d.vaccinationCoverage || d.fluActivity))
      .slice(0, 30) // Limiter pour la lisibilité
      .map(d => ({
        population: d.population! / 1000, // En milliers
        coverage: isVaccination ? (d.vaccinationCoverage || 0) : (d.fluActivity || 0),
        name: d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name,
        fullName: d.name
      }))
  }

  const keyMetrics = getKeyMetrics()

  // 1. Top 15 départements seulement (plus lisible)
  const getTopPerformers = () => {
    return [...departmentData]
      .sort((a, b) => {
        const aValue = isVaccination ? (a.vaccinationCoverage || 0) : (a.fluActivity || 0)
        const bValue = isVaccination ? (b.vaccinationCoverage || 0) : (b.fluActivity || 0)
        return isVaccination ? bValue - aValue : aValue - bValue
      })
      .slice(0, 15)
      .map((dept, index) => ({
        name: dept.name.length > 12 ? dept.name.substring(0, 12) + '...' : dept.name,
        value: isVaccination ? dept.vaccinationCoverage : dept.fluActivity,
        rank: index + 1,
        fullName: dept.name
      }))
  }

  // 2. Analyse régionale (regroupement par grandes régions)
  const getRegionalAnalysis = () => {
    if (!isVaccination) return []
    
    const regions = {
      'Île-de-France': ['75', '77', '78', '91', '92', '93', '94', '95'],
      'Auvergne-Rhône-Alpes': ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
      'Nouvelle-Aquitaine': ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
      'Occitanie': ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
      'Hauts-de-France': ['02', '59', '60', '62', '80'],
      'Provence-Alpes-Côte d\'Azur': ['04', '05', '06', '13', '83', '84']
    }

    return Object.entries(regions).map(([regionName, codes]) => {
      const regionDepts = departmentData.filter(d => codes.includes(d.code))
      const avgCoverage = regionDepts.length > 0 
        ? regionDepts.reduce((sum, d) => sum + (d.vaccinationCoverage || 0), 0) / regionDepts.length
        : 0
      
      return {
        region: regionName,
        coverage: avgCoverage,
        departments: regionDepts.length,
        color: avgCoverage > 70 ? '#22c55e' : avgCoverage > 60 ? '#eab308' : '#ef4444'
      }
    }).filter(r => r.departments > 0)
  }

  // 3. Analyse des extrêmes (très performants vs en difficulté)
  const getExtremesAnalysis = () => {
    if (!isVaccination) return []
    
    const sorted = [...departmentData]
      .filter(d => d.vaccinationCoverage !== undefined)
      .sort((a, b) => (b.vaccinationCoverage || 0) - (a.vaccinationCoverage || 0))
    
    const top5 = sorted.slice(0, 5)
    const bottom5 = sorted.slice(-5)
    
    return [
      {
        category: 'Top 5',
        average: top5.reduce((sum, d) => sum + (d.vaccinationCoverage || 0), 0) / 5,
        min: Math.min(...top5.map(d => d.vaccinationCoverage || 0)),
        max: Math.max(...top5.map(d => d.vaccinationCoverage || 0)),
        color: '#22c55e'
      },
      {
        category: 'Bottom 5',
        average: bottom5.reduce((sum, d) => sum + (d.vaccinationCoverage || 0), 0) / 5,
        min: Math.min(...bottom5.map(d => d.vaccinationCoverage || 0)),
        max: Math.max(...bottom5.map(d => d.vaccinationCoverage || 0)),
        color: '#ef4444'
      }
    ]
  }

  // 4. Répartition par quartiles
  const getQuartilesData = () => {
    if (!isVaccination) return []
    
    const values = departmentData
      .map(d => d.vaccinationCoverage)
      .filter(v => v !== undefined)
      .sort((a, b) => a! - b!) as number[]
    
    if (values.length === 0) return []
    
    const q1 = values[Math.floor(values.length * 0.25)]
    const q2 = values[Math.floor(values.length * 0.5)]
    const q3 = values[Math.floor(values.length * 0.75)]
    
    return [
      { quartile: 'Q1 (25%)', value: q1, color: '#ef4444' },
      { quartile: 'Q2 (50%)', value: q2, color: '#f59e0b' },
      { quartile: 'Q3 (75%)', value: q3, color: '#eab308' },
      { quartile: 'Max', value: Math.max(...values), color: '#22c55e' }
    ]
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header avec chiffres clés */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Analyses Avancées & Tendances
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {isVaccination ? 'Analyses de la couverture vaccinale' : 'Analyses de la surveillance grippale'}
            </p>
          </div>
        </div>

        {/* Chiffres clés en header */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Moyenne Nationale</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(keyMetrics.moyenne, 1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  {isVaccination ? 'Meilleur Département' : 'Activité Minimale'}
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatNumber(isVaccination ? keyMetrics.max : keyMetrics.min, 1)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Écart Max-Min</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(keyMetrics.ecart, 1)}%
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  {isVaccination ? 'Sous Objectif (75%)' : 'En Alerte (≥50)'}
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {isVaccination ? keyMetrics.departementsSousObjectif : keyMetrics.departementsEnAlerte} dép.
                </p>
                <p className="text-xs text-red-600">
                  ({formatNumber(isVaccination ? keyMetrics.pourcentageSousObjectif : keyMetrics.pourcentageEnAlerte, 0)}%)
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Analyses et Tendances */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          
          {/* Tendance Temporelle */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Évolution 2021-2024
              </h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={getTrendData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    label={{ value: isVaccination ? 'Couverture (%)' : 'Activité (/100k)', angle: -90, position: 'insideLeft' }}
                    domain={isVaccination ? [60, 80] : [20, 60]}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `${Number(value).toFixed(1)}%`, 
                      name === 'value' ? (isVaccination ? 'Couverture' : 'Activité') : 'Objectif'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objectif" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
                Tendance nationale moyenne
              </p>
              <p>
                <span className="inline-block w-3 h-1 bg-red-500 mr-2"></span>
                Objectif {isVaccination ? '75%' : '30/100k'}
              </p>
            </div>
          </div>

          {/* Analyse par Groupes d'Âge */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparaison par Âge
              </h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getAgeGroupAnalysis()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" fontSize={12} />
                  <YAxis 
                    label={{ value: isVaccination ? 'Couverture (%)' : 'Activité (/100k)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Moyenne']}
                  />
                  <Bar dataKey="moyenne" radius={[4, 4, 0, 0]} barSize={80}>
                    {getAgeGroupAnalysis().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="max" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.3}>
                    {getAgeGroupAnalysis().map((entry, index) => (
                      <Cell key={`cell-max-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              {getAgeGroupAnalysis().map((group, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2" 
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <span className="text-gray-700">
                    {group.group}: {formatNumber(group.moyenne, 1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Corrélation Population vs Performance */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Population vs {isVaccination ? 'Couverture' : 'Activité'}
              </h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={getCorrelationData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="population" 
                    type="number"
                    label={{ value: 'Population (milliers)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    dataKey="coverage"
                    type="number"
                    label={{ value: isVaccination ? 'Couverture (%)' : 'Activité (/100k)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'coverage' 
                        ? `${Number(value).toFixed(1)}%` 
                        : `${Number(value).toFixed(0)}k hab.`,
                      name === 'coverage' 
                        ? (isVaccination ? 'Couverture' : 'Activité')
                        : 'Population'
                    ]}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload
                      return data?.fullName || 'Département'
                    }}
                  />
                  <Scatter dataKey="coverage" fill="#22c55e" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Relation entre taille de population et performance départementale</p>
            </div>
          </div>

          {/* Analyse des Disparités (Box Plot simulé) */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Analyse des Disparités
              </h3>
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { 
                      name: 'Distribution', 
                      q1: getDisparityAnalysis().q1,
                      median: getDisparityAnalysis().median,
                      q3: getDisparityAnalysis().q3,
                      range: getDisparityAnalysis().range
                    }
                  ]} 
                  margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    label={{ value: isVaccination ? 'Couverture (%)' : 'Activité (/100k)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      const labels = {
                        q1: 'Q1 (25%)',
                        median: 'Médiane (50%)', 
                        q3: 'Q3 (75%)',
                        range: 'Étendue'
                      }
                      return [`${Number(value).toFixed(1)}%`, labels[name as keyof typeof labels] || name]
                    }}
                  />
                  <Bar dataKey="q1" stackId="a" fill="#ef4444" />
                  <Bar dataKey="median" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="q3" stackId="a" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">IQR:</span> {formatNumber(getDisparityAnalysis().iqr, 1)}%
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Étendue:</span> {formatNumber(getDisparityAnalysis().range, 1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Valeurs aberrantes:</span> {getDisparityAnalysis().outliers}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Médiane:</span> {formatNumber(getDisparityAnalysis().median, 1)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Analyses spécifiques par type de données */}
          {isVaccination && (
            <>
              {/* Top Performers - Optimisé */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top 12 Départements
                  </h3>
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={getTopPerformers().slice(0, 12)} 
                      layout="horizontal"
                      margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[60, 90]} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={75}
                        fontSize={10}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value?.toFixed(1)}%`, 'Couverture']}
                        labelFormatter={(label) => getTopPerformers().find(d => d.name === label)?.fullName || label}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Régionale */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Performance par Région
                  </h3>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={getRegionalAnalysis()} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="region" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={9}
                      />
                      <YAxis 
                        label={{ value: 'Couverture (%)', angle: -90, position: 'insideLeft' }}
                        domain={[50, 80]}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value?.toFixed(1)}%`, 'Couverture moyenne']}
                        labelFormatter={(label) => `Région: ${label}`}
                      />
                      <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                        {getRegionalAnalysis().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Analyses spécifiques grippe */}
          {isFluSurveillance && (
            <>
              {/* Indicateurs Grippe */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Indicateurs Nationaux
                  </h3>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFluIndicatorsData()} margin={{ top: 40, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="indicator" fontSize={12} />
                      <YAxis label={{ value: 'Cas (/100k)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}/100k`, 'Moyenne nationale']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={80}>
                        {getFluIndicatorsData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Répartition Activité */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Niveaux d'Activité
                  </h3>
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <Pie
                        data={[
                          { name: 'Faible (<30)', value: departmentData.filter(d => (d.fluActivity || 0) < 30).length, color: '#22c55e' },
                          { name: 'Modérée (30-50)', value: departmentData.filter(d => (d.fluActivity || 0) >= 30 && (d.fluActivity || 0) < 50).length, color: '#eab308' },
                          { name: 'Élevée (≥50)', value: departmentData.filter(d => (d.fluActivity || 0) >= 50).length, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {[
                          { name: 'Faible (<30)', value: departmentData.filter(d => (d.fluActivity || 0) < 30).length, color: '#22c55e' },
                          { name: 'Modérée (30-50)', value: departmentData.filter(d => (d.fluActivity || 0) >= 30 && (d.fluActivity || 0) < 50).length, color: '#eab308' },
                          { name: 'Élevée (≥50)', value: departmentData.filter(d => (d.fluActivity || 0) >= 50).length, color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} départements`, 'Nombre']} />
                    </PieChart>
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

// Fonction helper pour les données de surveillance grippe
function getFluIndicatorsData() {
  return [
    { indicator: 'SOS Médecins', value: 45.2, color: '#f59e0b' },
    { indicator: 'Urgences', value: 28.7, color: '#ef4444' },
    { indicator: 'Hospitalisations', value: 12.3, color: '#dc2626' }
  ]
}