'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, Check } from 'lucide-react'

interface YearSelectorProps {
  selectedYear: number | 'all'
  onYearChange: (year: number | 'all') => void
  availableYears: number[]
  dataType: string
}

export function YearSelector({ selectedYear, onYearChange, availableYears, dataType }: YearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Ne montrer le sélecteur que pour les vaccinations
  if (dataType === 'flu-surveillance') {
    return null
  }

  const options = [
    { value: 'all' as const, label: 'Toutes les années', description: 'Données agrégées 2021-2024' },
    ...availableYears.map(year => ({
      value: year,
      label: year.toString(),
      description: `Données de l'année ${year}`
    }))
  ]

  const selectedOption = options.find(opt => opt.value === selectedYear)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-france focus:border-blue-france transition-colors min-w-[180px]"
      >
        <Calendar className="w-4 h-4 mr-3 text-gray-500" />
        <div className="flex-1 text-left">
          <div className="font-medium">{selectedOption?.label}</div>
          <div className="text-xs text-gray-500">{selectedOption?.description}</div>
        </div>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Header du dropdown */}
          <div className="px-4 py-3 bg-blue-france text-white rounded-t-lg">
            <div className="text-sm font-semibold">Période d'analyse</div>
            <div className="text-xs opacity-90 mt-1">Sélectionnez une année ou toutes les années</div>
          </div>
          
          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onYearChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-md transition-all duration-200 ${
                  selectedYear === option.value
                    ? 'bg-blue-france bg-opacity-10 text-blue-france border border-blue-france border-opacity-30'
                    : 'hover:bg-gray-50 text-gray-700 hover:border hover:border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{option.label}</div>
                    {selectedYear === option.value && (
                      <div className="w-5 h-5 bg-blue-france rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer informatif */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-lg">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-blue-france rounded-full flex items-center justify-center mt-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="text-xs text-gray-600">
                <strong>Données agrégées :</strong> Moyenne calculée sur toutes les années disponibles pour une vue d'ensemble des tendances.
              </div>
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