'use client'

import { useState } from 'react'
import { HelpCircle, X, Map, BarChart3, TrendingUp } from 'lucide-react'

export function DashboardGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
      >
        <HelpCircle className="w-4 h-4 mr-1" />
        Guide d'utilisation
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Guide d'utilisation du Dashboard</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Vue Carte */}
                <div>
                  <div className="flex items-center mb-4">
                    <Map className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Vue Carte</h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <p className="text-gray-700">
                      <strong>Objectif :</strong> Visualiser rapidement la situation sanitaire par département sur une carte interactive de la France.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Interactions :</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• <strong>Survol</strong> : Détails du département</li>
                          <li>• <strong>Clic</strong> : Sélection pour statistiques</li>
                          <li>• <strong>Toggle</strong> : Basculer vaccination/grippe</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Code couleur :</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• <strong>Bleu foncé</strong> : Haute couverture/faible grippe</li>
                          <li>• <strong>Bleu clair</strong> : Performance moyenne</li>
                          <li>• <strong>Rouge</strong> : Faible couverture/forte grippe</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vue Statistiques */}
                <div>
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Vue Statistiques</h3>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <p className="text-gray-700">
                      <strong>Objectif :</strong> Analyser en détail les métriques d'un département sélectionné ou les moyennes nationales.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Section Profile :</h4>
                        <p className="text-gray-700">Population, groupes d'âge, indicateurs démographiques</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Métriques Clés :</h4>
                        <p className="text-gray-700">Couverture, population, classement vs national</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Détails par Type :</h4>
                        <p className="text-gray-700">Vaccins spécifiques ou indicateurs grippe détaillés</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vue Analyses */}
                <div>
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Vue Analyses Avancées</h3>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                    <p className="text-gray-700">
                      <strong>Objectif :</strong> Comprendre les tendances, corrélations et patterns dans les données de santé publique.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">1. Classement des Départements</h4>
                          <p className="text-gray-700">Compare les 10 meilleurs et 5 moins performants départements</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">2. Évolution Saisonnière</h4>
                          <p className="text-gray-700">Montre les variations typiques vaccination/grippe sur l'année</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">3. Distribution des Performances</h4>
                          <p className="text-gray-700">Répartit les départements par tranches de performance</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">4. Population vs Performance</h4>
                          <p className="text-gray-700">Explore la corrélation entre taille et performance</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">5. Types de Vaccins</h4>
                          <p className="text-gray-700">Compare les couvertures par type de vaccin vs objectifs</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">6. Indicateurs Clés</h4>
                          <p className="text-gray-700">Synthèse des métriques nationales et progression</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conseils d'utilisation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Conseils d'utilisation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Navigation efficace :</h4>
                      <ul className="space-y-1">
                        <li>• Commencez par la vue Carte pour identifier les zones d'intérêt</li>
                        <li>• Cliquez sur un département pour voir ses détails</li>
                        <li>• Utilisez les Analyses pour comprendre les tendances globales</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Interprétation :</h4>
                      <ul className="space-y-1">
                        <li>• Cliquez sur "Comprendre ce graphique" pour des explications</li>
                        <li>• Comparez toujours aux objectifs de santé publique</li>
                        <li>• Considérez les facteurs saisonniers et démographiques</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}