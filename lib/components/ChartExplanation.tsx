'use client'

import { useState } from 'react'
import { Info, X } from 'lucide-react'

interface ChartExplanationProps {
  title: string
  explanation: string
  insights: string[]
}

export function ChartExplanation({ title, explanation, insights }: ChartExplanationProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <Info className="w-4 h-4 mr-1" />
        Comprendre ce graphique
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Que montre ce graphique ?</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Points clés à retenir :</h4>
                  <ul className="space-y-2">
                    {insights.map((insight, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}