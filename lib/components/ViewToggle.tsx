'use client'

import { Map, BarChart3, TrendingUp } from 'lucide-react'
import type { ViewType } from '@/lib/types/dashboard'

interface ViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const views = [
    { 
      id: 'map' as ViewType, 
      label: 'Carte', 
      icon: Map,
      description: 'Vue géographique',
      color: 'blue'
    },
    { 
      id: 'statistics' as ViewType, 
      label: 'Statistiques', 
      icon: BarChart3,
      description: 'Données chiffrées',
      color: 'green'
    },
    { 
      id: 'analytics' as ViewType, 
      label: 'Analyses', 
      icon: TrendingUp,
      description: 'Tendances avancées',
      color: 'purple'
    }
  ]

  return (
    <div className="flex flex-col sm:flex-row bg-gray-100 rounded-2xl p-2 shadow-inner gap-1 sm:gap-0">
      {views.map(({ id, label, icon: Icon, description, color }) => {
        const isActive = currentView === id
        
        const colorClasses: Record<string, { active: string; inactive: string }> = {
          blue: {
            active: 'bg-blue-600 text-white shadow-lg shadow-blue-200',
            inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          },
          green: {
            active: 'bg-green-600 text-white shadow-lg shadow-green-200',
            inactive: 'text-gray-600 hover:text-green-600 hover:bg-green-50'
          },
          purple: {
            active: 'bg-purple-600 text-white shadow-lg shadow-purple-200',
            inactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
          }
        }
        
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`
              flex flex-col sm:flex-row items-center px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 min-w-[100px] sm:min-w-[120px] justify-center sm:justify-start
              ${isActive 
                ? colorClasses[color].active
                : colorClasses[color].inactive
              }
            `}
          >
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1 sm:mb-0 sm:mr-3 transition-colors ${
              isActive 
                ? 'bg-black bg-opacity-15 shadow-inner' 
                : 'bg-gray-200'
            }`}>
              <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${
                isActive 
                  ? 'text-white filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]' 
                  : 'text-gray-500'
              }`} />
            </div>
            
            {/* Version desktop */}
            <div className="text-left hidden sm:block">
              <div className="font-semibold">{label}</div>
              <div className={`text-xs mt-0.5 ${
                isActive 
                  ? 'text-white text-opacity-80' 
                  : 'text-gray-500'
              }`}>
                {description}
              </div>
            </div>
            
            {/* Version mobile */}
            <div className="text-center sm:hidden">
              <div className={`text-xs font-medium ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-600'
              }`}>
                {label}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}