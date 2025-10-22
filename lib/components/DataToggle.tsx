"use client";

import { useState } from "react";
import { ChevronDown, Check, Syringe, Activity } from "lucide-react";
import {
  VACCINE_CONFIG,
  VACCINATION_TYPES,
  SURVEILLANCE_TYPES,
} from "@/lib/config/vaccines";
import type { DataType } from "@/lib/types/dashboard";

interface DataToggleProps {
  currentType: DataType;
  onTypeChange: (type: DataType) => void;
}

export function DataToggle({ currentType, onTypeChange }: DataToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = VACCINE_CONFIG[currentType];

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 min-w-[200px] shadow-sm"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: currentConfig.color }}
          />
        </div>

        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900">
            {currentConfig.name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {currentConfig.targetPopulation}
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown condensé */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header condensé */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 bg-white bg-opacity-20 rounded-lg mr-2">
                <div
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: currentConfig.color }}
                />
              </div>
              <div className="text-sm font-semibold">Type de données</div>
            </div>
          </div>

          <div className="p-2">
            {/* Section Vaccinations */}
            <div className="mb-3">
              <div className="flex items-center px-2 py-1 mb-1">
                <Syringe className="w-3 h-3 text-green-600 mr-2" />
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Vaccinations
                </div>
              </div>

              {VACCINATION_TYPES.map((type) => {
                const config = VACCINE_CONFIG[type];
                const isSelected = currentType === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      onTypeChange(type);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 ${
                      isSelected
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {/* Indicateur de couleur */}
                    <div
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />

                    {/* Contenu condensé */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">
                          {config.name}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-green-600 ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {config.targetPopulation}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Section Surveillance */}
            <div>
              <div className="flex items-center px-2 py-1 mb-1">
                <Activity className="w-3 h-3 text-red-600 mr-2" />
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Surveillance
                </div>
              </div>

              {SURVEILLANCE_TYPES.map((type) => {
                const config = VACCINE_CONFIG[type];
                const isSelected = currentType === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      onTypeChange(type);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 last:mb-0 ${
                      isSelected
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {/* Indicateur de couleur */}
                    <div
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />

                    {/* Contenu condensé */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">
                          {config.name}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-red-600 ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {config.targetPopulation}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
