'use client'

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Chargement du dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Traitement des données en cours...</p>
      </div>
    </div>
  )
}