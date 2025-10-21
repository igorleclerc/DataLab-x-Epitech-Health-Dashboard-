'use client'

import { useState, useEffect } from 'react'
import { InteractiveMap } from '@/lib/components/InteractiveMap'
import { StatisticsPanel } from '@/lib/components/StatisticsPanel'
import { AnalyticsPanel } from '@/lib/components/AnalyticsPanel'
import { DataToggle } from '@/lib/components/DataToggle'
import { ViewToggle } from '@/lib/components/ViewToggle'
import { YearSelector } from '@/lib/components/YearSelector'
import { LoadingSpinner } from '@/lib/components/LoadingSpinner'
import { DataQualityIndicator } from '@/lib/components/DataQualityIndicator'
import { DashboardGuide } from '@/lib/components/DashboardGuide'
import { TestDataService } from '@/lib/services/test-data-service'
import type { DepartmentData, DataType, ViewType } from '@/lib/types/dashboard'

export default function Dashboard() {
  const [dataType, setDataType] = useState<DataType>('grippe-vaccination')
  const [currentView, setCurrentView] = useState<ViewType>('map')
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const availableYears = TestDataService.getAvailableYears()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Load test data based on current data type and year
        const data = selectedYear === 'all' 
          ? TestDataService.generateAggregatedData(dataType)
          : TestDataService.generateDepartmentData(dataType, selectedYear)
        setDepartmentData(data)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dataType, selectedYear])

  const handleDataTypeChange = (newDataType: DataType) => {
    setDataType(newDataType)
  }

  const handleDepartmentSelect = (departmentCode: string | null) => {
    setSelectedDepartment(departmentCode)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header épuré */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Titre */}
          <div>
            <h1 className="text-2xl font-bold text-blue-france">
              Dashboard Vaccination & Grippe
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Données de surveillance sanitaire - France 2021-2024
            </p>
          </div>

          {/* Contrôles principaux */}
          <div className="flex items-center space-x-6">
            <DataToggle 
              currentType={dataType} 
              onTypeChange={handleDataTypeChange}
            />
            
            <YearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              dataType={dataType}
            />
          </div>
        </div>

        {/* Barre de navigation secondaire */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <ViewToggle 
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          
          <div className="flex items-center space-x-4">
            <DataQualityIndicator 
              dataCount={departmentData.length} 
              dataType={dataType}
              selectedYear={selectedYear}
            />
            <DashboardGuide />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="h-[calc(100vh-140px)]">
        {currentView === 'map' && (
          <div className="flex h-full">
            {/* Carte - 70% */}
            <div className="flex-1 w-[70%] p-4">
              <InteractiveMap
                data={departmentData}
                dataType={dataType}
                selectedDepartment={selectedDepartment}
                onDepartmentSelect={handleDepartmentSelect}
              />
            </div>

            {/* Panneau statistiques - 30% */}
            <div className="w-[30%] border-l border-gray-100 bg-gray-50">
              <StatisticsPanel
                dataType={dataType}
                selectedDepartment={selectedDepartment}
                departmentData={departmentData}
              />
            </div>
          </div>
        )}

        {currentView === 'statistics' && (
          <div className="h-full p-4">
            <StatisticsPanel
              dataType={dataType}
              selectedDepartment={selectedDepartment}
              departmentData={departmentData}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="h-full">
            <AnalyticsPanel
              dataType={dataType}
              departmentData={departmentData}
              selectedDepartment={selectedDepartment}
            />
          </div>
        )}
      </main>
    </div>
  )
}