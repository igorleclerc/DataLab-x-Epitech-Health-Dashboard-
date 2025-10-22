import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-6">La page que vous recherchez n'existe pas.</p>
        <Link 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-blue-france text-white rounded-lg hover:bg-blue-france-hover transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}