"use client";

import { useMemo } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  UserCheck,
  Baby,
} from "lucide-react";
import type { DepartmentData, DataType } from "@/lib/types/dashboard";

interface StatisticsPanelProps {
  dataType: DataType;
  selectedDepartment: string | null;
  departmentData: DepartmentData[];
}

export function StatisticsPanel({
  dataType,
  selectedDepartment,
  departmentData,
}: StatisticsPanelProps) {
  const selectedDept = useMemo(() => {
    return selectedDepartment
      ? departmentData.find((d) => d.code === selectedDepartment)
      : null;
  }, [selectedDepartment, departmentData]);

  const nationalStats = useMemo(() => {
    if (departmentData.length === 0) return null;

    const totalPopulation = departmentData.reduce(
      (sum, d) => sum + (d.population || 0),
      0
    );

    if (dataType !== "flu-surveillance") {
      const validCoverage = departmentData.filter(
        (d) => d.vaccinationCoverage !== undefined
      );
      const avgCoverage =
        validCoverage.length > 0
          ? validCoverage.reduce(
              (sum, d) => sum + (d.vaccinationCoverage || 0),
              0
            ) / validCoverage.length
          : 0;

      // Calculer la moyenne des groupes d'âge, pas la somme !
      const validAgeData65Plus = departmentData.filter(
        (d) => d.ageGroups?.["65+"] !== undefined
      );
      const ageGroup65Plus =
        validAgeData65Plus.length > 0
          ? validAgeData65Plus.reduce(
              (sum, d) => sum + (d.ageGroups?.["65+"] || 0),
              0
            ) / validAgeData65Plus.length
          : 0;

      const validAgeDataUnder65 = departmentData.filter(
        (d) => d.ageGroups?.["<65"] !== undefined
      );
      const ageGroupUnder65 =
        validAgeDataUnder65.length > 0
          ? validAgeDataUnder65.reduce(
              (sum, d) => sum + (d.ageGroups?.["<65"] || 0),
              0
            ) / validAgeDataUnder65.length
          : 0;

      return {
        totalPopulation,
        primaryMetric: avgCoverage,
        metricLabel: "Couverture Moyenne",
        metricUnit: "%",
        ageGroups: [
          { name: "65 ans et +", value: ageGroup65Plus, color: "#3b82f6" },
          { name: "Moins de 65 ans", value: ageGroupUnder65, color: "#93c5fd" },
        ],
      };
    } else {
      const validActivity = departmentData.filter(
        (d) => d.fluActivity !== undefined
      );
      const avgActivity =
        validActivity.length > 0
          ? validActivity.reduce((sum, d) => sum + (d.fluActivity || 0), 0) /
            validActivity.length
          : 0;

      return {
        totalPopulation,
        primaryMetric: avgActivity,
        metricLabel: "Activité Moyenne",
        metricUnit: "/100k",
        ageGroups: [
          { name: "65 ans et +", value: 0, color: "#ef4444" },
          { name: "Moins de 65 ans", value: 0, color: "#fca5a5" },
        ],
      };
    }
  }, [departmentData, dataType]);

  const departmentStats = useMemo(() => {
    if (!selectedDept || !nationalStats) return null;

    const primaryValue =
      dataType !== "flu-surveillance"
        ? selectedDept.vaccinationCoverage
        : selectedDept.fluActivity;

    const vsNational =
      primaryValue !== undefined
        ? primaryValue - nationalStats.primaryMetric
        : 0;

    return {
      department: selectedDept,
      primaryValue: primaryValue || 0,
      vsNational,
      ranking: selectedDept.ranking || 0,
      percentile: selectedDept.percentile || 0,
    };
  }, [selectedDept, nationalStats, dataType]);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  if (!nationalStats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-2">
          <MapPin className="w-5 h-5 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedDept ? selectedDept.name : "France"}
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {dataType !== "flu-surveillance"
            ? "Couverture vaccinale"
            : "Surveillance grippale"}
        </p>
        {selectedDept && (
          <div className="text-sm text-blue-600 mt-1">
            Département {selectedDept.code}
          </div>
        )}
      </div>

      {/* Organic Layout */}
      <div className="p-6 space-y-6">
        {/* Primary Metric - Hero Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">
              {departmentStats ? departmentStats.department.name : "France"}
            </h3>
            {departmentStats && getTrendIcon(departmentStats.vsNational)}
          </div>
          <div className="text-4xl font-bold text-blue-900 mb-2">
            {formatNumber(
              departmentStats?.primaryValue || nationalStats.primaryMetric
            )}
            <span className="text-xl font-normal text-blue-700 ml-2">
              {nationalStats.metricUnit}
            </span>
          </div>
          <div className="text-sm text-blue-700">
            {nationalStats.metricLabel}
          </div>
          {departmentStats && (
            <div className="mt-3 text-sm text-blue-800">
              {departmentStats.vsNational > 0 ? "+" : ""}
              {formatNumber(departmentStats.vsNational)} vs moyenne nationale
            </div>
          )}
        </div>

        {/* Population & Ranking */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-gray-600 mr-3" />
              <h4 className="text-base font-medium text-gray-900">
                Population
              </h4>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(
                departmentStats?.department.population ||
                nationalStats.totalPopulation
              ).toLocaleString("fr-FR")}
            </div>
            <div className="text-sm text-gray-600">Habitants</div>
          </div>

          {departmentStats && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 text-gray-600 mr-3" />
                <h4 className="text-base font-medium text-gray-900">
                  Classement
                </h4>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                #{departmentStats.ranking}
              </div>
              <div className="text-sm text-gray-600">
                {departmentStats.percentile}e percentile
              </div>
            </div>
          )}
        </div>

        {/* Age Groups - Only if data available */}
        {nationalStats.ageGroups.some((g) => g.value > 0) && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Répartition par Âge
            </h4>
            <div className="space-y-3">
              {nationalStats.ageGroups.map((group, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {group.name.includes("65") ? (
                      <UserCheck className="w-5 h-5 text-blue-600 mr-3" />
                    ) : (
                      <Baby className="w-5 h-5 text-blue-400 mr-3" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {group.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatNumber(group.value, 0)}
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      {dataType !== "flu-surveillance" ? "%" : "/100k"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vaccine Types Detail (if vaccination and department selected) */}
        {dataType !== "flu-surveillance" && selectedDept?.vaccineTypes && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Détail par Groupes
            </h4>
            <div className="space-y-3">
              {/* Affichage conditionnel selon le type de vaccination */}
              {dataType === "grippe-vaccination" && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      65 ans et plus
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedDept.vaccineTypes.grippe65ansPlus.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Moins de 65 ans à risque
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedDept.vaccineTypes.grippeMoins65.toFixed(1)}%
                    </span>
                  </div>
                </>
              )}

              {dataType === "hpv-vaccination" && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Filles 11-14 ans
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedDept.vaccineTypes.hpvFilles.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Garçons 11-14 ans
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedDept.vaccineTypes.hpvGarcons.toFixed(1)}%
                    </span>
                  </div>
                </>
              )}

              {dataType === "covid-vaccination" && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      65 ans et plus
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedDept.ageGroups?.["65+"]?.toFixed(1) || "N/A"}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      12-64 ans
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedDept.ageGroups?.["<65"]?.toFixed(1) || "N/A"}%
                    </span>
                  </div>
                </>
              )}

              {dataType === "meningocoque-vaccination" && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Nourrissons et jeunes adultes
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedDept.vaccineTypes.meningocoque.toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Méningocoque
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedDept.vaccineTypes.meningocoque.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  COVID-19
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedDept.vaccineTypes.covid19.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Flu Details (if flu surveillance and department selected) */}
        {dataType === "flu-surveillance" && selectedDept?.fluDetails && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Surveillance Épidémiologique
            </h4>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Urgences
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedDept.fluDetails.urgencyVisits.toFixed(1)}/100k
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Hospitalisations
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedDept.fluDetails.hospitalizations.toFixed(1)}/100k
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  SOS Médecins
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {selectedDept.fluDetails.sosConsultations.toFixed(1)}/100k
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Tendance hebdomadaire
                </span>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    selectedDept.fluDetails.weeklyTrend === "up"
                      ? "bg-red-100 text-red-700"
                      : selectedDept.fluDetails.weeklyTrend === "down"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedDept.fluDetails.weeklyTrend === "up"
                    ? "↗️ Hausse"
                    : selectedDept.fluDetails.weeklyTrend === "down"
                    ? "↘️ Baisse"
                    : "➡️ Stable"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  vs année précédente
                </span>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    selectedDept.fluDetails.seasonalComparison > 0
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedDept.fluDetails.seasonalComparison > 0 ? "+" : ""}
                  {selectedDept.fluDetails.seasonalComparison.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            💡 Navigation
          </h4>
          <p className="text-sm text-blue-700">
            {selectedDept
              ? "Cliquez sur un autre département ou sur le département sélectionné pour revenir à la vue nationale."
              : "Cliquez sur un département de la carte pour voir ses statistiques détaillées."}
          </p>
        </div>
      </div>
    </div>
  );
}
