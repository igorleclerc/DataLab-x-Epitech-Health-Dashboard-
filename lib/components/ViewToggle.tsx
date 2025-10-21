'use client'

import { Map, BarChart3, TrendingUp } from 'lucide-react'
import type { ViewType } from '@/lib/types/dashboard'

interface ViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const views = [
    { id: 'map' as ViewType, label: 'Carte', icon: Map },
    { id: 'statistics' as ViewType, label: 'Statistiques', icon: BarChart3 },
    { id: 'analytics' as ViewType, label: 'Analyses', icon: TrendingUp }
  ]

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`
            flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${currentView === id
              ? 'bg-white text-blue-france shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }
          `}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </button>
      ))}
    </div>
  )
}