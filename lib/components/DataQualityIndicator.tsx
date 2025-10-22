'use client'

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

import { VACCINE_CONFIG } from '@/lib/config/vaccines'
import type { DataType } from '@/lib/types/dashboard'

interface DataQualityIndicatorProps {
  dataCount: number
  dataType: DataType
  selectedYear?: number | 'all'
}

export function DataQualityIndicator({ dataCount, dataType, selectedYear }: DataQualityIndicatorProps) {
  const config = VACCINE_CONFIG[dataType]
  
  const getQualityStatus = () => {
    if (dataCount >= 90) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle }
    if (dataCount >= 70) return { status: 'good', color: 'text-yellow-600', icon: AlertCircle }
    return { status: 'limited', color: 'text-red-600', icon: XCircle }
  }

  const { status, color, icon: Icon } = getQualityStatus()

  const getStatusText = () => {
    switch (status) {
      case 'excellent': return 'Données complètes'
      case 'good': return 'Données partielles'
      case 'limited': return 'Données limitées'
    }
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-gray-600">
        {getStatusText()} ({dataCount} dép.)
      </span>
      {selectedYear === 'all' && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Données agrégées
        </span>
      )}
      <span className="text-xs text-gray-500">
        • {config.targetPopulation}
      </span>
    </div>
  )
}