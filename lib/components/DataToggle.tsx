'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { VACCINE_CONFIG, VACCINATION_TYPES, SURVEILLANCE_TYPES } from '@/lib/config/vaccines'
import type { DataType } from '@/lib/types/dashboard'

interface DataToggleProps {
  currentType: DataType
  onTypeChange: (type: DataType) => void
}

export function DataToggle({ currentType, onTypeChange }: DataToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentConfig = VACCINE_CONFIG[currentType]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-france focus:border-blue-france transition-colors"
      >
        <div 
          className="w-3 h-3 rounded-full mr-3"
          style={{ backgroundColor: currentConfig.color }}
        />
        {currentConfig.name}
        <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* Vaccinations */}
            <div className="mb-3">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Vaccinations
              </div>
              {VACCINATION_TYPES.map((type) => {
                const config = VACCINE_CONFIG[type]
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onTypeChange(type)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-start px-3 py-3 text-left rounded-md transition-colors ${
                      currentType === type
                        ? 'bg-blue-50 text-blue-france border border-blue-100'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3 mt-1 flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{config.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {config.targetPopulation}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Objectif: {config.objective}{config.unit}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Surveillance */}
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Surveillance
              </div>
              {SURVEILLANCE_TYPES.map((type) => {
                const config = VACCINE_CONFIG[type]
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onTypeChange(type)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-start px-3 py-3 text-left rounded-md transition-colors ${
                      currentType === type
                        ? 'bg-red-50 text-red-marianne border border-red-100'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3 mt-1 flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{config.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {config.targetPopulation}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Seuil: {config.objective}{config.unit}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}