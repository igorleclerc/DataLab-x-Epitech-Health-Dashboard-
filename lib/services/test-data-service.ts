import type { DepartmentData, DataType } from '@/lib/types/dashboard'

// Données de test pour les départements français
const FRENCH_DEPARTMENTS = [
  { code: '01', name: 'Ain' },
  { code: '02', name: 'Aisne' },
  { code: '03', name: 'Allier' },
  { code: '04', name: 'Alpes-de-Haute-Provence' },
  { code: '05', name: 'Hautes-Alpes' },
  { code: '06', name: 'Alpes-Maritimes' },
  { code: '07', name: 'Ardèche' },
  { code: '08', name: 'Ardennes' },
  { code: '09', name: 'Ariège' },
  { code: '10', name: 'Aube' },
  { code: '11', name: 'Aude' },
  { code: '12', name: 'Aveyron' },
  { code: '13', name: 'Bouches-du-Rhône' },
  { code: '14', name: 'Calvados' },
  { code: '15', name: 'Cantal' },
  { code: '16', name: 'Charente' },
  { code: '17', name: 'Charente-Maritime' },
  { code: '18', name: 'Cher' },
  { code: '19', name: 'Corrèze' },
  { code: '21', name: 'Côte-d\'Or' },
  { code: '22', name: 'Côtes-d\'Armor' },
  { code: '23', name: 'Creuse' },
  { code: '24', name: 'Dordogne' },
  { code: '25', name: 'Doubs' },
  { code: '26', name: 'Drôme' },
  { code: '27', name: 'Eure' },
  { code: '28', name: 'Eure-et-Loir' },
  { code: '29', name: 'Finistère' },
  { code: '30', name: 'Gard' },
  { code: '31', name: 'Haute-Garonne' },
  { code: '32', name: 'Gers' },
  { code: '33', name: 'Gironde' },
  { code: '34', name: 'Hérault' },
  { code: '35', name: 'Ille-et-Vilaine' },
  { code: '36', name: 'Indre' },
  { code: '37', name: 'Indre-et-Loire' },
  { code: '38', name: 'Isère' },
  { code: '39', name: 'Jura' },
  { code: '40', name: 'Landes' },
  { code: '41', name: 'Loir-et-Cher' },
  { code: '42', name: 'Loire' },
  { code: '43', name: 'Haute-Loire' },
  { code: '44', name: 'Loire-Atlantique' },
  { code: '45', name: 'Loiret' },
  { code: '46', name: 'Lot' },
  { code: '47', name: 'Lot-et-Garonne' },
  { code: '48', name: 'Lozère' },
  { code: '49', name: 'Maine-et-Loire' },
  { code: '50', name: 'Manche' },
  { code: '51', name: 'Marne' },
  { code: '52', name: 'Haute-Marne' },
  { code: '53', name: 'Mayenne' },
  { code: '54', name: 'Meurthe-et-Moselle' },
  { code: '55', name: 'Meuse' },
  { code: '56', name: 'Morbihan' },
  { code: '57', name: 'Moselle' },
  { code: '58', name: 'Nièvre' },
  { code: '59', name: 'Nord' },
  { code: '60', name: 'Oise' },
  { code: '61', name: 'Orne' },
  { code: '62', name: 'Pas-de-Calais' },
  { code: '63', name: 'Puy-de-Dôme' },
  { code: '64', name: 'Pyrénées-Atlantiques' },
  { code: '65', name: 'Hautes-Pyrénées' },
  { code: '66', name: 'Pyrénées-Orientales' },
  { code: '67', name: 'Bas-Rhin' },
  { code: '68', name: 'Haut-Rhin' },
  { code: '69', name: 'Rhône' },
  { code: '70', name: 'Haute-Saône' },
  { code: '71', name: 'Saône-et-Loire' },
  { code: '72', name: 'Sarthe' },
  { code: '73', name: 'Savoie' },
  { code: '74', name: 'Haute-Savoie' },
  { code: '75', name: 'Paris' },
  { code: '76', name: 'Seine-Maritime' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '78', name: 'Yvelines' },
  { code: '79', name: 'Deux-Sèvres' },
  { code: '80', name: 'Somme' },
  { code: '81', name: 'Tarn' },
  { code: '82', name: 'Tarn-et-Garonne' },
  { code: '83', name: 'Var' },
  { code: '84', name: 'Vaucluse' },
  { code: '85', name: 'Vendée' },
  { code: '86', name: 'Vienne' },
  { code: '87', name: 'Haute-Vienne' },
  { code: '88', name: 'Vosges' },
  { code: '89', name: 'Yonne' },
  { code: '90', name: 'Territoire de Belfort' },
  { code: '91', name: 'Essonne' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: 'Val-d\'Oise' },
  { code: '2A', name: 'Corse-du-Sud' },
  { code: '2B', name: 'Haute-Corse' }
]

