'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, TrendingUp, TrendingDown, Minus, MapPin, UserCheck, Baby } from 'lucide-react'
import type { DepartmentData, DataType } from '@/lib/types/dashboard'

interface StatisticsPanelProps {
  dataType: DataType
  selectedDepartment: string | null
  departmentData: DepartmentData[]
}

export function StatisticsPanel({ 
  dataType, 
  selectedDepartment, 
  departmentData 
}: StatisticsPanelProps) {
  
  const selectedDept = useMemo(() => {
    return selectedDepartment 
      ? departmentData.find(d => d.code === selectedDepartment)
      : null
  }, [selectedDepartment, departmentData])

  const nationalStats = useMemo(() => {
    if (departmentData.length === 0) return null

    const totalPopulation = departmentData.reduce((sum, d) => sum + (d.population || 0), 0)
    
    if (dataType === 'vaccination') {
      const validCoverage = departmentData.filter(d => d.vaccinationCoverage !== undefined)
      const avgCoverage = validCoverage.length > 0 
        ? validCoverage.reduce((sum, d) => sum + (d.vaccinationCoverage || 0), 0) / validCoverage.length
        : 0

      const ageGroup65Plus = departmentData.reduce((sum, d) => sum + (d.ageGroups?.['65+'] || 0), 0)
      const ageGroupUnder65 = departmentData.reduce((sum, d) => sum + (d.ageGroups?.['<65'] || 0), 0)

      return {
        totalPopulation,
        primaryMetric: avgCoverage,
        metricLabel: 'Couverture Moyenne',
        metricUnit: '%',
        ageGroups: [
          { name: '65 ans et +', value: ageGroup65Plus, color: '#3b82f6' },
          { name: 'Moins de 65 ans', value: ageGroupUnder65, color: '#93c5fd' }
        ]
      }
    } else {
      const validActivity = departmentData.filter(d => d.fluActivity !== undefined)
      const avgActivity = validActivity.length > 0 
        ? validActivity.reduce((sum, d) => sum + (d.fluActivity || 0), 0) / validActivity.length
        : 0

      return {
        totalPopulation,
        primaryMetric: avgActivity,
        metricLabel: 'Activité Moyenne',
        metricUnit: '/100k',
        ageGroups: [
          { name: '65 ans et +', value: 0, color: '#ef4444' },
          { name: 'Moins de 65 ans', value: 0, color: '#fca5a5' }
        ]
      }
    }
  }, [departmentData, dataType])

  const departmentStats = useMemo(() => {
    if (!selectedDept || !nationalStats) return null

    const primaryValue = dataType === 'vaccination' 
      ? selectedDept.vaccinationCoverage 
      : selectedDept.fluActivity

    const vsNational = primaryValue !== undefined 
      ? primaryValue - nationalStats.primaryMetric
      : 0

    return {
      department: selectedDept,
      primaryValue: primaryValue || 0,
      vsNational,
      ranking: selectedDept.ranking || 0,
      percentile: selectedDept.percentile || 0
    }
  }, [selectedDept, nationalStats, dataType])

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  if (!nationalStats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-2">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedDept ? selectedDept.name : 'France'}
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {dataType === 'vaccination' ? 'Couverture vaccinale' : 'Surveillance grippale'}
        </p>
        {selectedDept && (
          <div className="text-xs text-blue-600 mt-1">
            Département {selectedDept.code}
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            Profile
          </h3>
          
          {/* Population Overview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-lg font-bold text-blue-900">
                {(departmentStats?.department.population || nationalStats.totalPopulation).toLocaleString('fr-FR')}
              </span>
              <span className="text-sm text-blue-700 ml-2">Habitants</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <UserCheck className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-700">65+ ans</span>
              </div>
              <div className="flex items-center">
                <Baby className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-700">&lt;65 ans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            Métriques Clés
          </h3>
          
          {/* Primary Metric */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {departmentStats ? departmentStats.department.name : nationalStats.metricLabel}
              </span>
              {departmentStats && getTrendIcon(departmentStats.vsNational)}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(departmentStats?.primaryValue || nationalStats.primaryMetric)}
              <span className="text-sm font-normal text-gray-600 ml-1">
                {nationalStats.metricUnit}
              </span>
            </div>
            {departmentStats && (
              <div className="text-sm text-gray-600 mt-1">
                {departmentStats.vsNational > 0 ? '+' : ''}
                {formatNumber(departmentStats.vsNational)} vs national
              </div>
            )}
          </div>

          {/* Population */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Population</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {(departmentStats?.department.population || nationalStats.totalPopulation).toLocaleString('fr-FR')}
            </div>
          </div>

          {/* Ranking (if department selected) */}
          {departmentStats && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Classement</span>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                #{departmentStats.ranking}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({departmentStats.percentile}e percentile)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Age Group Breakdown */}
        {nationalStats.ageGroups.some(g => g.value > 0) && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Répartition par Âge
            </h3>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nationalStats.ageGroups}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {nationalStats.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 mt-4">
                {nationalStats.ageGroups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {group.name.includes('65') ? (
                        <UserCheck className="w-4 h-4 text-blue-600 mr-2" />
                      ) : (
                        <Baby className="w-4 h-4 text-blue-400 mr-2" />
                      )}
                      <span className="text-sm text-gray-700">{group.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(group.value, 0)}
                      <span className="text-xs text-gray-500 ml-1">
                        {dataType === 'vaccination' ? '%' : '/100k'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vaccine Types Detail (if vaccination and department selected) */}
        {dataType === 'vaccination' && selectedDept?.vaccineTypes && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Détail par Type de Vaccin
            </h3>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Grippe 65+</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.vaccineTypes.grippe65Plus.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Grippe &lt;65 ans</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.vaccineTypes.grippeMoins65.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">HPV Filles</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.vaccineTypes.hpvFilles.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">HPV Garçons</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.vaccineTypes.hpvGarcons.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Méningocoque</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.vaccineTypes.meningocoque.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">COVID-19</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.vaccineTypes.covid19.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Flu Details (if flu surveillance and department selected) */}
        {dataType === 'flu-surveillance' && selectedDept?.fluDetails && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Surveillance Épidémiologique
            </h3>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Passages aux urgences</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.fluDetails.urgencyVisits.toFixed(1)}/100k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Hospitalisations</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.fluDetails.hospitalizations.toFixed(1)}/100k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Consultations SOS Médecins</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDept.fluDetails.sosConsultations.toFixed(1)}/100k
                </span>
              </div>
              
              {/* Tendance hebdomadaire */}
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Tendance hebdomadaire</span>
                  <span className={`text-sm font-medium ${
                    selectedDept.fluDetails.weeklyTrend === 'up' ? 'text-red-600' :
                    selectedDept.fluDetails.weeklyTrend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedDept.fluDetails.weeklyTrend === 'up' ? '↗️ En hausse' :
                     selectedDept.fluDetails.weeklyTrend === 'down' ? '↘️ En baisse' : '➡️ Stable'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-700">vs année précédente</span>
                  <span className={`text-sm font-medium ${
                    selectedDept.fluDetails.seasonalComparison > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedDept.fluDetails.seasonalComparison > 0 ? '+' : ''}
                    {selectedDept.fluDetails.seasonalComparison.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Navigation
          </h4>
          <p className="text-sm text-blue-700">
            {selectedDept 
              ? 'Cliquez sur un autre département ou sur le département sélectionné pour revenir à la vue nationale.'
              : 'Cliquez sur un département de la carte pour voir ses statistiques détaillées.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}