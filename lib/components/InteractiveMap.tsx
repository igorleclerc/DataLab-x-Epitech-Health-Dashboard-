'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { scaleQuantile } from 'd3-scale'
import { schemeBlues, schemeReds, schemeGreens, schemeOranges } from 'd3-scale-chromatic'
import { VACCINE_CONFIG } from '@/lib/config/vaccines'
import type { DepartmentData, DataType } from '@/lib/types/dashboard'

// French departments topojson URL
const FRANCE_TOPO_JSON = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson"

interface InteractiveMapProps {
  data: DepartmentData[]
  dataType: DataType
  selectedDepartment: string | null
  onDepartmentSelect: (departmentCode: string | null) => void
}

export function InteractiveMap({ 
  data, 
  dataType, 
  selectedDepartment, 
  onDepartmentSelect 
}: InteractiveMapProps) {
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    content: string
    visible: boolean
  }>({
    x: 0,
    y: 0,
    content: '',
    visible: false
  })

  // Create color scale based on data type
  const getColorScale = () => {
    const values = data
      .map(d => dataType === 'flu-surveillance' ? d.fluActivity : d.vaccinationCoverage)
      .filter(v => v !== undefined) as number[]
    
    if (values.length === 0) return null
    
    // Choisir le schéma de couleur selon le type de données
    let colorScheme: readonly string[]
    switch (dataType) {
      case 'grippe-vaccination':
        colorScheme = schemeBlues[5]
        break
      case 'hpv-vaccination':
        colorScheme = schemeOranges[5]
        break
      case 'covid-vaccination':
        colorScheme = schemeReds[5]
        break
      case 'meningocoque-vaccination':
        colorScheme = schemeGreens[5]
        break
      case 'flu-surveillance':
        colorScheme = schemeReds[5]
        break
      default:
        colorScheme = schemeBlues[5]
    }
    
    return scaleQuantile<string>()
      .domain(values)
      .range(colorScheme)
  }

  const colorScale = getColorScale()

  const getDepartmentColor = (departmentCode: string) => {
    const dept = data.find(d => d.code === departmentCode)
    if (!dept || !colorScale) return '#f3f4f6' // Gray for missing data
    
    const value = dataType === 'flu-surveillance' ? dept.fluActivity : dept.vaccinationCoverage
    if (value === undefined) return '#f3f4f6'
    
    return colorScale(value)
  }

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const departmentCode = geo.properties.code || geo.properties.CODE_DEPT
    const dept = data.find(d => d.code === departmentCode)
    
    setHoveredDepartment(departmentCode)
    
    if (dept) {
      const config = VACCINE_CONFIG[dataType]
      const value = dataType === 'flu-surveillance' 
        ? dept.fluActivity 
        : dept.vaccinationCoverage
      
      let content = `${dept.name}\n`
      content += `${config.name}: ${value?.toFixed(1) || 'N/A'}${config.unit}\n`
      
      // Ajouter des détails spécifiques selon le type
      if (dataType === 'grippe-vaccination' && dept.vaccineTypes) {
        content += `65+ ans: ${dept.vaccineTypes.grippe65Plus.toFixed(1)}%\n`
        content += `<65 ans: ${dept.vaccineTypes.grippeMoins65.toFixed(1)}%`
      } else if (dataType === 'hpv-vaccination' && dept.vaccineTypes) {
        content += `Filles: ${dept.vaccineTypes.hpvFilles.toFixed(1)}%\n`
        content += `Garçons: ${dept.vaccineTypes.hpvGarcons.toFixed(1)}%`
      } else if (dataType === 'covid-vaccination' && dept.vaccineTypes) {
        content += `65+ ans: ${dept.ageGroups?.['65+']?.toFixed(1) || 'N/A'}%\n`
        content += `<65 ans: ${dept.ageGroups?.['<65']?.toFixed(1) || 'N/A'}%`
      } else if (dataType === 'flu-surveillance' && dept.fluDetails) {
        content += `Urgences: ${dept.fluDetails.urgencyVisits.toFixed(1)}/100k\n`
        content += `SOS Médecins: ${dept.fluDetails.sosConsultations.toFixed(1)}/100k`
      }
      
      content += `\nPopulation: ${dept.population?.toLocaleString('fr-FR') || 'N/A'}`
      
      if (dataType === 'flu-surveillance') {
        content += `\nSeuil épidémique: ${config.objective}${config.unit}`
        if (dept.fluDetails?.weeklyTrend) {
          const trendText = dept.fluDetails.weeklyTrend === 'up' ? '↗️ Hausse' : 
                           dept.fluDetails.weeklyTrend === 'down' ? '↘️ Baisse' : '➡️ Stable'
          content += `\nTendance: ${trendText}`
        }
      } else {
        content += `\nObjectif: ${config.objective}${config.unit}`
      }
      
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        content,
        visible: true
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDepartment(null)
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY
      }))
    }
  }

  const handleClick = (geo: any) => {
    const departmentCode = geo.properties.code || geo.properties.CODE_DEPT
    onDepartmentSelect(
      selectedDepartment === departmentCode ? null : departmentCode
    )
  }

  return (
    <div className="relative h-full bg-white rounded-lg border border-gray-200">
      {/* Map Title */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {VACCINE_CONFIG[dataType].name} par Département
          </h2>
          <div className="text-sm text-gray-600">
            {VACCINE_CONFIG[dataType].targetPopulation}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-600">
            {VACCINE_CONFIG[dataType].description}
          </p>
          {/* Indicateur de données agrégées si applicable */}
          {data.length > 0 && !data[0].year && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Données moyennées 2021-2024
            </span>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100%-60px)]" onMouseMove={handleMouseMove}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 2800,
            center: [2.5, 46.8]
          }}
          width={800}
          height={600}
          className="w-full h-full"
        >
          <ZoomableGroup>
            <Geographies geography={FRANCE_TOPO_JSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const departmentCode = geo.properties.code || geo.properties.CODE_DEPT
                  const isHovered = hoveredDepartment === departmentCode
                  const isSelected = selectedDepartment === departmentCode
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getDepartmentColor(departmentCode)}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 0.5}
                      style={{
                        default: {
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        hover: {
                          outline: 'none',
                          filter: 'brightness(0.9)',
                          cursor: 'pointer'
                        },
                        pressed: {
                          outline: 'none'
                        }
                      }}
                      onMouseEnter={(event) => handleMouseEnter(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-10 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 pointer-events-none shadow-xl max-w-xs"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            {tooltip.content.split('\n').map((line, index) => (
              <div key={index} className={`
                ${index === 0 ? 'font-semibold text-base border-b border-gray-700 pb-1 mb-2' : ''}
                ${line.includes(':') && index > 0 ? 'flex justify-between' : ''}
              `}>
                {line.includes(':') && index > 0 ? (
                  <>
                    <span>{line.split(':')[0]}:</span>
                    <span className="font-medium">{line.split(':')[1]}</span>
                  </>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      {colorScale && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-4 shadow-lg">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            {VACCINE_CONFIG[dataType].name}
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              {colorScale.range().map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-4 border border-gray-300 first:rounded-l last:rounded-r"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Faible</span>
              <span>Élevé</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {dataType === 'flu-surveillance' 
                ? `Seuil épidémique: ${VACCINE_CONFIG[dataType].objective}${VACCINE_CONFIG[dataType].unit}`
                : `Objectif: ${VACCINE_CONFIG[dataType].objective}${VACCINE_CONFIG[dataType].unit}`
              } • {VACCINE_CONFIG[dataType].targetPopulation}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}