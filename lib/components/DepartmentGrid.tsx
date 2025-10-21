"use client";

import React, { useState, useMemo } from "react";
import { scaleQuantile } from "d3-scale";
import { schemeBlues } from "d3-scale-chromatic";

interface DepartmentData {
  code: string;
  name: string;
  value: number;
  region: string;
}

interface DepartmentGridProps {
  data: DepartmentData[];
  title: string;
  metric: string;
  colorScheme?: readonly string[];
  onDepartmentClick?: (department: DepartmentData) => void;
}

export default function DepartmentGrid({
  data,
  title,
  metric,
  colorScheme = schemeBlues[7],
  onDepartmentClick,
}: DepartmentGridProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );

  // Créer une échelle de couleurs basée sur les données
  const colorScale = useMemo(() => {
    const values = data.map((d) => d.value).filter((v) => !isNaN(v) && v > 0);
    if (values.length === 0) return () => colorScheme[0];

    return scaleQuantile<string>().domain(values).range(colorScheme);
  }, [data, colorScheme]);

  // Grouper les départements par région
  const departmentsByRegion = useMemo(() => {
    const grouped = data.reduce((acc, dept) => {
      if (!acc[dept.region]) {
        acc[dept.region] = [];
      }
      acc[dept.region].push(dept);
      return acc;
    }, {} as Record<string, DepartmentData[]>);

    // Trier les départements dans chaque région par valeur décroissante
    Object.keys(grouped).forEach((region) => {
      grouped[region].sort((a, b) => b.value - a.value);
    });

    return grouped;
  }, [data]);

  const getFillColor = (department: DepartmentData) => {
    if (isNaN(department.value) || department.value <= 0) {
      return "#f0f0f0"; // Couleur grise pour les données manquantes
    }
    return colorScale(department.value);
  };

  const handleDepartmentClick = (department: DepartmentData) => {
    setSelectedDepartment(department.code);
    if (onDepartmentClick) {
      onDepartmentClick(department);
    }
  };

  // Calculer les statistiques
  const stats = useMemo(() => {
    const validValues = data.filter((d) => !isNaN(d.value) && d.value > 0);
    if (validValues.length === 0) return null;

    return {
      count: validValues.length,
      max: Math.max(...validValues.map((d) => d.value)),
      min: Math.min(...validValues.map((d) => d.value)),
      avg:
        validValues.reduce((sum, d) => sum + d.value, 0) / validValues.length,
    };
  }, [data]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#10162F] mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">Métrique: {metric}</p>

        {/* Statistiques rapides */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-[#10162F]">
                {stats.count}
              </div>
              <div className="text-xs text-gray-600">Départements</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-[#10162F]">
                {stats.max.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Maximum</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-[#10162F]">
                {stats.min.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Minimum</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-[#10162F]">
                {stats.avg.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Moyenne</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Grille des départements par région */}
        <div className="space-y-6">
          {Object.entries(departmentsByRegion).map(([region, departments]) => (
            <div
              key={region}
              className="border-b border-gray-100 pb-4 last:border-b-0"
            >
              <h4 className="text-lg font-semibold text-[#10162F] mb-3">
                {region}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {departments.map((dept) => (
                  <div
                    key={dept.code}
                    className={`
                      relative p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                      ${
                        selectedDepartment === dept.code
                          ? "border-[#B01E09] shadow-md scale-105"
                          : "border-transparent hover:border-gray-300 hover:shadow-sm"
                      }
                    `}
                    style={{ backgroundColor: getFillColor(dept) }}
                    onClick={() => handleDepartmentClick(dept)}
                    title={`${dept.name} (${dept.code}): ${dept.value.toFixed(
                      1
                    )}%`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold text-white bg-black bg-opacity-50 rounded px-1 mb-1">
                        {dept.code}
                      </div>
                      <div className="text-xs text-gray-800 font-medium truncate">
                        {dept.name}
                      </div>
                      <div className="text-sm font-bold text-gray-900 mt-1">
                        {dept.value.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#10162F] mb-2">
                Échelle de couleurs
              </div>
              <div className="flex items-center space-x-1">
                {colorScheme.slice(1).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  Faible → Élevé
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-4 rounded bg-gray-200 mr-2" />
              <span className="text-xs text-gray-500">Données manquantes</span>
            </div>
          </div>
        </div>

        {/* Département sélectionné */}
        {selectedDepartment && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {(() => {
              const dept = data.find((d) => d.code === selectedDepartment);
              return dept ? (
                <div>
                  <h5 className="font-semibold text-[#10162F]">
                    {dept.name} ({dept.code})
                  </h5>
                  <p className="text-sm text-gray-600">Région: {dept.region}</p>
                  <p className="text-sm">
                    <span className="font-medium">{metric}:</span>{" "}
                    {dept.value.toFixed(1)}%
                  </p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
