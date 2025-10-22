"use client";

import { useState, useEffect } from "react";
import { InteractiveMap } from "@/lib/components/InteractiveMap";
import { StatisticsPanel } from "@/lib/components/StatisticsPanel";
import { AnalyticsPanel } from "@/lib/components/AnalyticsPanel";
import { DataToggle } from "@/lib/components/DataToggle";
import { ViewToggle } from "@/lib/components/ViewToggle";
import { YearSelector } from "@/lib/components/YearSelector";
import { LoadingSpinner } from "@/lib/components/LoadingSpinner";
import { DataQualityIndicator } from "@/lib/components/DataQualityIndicator";
import { DashboardGuide } from "@/lib/components/DashboardGuide";
import { dashboardDataService } from "@/lib/services/dashboard-data-service";
import type { DepartmentData, DataType, ViewType } from "@/lib/types/dashboard";
import Image from "next/image";

export default function Dashboard() {
  const [dataType, setDataType] = useState<DataType>("grippe-vaccination");
  const [currentView, setCurrentView] = useState<ViewType>("map");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([
    2021, 2022, 2023, 2024,
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Load available years first
        const years = await dashboardDataService.getAvailableYears();
        setAvailableYears(years);

        // Load real data based on current data type and year
        console.log(
          `🔄 Début du chargement: ${dataType}, année: ${selectedYear}`
        );
        const data =
          selectedYear === "all"
            ? await dashboardDataService.generateAggregatedData(dataType)
            : await dashboardDataService.generateDepartmentData(
                dataType,
                selectedYear
              );
        console.log(`✅ Données chargées:`, data);
        setDepartmentData(data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataType, selectedYear]);

  const handleDataTypeChange = (newDataType: DataType) => {
    setDataType(newDataType);
  };

  const handleDepartmentSelect = (departmentCode: string | null) => {
    setSelectedDepartment(departmentCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="">
          <Image src="/logo.png" alt="Logo" width={150} height={150} />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-france">
              Dashboard Vaccination & Grippe
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Données de surveillance sanitaire - France 2021-2024
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <DataToggle
              currentType={dataType}
              onTypeChange={handleDataTypeChange}
            />

            <YearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              dataType={dataType}
            />
          </div>
        </div>

        {/* Barre de navigation secondaire - responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-50">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <DataQualityIndicator
              dataCount={departmentData.length}
              dataType={dataType}
              selectedYear={selectedYear}
            />
            <DashboardGuide />
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-200px)] lg:h-[calc(100vh-180px)]">
        {currentView === "map" && (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Carte - responsive */}
            <div className="flex-1 lg:w-[70%] p-2 sm:p-4 lg:pb-6 order-2 lg:order-1">
              <InteractiveMap
                data={departmentData}
                dataType={dataType}
                selectedDepartment={selectedDepartment}
                onDepartmentSelect={handleDepartmentSelect}
              />
            </div>

            <div className="w-full lg:w-[30%] border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50 order-1 lg:order-2 max-h-[40vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
              <StatisticsPanel
                dataType={dataType}
                selectedDepartment={selectedDepartment}
                departmentData={departmentData}
              />
            </div>
          </div>
        )}

        {currentView === "statistics" && (
          <div className="h-full p-2 sm:p-4">
            <StatisticsPanel
              dataType={dataType}
              selectedDepartment={selectedDepartment}
              departmentData={departmentData}
            />
          </div>
        )}

        {currentView === "analytics" && (
          <div className="h-full">
            <AnalyticsPanel
              dataType={dataType}
              departmentData={departmentData}
              selectedDepartment={selectedDepartment}
            />
          </div>
        )}
      </main>
    </div>
  );
}
