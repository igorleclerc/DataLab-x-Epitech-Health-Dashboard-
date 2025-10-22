'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  description?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function Select({ value, onChange, options, placeholder = "Sélectionner...", label, icon: Icon }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-full flex items-center px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-sm"
      >
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
        )}
        
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900">
            {selectedOption?.label || placeholder}
          </div>
          {selectedOption?.description && (
            <div className="text-xs text-gray-500 mt-0.5">
              {selectedOption.description}
            </div>
          )}
        </div>
        
        <ChevronDown className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown condensé */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            {options.map((option) => {
              const isSelected = value === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 last:mb-0 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{option.label}</div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    {option.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {option.description}
                      </div>
                    )}
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