import { VACCINE_CONFIG } from '@/lib/config/vaccines'

export class TestDataService {
  static generateDepartmentData(dataType: DataType, year: number = 2024): DepartmentData[] {
    return FRENCH_DEPARTMENTS.map((dept, index) => {
      // Générer des données spécifiques selon le type de vaccin/surveillance
      let primaryValue: number
      let ageGroups: { '65+': number; '<65': number }
      
      switch (dataType) {
        case 'grippe-vaccination':
          // Grippe : meilleure couverture chez les 65+, plus faible chez les <65
          const grippe65ansPlus = 55 + Math.random() * 35 // 55-90%
          const grippeMoins65 = 20 + Math.random() * 25 // 20-45%
          primaryValue = (grippe65ansPlus + grippeMoins65) / 2
          ageGroups = { '65+': grippe65ansPlus, '<65': grippeMoins65 }
          break
          
        case 'hpv-vaccination':
          // HPV : ciblé sur les adolescents, différence filles/garçons
          const hpvFilles = 45 + Math.random() * 35 // 45-80%
          const hpvGarcons = 25 + Math.random() * 30 // 25-55%
          primaryValue = (hpvFilles + hpvGarcons) / 2
          ageGroups = { '65+': hpvFilles, '<65': hpvGarcons } // Réutilise les champs pour filles/garçons
          break
          
        case 'covid-vaccination':
          // COVID : couverture élevée mais variable
          const covid65Plus = 75 + Math.random() * 20 // 75-95%
          const covidMoins65 = 60 + Math.random() * 25 // 60-85%
          primaryValue = (covid65Plus + covidMoins65) / 2
          ageGroups = { '65+': covid65Plus, '<65': covidMoins65 }
          break
          
        case 'meningocoque-vaccination':
          // Méningocoque : ciblé sur les jeunes
          const meningoJeunes = 50 + Math.random() * 30 // 50-80%
          const meningoAutres = 30 + Math.random() * 20 // 30-50%
          primaryValue = (meningoJeunes + meningoAutres) / 2
          ageGroups = { '65+': meningoAutres, '<65': meningoJeunes }
          break
          
        case 'flu-surveillance':
          // Surveillance grippe : cas diagnostiqués (varie selon la saison)
          const baseActivity = 25 + Math.random() * 30 // 25-55 pour 100k
          // Variation saisonnière : plus élevé en hiver
          const seasonalMultiplier = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 0.3 + 1
          primaryValue = baseActivity * seasonalMultiplier
          ageGroups = {
            '65+': primaryValue * (1.2 + Math.random() * 0.3), // Plus touchés
            '<65': primaryValue * (0.8 + Math.random() * 0.4)
          }
          break
          
        default:
          primaryValue = 50
          ageGroups = { '65+': 50, '<65': 50 }
      }

      return {
        code: dept.code,
        name: dept.name,
        population: 50000 + Math.random() * 500000,
        vaccinationCoverage: dataType !== 'flu-surveillance' ? primaryValue : undefined,
        fluActivity: dataType === 'flu-surveillance' ? primaryValue : undefined,
        year: year,
        ageGroups,
        vaccineTypes: {
          grippe65ansPlus: ageGroups['65+'],
          grippeMoins65: ageGroups['<65'],
          hpvFilles: dataType === 'hpv-vaccination' ? ageGroups['65+'] : 45 + Math.random() * 25,
          hpvGarcons: dataType === 'hpv-vaccination' ? ageGroups['<65'] : 25 + Math.random() * 20,
          meningocoque: dataType === 'meningocoque-vaccination' ? primaryValue : 40 + Math.random() * 30,
          covid19: dataType === 'covid-vaccination' ? primaryValue : 70 + Math.random() * 20
        },
        fluDetails: {
          urgencyVisits: dataType === 'flu-surveillance' ? primaryValue * 0.6 : 15 + Math.random() * 20,
          hospitalizations: dataType === 'flu-surveillance' ? primaryValue * 0.15 : 5 + Math.random() * 10,
          sosConsultations: dataType === 'flu-surveillance' ? primaryValue * 0.8 : 20 + Math.random() * 25,
          weeklyTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          seasonalComparison: dataType === 'flu-surveillance' ? -10 + Math.random() * 20 : 0 // -10% à +10% vs année précédente
        },
        ranking: index + 1,
        percentile: Math.round(((FRENCH_DEPARTMENTS.length - index) / FRENCH_DEPARTMENTS.length) * 100)
      }
    }).sort((a, b) => {
      const aValue = dataType === 'flu-surveillance' ? (a.fluActivity || 0) : (a.vaccinationCoverage || 0)
      const bValue = dataType === 'flu-surveillance' ? (b.fluActivity || 0) : (b.vaccinationCoverage || 0)
      
      // Pour la surveillance grippe, plus bas = mieux (donc ordre inverse)
      if (dataType === 'flu-surveillance') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    }).map((dept, index) => ({
      ...dept,
      ranking: index + 1,
      percentile: Math.round(((FRENCH_DEPARTMENTS.length - index) / FRENCH_DEPARTMENTS.length) * 100)
    }))
  }

