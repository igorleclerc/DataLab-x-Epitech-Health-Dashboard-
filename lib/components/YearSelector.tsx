'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, Check, TrendingUp, Database } from 'lucide-react'

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
    { 
      value: 'all' as const, 
      label: 'Toutes les années', 
      description: 'Vue d\'ensemble 2021-2024',
      icon: TrendingUp,
      badge: 'Tendances'
    },
    ...availableYears.map(year => ({
      value: year,
      label: `Année ${year}`,
      description: `Données spécifiques à ${year}`,
      icon: Database,
      badge: year === 2024 ? 'Récent' : undefined
    }))
  ]

  const selectedOption = options.find(opt => opt.value === selectedYear)

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 min-w-[200px] shadow-sm"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
        
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900">{selectedOption?.label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{selectedOption?.description}</div>
        </div>
        
        <ChevronDown className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown condensé */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header condensé */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <div className="text-sm font-semibold">Période d'analyse</div>
            </div>
          </div>
          
          {/* Options condensées */}
          <div className="p-2">
            {options.map((option) => {
              const IconComponent = option.icon
              const isSelected = selectedYear === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onYearChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 last:mb-0 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {/* Icône */}
                  <IconComponent className={`w-4 h-4 mr-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                  
                  {/* Contenu condensé */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{option.label}</div>
                      <div className="flex items-center space-x-2">
                        {option.badge && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            option.badge === 'Tendances' 
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {option.badge}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {option.description}
                    </div>
                  </div>
                </button>
              )
            })}
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