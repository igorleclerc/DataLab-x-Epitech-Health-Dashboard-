'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Syringe } from 'lucide-react';
import DepartmentGrid from './DepartmentGrid';
import { Select } from './Select';
import { ServiceDonneesComplet } from '../services/service-donnees-complet';

interface VaccinationMapData {
  code: string;
  name: string;
  value: number;
  region: string;
}

interface VaccinationCoverageMapProps {
  className?: string;
}

export default function VaccinationCoverageMap({ className = '' }: VaccinationCoverageMapProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('grippe65ansPlus');
  const [selectedYear, setSelectedYear] = useState<string>('2024');



  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const service = ServiceDonneesComplet.getInstance();
        const donnees = await service.chargerToutesDonnees();
        
        if (donnees.couvertureDetailleeParDepartement) {
          setData(donnees.couvertureDetailleeParDepartement);
        } else {
          setError('Aucune donnée de couverture détaillée disponible');
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fonction pour obtenir la valeur selon la métrique sélectionnée
  const getValueFromItem = (item: any, metric: string): number => {
    const metricsMap: { [key: string]: keyof any } = {
      'Grippe 65 ans et plus': 'grippe65ansPlus',
      'Grippe 65-74 ans': 'grippe65_74ans',
      'Grippe 75 ans et plus': 'grippe75ansPlus',
      'Grippe moins de 65 ans à risque': 'grippeMoins65ansRisque',
      'HPV filles 1 dose à 15 ans': 'hpvFilles1Dose15ans',
      'HPV filles 2 doses à 16 ans': 'hpvFilles2Doses16ans',
      'HPV garçons 1 dose à 15 ans': 'hpvGarcons1Dose15ans',
      'HPV garçons 2 doses à 16 ans': 'hpvGarcons2Doses16ans',
      'Méningocoque C 10-14 ans': 'meningocoque10_14ans',
      'Méningocoque C 15-19 ans': 'meningocoque15_19ans',
      'Méningocoque C 20-24 ans': 'meningocoque20_24ans',
      'Covid-19 65 ans et plus': 'covid19_65ansPlus'
    };
    
    const propertyName = metricsMap[metric];
    return propertyName ? (item[propertyName] || 0) : 0;
  };

  // Préparer les données pour la carte
  const mapData = useMemo(() => {
    if (!data.length) return [];

    // Filtrer les données par année sélectionnée
    const filteredData = data.filter(item => 
      item.annee?.toString() === selectedYear
    );

    // Transformer en format attendu par la carte
    return filteredData.map(item => ({
      code: item.departementCode?.toString() || '',
      name: item.departement || '',
      value: getValueFromItem(item, selectedMetric),
      region: item.region || ''
    })).filter(item => item.code && item.name && !isNaN(item.value) && item.value > 0);
  }, [data, selectedMetric, selectedYear]);

  // Obtenir les métriques disponibles
  const availableMetrics = useMemo(() => {
    return [
      'Grippe 65 ans et plus',
      'Grippe 65-74 ans',
      'Grippe 75 ans et plus',
      'Grippe moins de 65 ans à risque',
      'HPV filles 1 dose à 15 ans',
      'HPV filles 2 doses à 16 ans',
      'HPV garçons 1 dose à 15 ans',
      'HPV garçons 2 doses à 16 ans',
      'Méningocoque C 10-14 ans',
      'Méningocoque C 15-19 ans',
      'Méningocoque C 20-24 ans',
      'Covid-19 65 ans et plus'
    ];
  }, []);

  // Obtenir les années disponibles
  const availableYears = useMemo(() => {
    if (!data.length) return [];
    
    const years = [...new Set(data.map(item => item.annee?.toString()).filter(Boolean))];
    return years.sort((a, b) => parseInt(b) - parseInt(a)); // Tri décroissant
  }, [data]);

  const handleDepartmentClick = (department: VaccinationMapData) => {
    console.log('Département sélectionné:', department);
    // Ici vous pourriez ouvrir un modal avec plus de détails
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B01E09] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de vaccination...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contrôles de filtrage */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-[#10162F] mb-4">
          Couverture Vaccinale par Département
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection de la métrique */}
          <Select
            label="Type de vaccination"
            value={selectedMetric}
            onChange={setSelectedMetric}
            icon={Syringe}
            options={availableMetrics.map(([key, label]) => ({
              value: key,
              label: label,
              description: `Données de couverture ${label.toLowerCase()}`
            }))}
          />

          {/* Sélection de l'année */}
          <Select
            label="Année"
            value={selectedYear}
            onChange={setSelectedYear}
            icon={Calendar}
            options={availableYears.map(year => ({
              value: year.toString(),
              label: `Année ${year}`,
              description: `Données de l'année ${year}`
            }))}
          />
        </div>


      </div>

      {/* Carte interactive */}
      {mapData.length > 0 ? (
        <DepartmentGrid
          data={mapData}
          title={`Couverture ${selectedMetric} - ${selectedYear}`}
          metric="Taux de couverture (%)"
          onDepartmentClick={handleDepartmentClick}
        />
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <p className="text-gray-600">
            Aucune donnée disponible pour {selectedMetric} en {selectedYear}
          </p>
        </div>
      )}
    </div>
  );
}