  static getAvailableYears(): number[] {
    return [2021, 2022, 2023, 2024]
  }

  static generateAggregatedData(dataType: DataType): DepartmentData[] {
    // Générer des données agrégées sur toutes les années
    const years = this.getAvailableYears()
    const departmentMap = new Map<string, DepartmentData>()

    // Pour chaque année, générer les données et les agréger
    years.forEach(year => {
      const yearData = this.generateDepartmentData(dataType, year)
      
      yearData.forEach(dept => {
        const existing = departmentMap.get(dept.code)
        
        if (!existing) {
          departmentMap.set(dept.code, {
            ...dept,
            year: undefined // Pas d'année spécifique pour les données agrégées
          })
        } else {
          // Moyenner les valeurs sur toutes les années
          if (dept.vaccinationCoverage && existing.vaccinationCoverage) {
            existing.vaccinationCoverage = (existing.vaccinationCoverage + dept.vaccinationCoverage) / 2
          }
          if (dept.fluActivity && existing.fluActivity) {
            existing.fluActivity = (existing.fluActivity + dept.fluActivity) / 2
          }
          if (dept.ageGroups && existing.ageGroups) {
            existing.ageGroups['65+'] = (existing.ageGroups['65+'] + dept.ageGroups['65+']) / 2
            existing.ageGroups['<65'] = (existing.ageGroups['<65'] + dept.ageGroups['<65']) / 2
          }
          if (dept.vaccineTypes && existing.vaccineTypes) {
            Object.keys(dept.vaccineTypes).forEach(key => {
              const k = key as keyof typeof dept.vaccineTypes
              if (dept.vaccineTypes![k] && existing.vaccineTypes![k]) {
                existing.vaccineTypes![k] = (existing.vaccineTypes![k] + dept.vaccineTypes![k]) / 2
              }
            })
          }
        }
      })
    })

    // Convertir en array et trier
    const sortedData = Array.from(departmentMap.values())
      .sort((a, b) => {
        const aValue = dataType === 'flu-surveillance' ? (a.fluActivity || 0) : (a.vaccinationCoverage || 0)
        const bValue = dataType === 'flu-surveillance' ? (b.fluActivity || 0) : (b.vaccinationCoverage || 0)
        
        if (dataType === 'flu-surveillance') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })

    const aggregatedData: DepartmentData[] = sortedData.map((dept, index) => ({
        ...dept,
        ranking: index + 1,
        percentile: Math.round(((sortedData.length - index) / sortedData.length) * 100)
      }))

    return aggregatedData
  }
}