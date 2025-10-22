import type { DepartmentData, DataType } from '@/lib/types/dashboard';

export class DashboardDataService {
  private static instance: DashboardDataService;
  private availableYears: number[] | null = null;
  private populationData: Map<string, number> | null = null;

  private constructor() {}

  static getInstance(): DashboardDataService {
    if (!DashboardDataService.instance) {
      DashboardDataService.instance = new DashboardDataService();
    }
    return DashboardDataService.instance;
  }

  async getAvailableYears(): Promise<number[]> {
    if (this.availableYears) {
      return this.availableYears;
    }
    

    await this.loadAvailableYears();
    return this.availableYears || [2021, 2022, 2023, 2024];
  }


  private async loadAvailableYears(): Promise<void> {
    const years = new Set<number>();
    
    try {
      // Charger les années depuis les données départementales
      const departmentalData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescent-et-adultes-departement.csv');
      departmentalData.forEach(item => {
        const year = parseInt(item['Année']);
        if (year && year >= 2000) {
          years.add(year);
        }
      });
      
      // Charger les années depuis les fichiers de campagne
      const campaignFiles = ['2021', '2022', '2023', '2024'];
      for (const yearStr of campaignFiles) {
        try {
          const campaignData = await this.loadCSV(`/data/campagne-${yearStr}.csv`);
          if (campaignData.length > 0) {
            years.add(parseInt(yearStr));
          }
        } catch (error) {
          // Ignorer si le fichier n'existe pas
        }
      }
      
      this.availableYears = Array.from(years).sort();
      console.log(`📅 Années disponibles chargées:`, this.availableYears);
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error);
      this.availableYears = [2021, 2022, 2023, 2024];
    }
  }

  /**
   * Met à jour les années disponibles depuis les données chargées
   */
  private updateAvailableYears(data: any[]): void {
    const years = new Set<number>();
    data.forEach(item => {
      const year = parseInt(item['Année']) || parseInt(item['campagne']?.split('-')[0]);
      if (year && year >= 2000) {
        years.add(year);
      }
    });
    this.availableYears = Array.from(years).sort();
  }

  /**
   * Charge un fichier CSV
   */
  private async loadCSV(filePath: string): Promise<any[]> {
    try {
      console.log(`📁 Chargement du fichier: ${filePath}`);
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const csvText = await response.text();
      const data = this.parseCSV(csvText);
      console.log(`📊 Fichier parsé: ${data.length} lignes`);
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Parse un CSV simple avec gestion des guillemets
   */
  private parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        data.push(row);
      }
    }

    return data;
  }

  /**
   * Parse une ligne CSV en gérant les guillemets et virgules
   */
  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Charge les données de population depuis les CSV (si disponibles)
   */
  private async loadPopulationData(): Promise<void> {
    if (this.populationData) return;

    this.populationData = new Map();
    
    // Essayer de charger les données de population depuis les CSV de couverture
    try {
      const coverageData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescent-et-adultes-departement.csv');
      
      // Extraire les populations estimées depuis les données de couverture
      // (on peut les calculer approximativement depuis les taux de couverture et les nombres absolus)
      coverageData.forEach(item => {
        const deptCode = item['Département Code'];
        if (deptCode && !this.populationData!.has(deptCode)) {
          // Estimation basique - sera remplacée par de vraies données si disponibles
          this.populationData!.set(deptCode, 200000);
        }
      });
    } catch (error) {
      console.warn('Impossible de charger les données de population:', error);
    }
  }

  /**
   * Obtient la population d'un département (lu depuis les données ou estimation)
   */
  private async getPopulation(departmentCode: string): Promise<number> {
    await this.loadPopulationData();
    return this.populationData?.get(departmentCode) || 200000;
  }

  /**
   * Génère les données départementales pour le dashboard
   */
  async generateDepartmentData(dataType: DataType, year?: number | "all"): Promise<DepartmentData[]> {
    try {
      console.log(`🔄 Chargement des données pour ${dataType}, année: ${year}`);
      
      if (dataType === 'flu-surveillance') {
        console.log(`🦠 Traitement des données de surveillance grippe...`);
        const result = await this.generateFluSurveillanceData(year);
        console.log(`✅ Données grippe chargées: ${result.length} départements`);
        return result;
      } else {
        console.log(`💉 Traitement des données de vaccination...`);
        const result = await this.generateVaccinationData(dataType, year);
        console.log(`✅ Données vaccination chargées: ${result.length} départements`);
        return result;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      throw error;
    }
  }

  /**
   * Génère les données agrégées (moyenne pondérée de toutes les années)
   */
  async generateAggregatedData(dataType: DataType): Promise<DepartmentData[]> {
    if (dataType === 'grippe-vaccination') {
      return this.generateAggregatedVaccinationData();
    } else if (dataType === 'flu-surveillance') {
      // Pour la surveillance grippe, utiliser toutes les années
      return this.generateDepartmentData(dataType, "all");
    } else {
      // Pour les autres types, utiliser l'année la plus récente
      return this.generateDepartmentData(dataType, 2024);
    }
  }

  /**
   * Génère les données agrégées de vaccination grippe (moyenne de toutes les années)
   */
  private async generateAggregatedVaccinationData(): Promise<DepartmentData[]> {
    // Charger les données nationales pour calculer la moyenne
    const nationalData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-france.csv');
    
    // Calculer la moyenne pondérée des dernières années (2020-2024)
    const recentYears = nationalData.filter(item => {
      const year = parseInt(item['Année']);
      return year >= 2020 && year <= 2024;
    });
    
    if (recentYears.length === 0) {
      return this.generateDepartmentData('grippe-vaccination', 2024);
    }
    
    // Calculer les moyennes
    let totalGrippe65 = 0;
    let totalGrippeMoins65 = 0;
    let validYears = 0;
    
    recentYears.forEach(item => {
      const grippe65 = parseFloat(item['Grippe 65 ans et plus']) || 0;
      const grippeMoins65 = parseFloat(item['Grippe moins de 65 ans à risque']) || 0;
      
      if (grippe65 > 0) {
        totalGrippe65 += grippe65;
        totalGrippeMoins65 += grippeMoins65;
        validYears++;
      }
    });
    
    if (validYears === 0) {
      return this.generateDepartmentData('grippe-vaccination', 2024);
    }
    
    const avgGrippe65 = totalGrippe65 / validYears;
    const avgGrippeMoins65 = totalGrippeMoins65 / validYears;
    
    console.log(`📊 Moyenne vaccination grippe (${recentYears.length} années): 65+ = ${avgGrippe65.toFixed(1)}%, <65 = ${avgGrippeMoins65.toFixed(1)}%`);
    
    // Créer une entrée France avec les moyennes
    return [{
      code: 'FR',
      name: 'France (moyenne 2020-2024)',
      population: 68000000,
      vaccinationCoverage: avgGrippe65,
      year: 2024, // Année de référence
      ageGroups: { '65+': avgGrippe65, '<65': avgGrippeMoins65 },
      vaccineTypes: {
        grippe65ansPlus: avgGrippe65,
        grippeMoins65: avgGrippeMoins65,
        hpvFilles: 0,
        hpvGarcons: 0,
        meningocoque: 0,
        covid19: 0
      },
      ranking: 1,
      percentile: 100
    }];
  }

  /**
   * Génère les données de surveillance grippe
   */
  private async generateFluSurveillanceData(year?: number | "all"): Promise<DepartmentData[]> {
    const fluData = await this.loadCSV('/data/grippe-passages-aux-urgences-et-actes-sos-medecins-departement.csv');
    console.log(`📊 Données grippe chargées: ${fluData.length} lignes`);
    
    // Mettre à jour les années disponibles
    this.updateAvailableYears(fluData);
    
    const departmentMap = new Map<string, DepartmentData>();
    const dataCountMap = new Map<string, number>();

    // Utiliser les données de grippe départementale
    let processedCount = 0;
    let filteredCount = 0;
    
    for (const item of fluData) {
      if (!item['Département Code'] || !item['Département']) continue;

      // Filtrer par année si spécifiée
      if (year !== "all" && typeof year === 'number') {
        const itemYear = this.extractYearFromDate(item['1er jour de la semaine']);
        if (itemYear !== year) {
          filteredCount++;
          continue;
        }
      }
      
      processedCount++;

      const key = item['Département Code'];
      if (!departmentMap.has(key)) {
        departmentMap.set(key, {
          code: item['Département Code'],
          name: item['Département'],
          population: await this.getPopulation(item['Département Code']),
          fluActivity: 0,
          year: typeof year === 'number' ? year : this.extractYearFromDate(item['1er jour de la semaine']),
          ageGroups: { '65+': 0, '<65': 0 },
          fluDetails: {
            urgencyVisits: 0,
            hospitalizations: 0,
            sosConsultations: 0,
            weeklyTrend: 'stable' as const,
            seasonalComparison: 0
          }
        });
        dataCountMap.set(key, 0);
      }

      const dept = departmentMap.get(key)!;
      let count = dataCountMap.get(key)!;
      
      // Calculer l'activité grippale en utilisant les noms de colonnes exacts
      const urgencyRateStr = item['Taux de passages aux urgences pour grippe'];
      const hospitalizationRateStr = item['Taux d\'hospitalisations après passages aux urgences pour grippe'];
      const sosRateStr = item['Taux d\'actes médicaux SOS médecins pour grippe'];
      
      const urgencyRate = urgencyRateStr && urgencyRateStr.trim() !== '' ? parseFloat(urgencyRateStr) : 0;
      const hospitalizationRate = hospitalizationRateStr && hospitalizationRateStr.trim() !== '' ? parseFloat(hospitalizationRateStr) : 0;
      const sosRate = sosRateStr && sosRateStr.trim() !== '' ? parseFloat(sosRateStr) : 0;

      // Toujours compter les entrées pour avoir tous les départements, même avec des valeurs 0
      dept.fluDetails!.urgencyVisits += urgencyRate;
      dept.fluDetails!.hospitalizations += hospitalizationRate;
      dept.fluDetails!.sosConsultations += sosRate;
      
      // Calculer l'activité grippale globale (utiliser principalement les urgences)
      dept.fluActivity = (dept.fluActivity || 0) + urgencyRate + (sosRate * 0.1); // Pondérer SOS médecins moins fort
      
      // Séparer par groupe d'âge si disponible
      const ageGroup = item['Classe d\'âge'];
      if (ageGroup === '65 ans ou plus') {
        dept.ageGroups!['65+'] = (dept.ageGroups!['65+'] || 0) + urgencyRate + (sosRate * 0.1);
      } else if (ageGroup && ageGroup !== 'Tous âges' && ageGroup !== '65 ans ou plus') {
        dept.ageGroups!['<65'] = (dept.ageGroups!['<65'] || 0) + urgencyRate + (sosRate * 0.1);
      }
      
      count++;
      dataCountMap.set(key, count);
    }

    // Convertir en array et calculer les moyennes
    const departments = Array.from(departmentMap.values()).map(dept => {
      const count = dataCountMap.get(dept.code) || 1;
      
      // Calculer les moyennes
      dept.fluActivity = (dept.fluActivity || 0) / count;
      dept.fluDetails!.urgencyVisits = dept.fluDetails!.urgencyVisits / count;
      dept.fluDetails!.hospitalizations = dept.fluDetails!.hospitalizations / count;
      dept.fluDetails!.sosConsultations = dept.fluDetails!.sosConsultations / count;
      dept.ageGroups!['65+'] = (dept.ageGroups!['65+'] || 0) / count;
      dept.ageGroups!['<65'] = (dept.ageGroups!['<65'] || 0) / count;
      
      return dept;
    }); // Supprimer le filtre pour garder tous les départements

    console.log(`📊 Lignes traitées: ${processedCount}, filtrées par année: ${filteredCount}`);
    console.log(`📊 Départements uniques trouvés: ${departmentMap.size}`);
    console.log(`📊 Départements avec données de grippe: ${departments.length}`);
    console.log(`📊 Premiers départements:`, departments.slice(0, 5).map(d => ({ code: d.code, name: d.name, activity: d.fluActivity })));
    return this.addRankingAndPercentile(departments, 'fluActivity');
  }

  /**
   * Génère les données de vaccination en combinant tous les fichiers CSV pertinents
   */
  private async generateVaccinationData(dataType: DataType, year?: number | "all"): Promise<DepartmentData[]> {
    const departmentMap = new Map<string, DepartmentData>();
    
    // Déterminer l'année à utiliser
    const targetYear = typeof year === 'number' ? year : 2024;
    
    // Charger les différents fichiers CSV selon le type de données
    if (dataType === 'grippe-vaccination') {
      // D'abord essayer de charger les données de campagne pour l'année spécifique
      const campaignData = await this.loadCampaignData(targetYear);
      if (campaignData) {
        console.log(`📊 Utilisation des données de campagne ${targetYear}:`, campaignData);
        return [{
          code: 'FR',
          name: `France (campagne ${targetYear})`,
          population: 68000000,
          vaccinationCoverage: campaignData.coverage65,
          year: targetYear,
          ageGroups: { '65+': campaignData.coverage65, '<65': campaignData.coverageMoins65 },
          vaccineTypes: {
            grippe65ansPlus: campaignData.coverage65,
            grippeMoins65: campaignData.coverageMoins65,
            hpvFilles: 0,
            hpvGarcons: 0,
            meningocoque: 0,
            covid19: 0
          },
          ranking: 1,
          percentile: 100
        }];
      }
      // 1. Charger les données départementales détaillées
      const departmentalData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescent-et-adultes-departement.csv');
      this.updateAvailableYears(departmentalData);
      
      console.log(`📊 Données départementales chargées: ${departmentalData.length} lignes`);
      
      // Traiter les données départementales
      for (const [index, item] of departmentalData.entries()) {
        if (!item['Département Code'] || !item['Département']) continue;
        
        // Filtrer par année
        if (year !== "all" && parseInt(item['Année']) !== targetYear) continue;
        
        if (index < 5) {
          console.log(`📋 Données départementales ligne ${index}:`, {
            année: item['Année'],
            dept: item['Département'],
            grippe65: item['Grippe 65 ans et plus']
          });
        }
        
        const key = item['Département Code'];
        if (!departmentMap.has(key)) {
          departmentMap.set(key, {
            code: item['Département Code'],
            name: item['Département'],
            population: await this.getPopulation(item['Département Code']),
            vaccinationCoverage: 0,
            year: parseInt(item['Année']) || targetYear,
            ageGroups: { '65+': 0, '<65': 0 },
            vaccineTypes: {
              grippe65ansPlus: 0,
              grippeMoins65: 0,
              hpvFilles: 0,
              hpvGarcons: 0,
              meningocoque: 0,
              covid19: 0
            }
          });
        }
        
        const dept = departmentMap.get(key)!;
        const grippe65Plus = parseFloat(item['Grippe 65 ans et plus']) || 0;
        const grippeMoins65 = parseFloat(item['Grippe moins de 65 ans à risque']) || 0;
        
        // Valider que les pourcentages sont réalistes (entre 0 et 100)
        if (grippe65Plus > 0 && grippe65Plus <= 100) {
          dept.vaccinationCoverage = Math.max(dept.vaccinationCoverage || 0, grippe65Plus);
          dept.ageGroups!['65+'] = grippe65Plus;
          dept.vaccineTypes!.grippe65ansPlus = grippe65Plus;
        }
        if (grippeMoins65 > 0 && grippeMoins65 <= 100) {
          dept.ageGroups!['<65'] = grippeMoins65;
          dept.vaccineTypes!.grippeMoins65 = grippeMoins65;
        }
      }
      
      // Si pas assez de données départementales, utiliser les données nationales comme référence
      if (departmentMap.size < 10) {
        console.log(`⚠️ Peu de données départementales (${departmentMap.size}), ajout de données nationales`);
        
        // Charger les données nationales pour avoir une référence
        const nationalData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-france.csv');
        
        // Trouver les données pour l'année cible
        const yearData = nationalData.find(item => parseInt(item['Année']) === targetYear);
        
        if (yearData) {
          const nationalGrippe65 = parseFloat(yearData['Grippe 65 ans et plus']) || 0;
          const nationalGrippeMoins65 = parseFloat(yearData['Grippe moins de 65 ans à risque']) || 0;
          
          console.log(`📊 Données nationales ${targetYear}: Grippe 65+ = ${nationalGrippe65}%, Grippe <65 = ${nationalGrippeMoins65}%`);
          
          // Ajouter une entrée "France" si pas de données départementales suffisantes
          if (nationalGrippe65 > 0) {
            departmentMap.set('FR', {
              code: 'FR',
              name: 'France (données nationales)',
              population: 68000000, // Population française approximative
              vaccinationCoverage: nationalGrippe65,
              year: targetYear,
              ageGroups: { '65+': nationalGrippe65, '<65': nationalGrippeMoins65 },
              vaccineTypes: {
                grippe65ansPlus: nationalGrippe65,
                grippeMoins65: nationalGrippeMoins65,
                hpvFilles: 0,
                hpvGarcons: 0,
                meningocoque: 0,
                covid19: 0
              }
            });
          }
        }
      }
    } else {
      // Pour les autres types de vaccination, utiliser uniquement les données départementales
      const departmentalData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescent-et-adultes-departement.csv');
      this.updateAvailableYears(departmentalData);
      
      for (const item of departmentalData) {
        if (!item['Département Code'] || !item['Département']) continue;
        if (year !== "all" && parseInt(item['Année']) !== targetYear) continue;
        
        const key = item['Département Code'];
        if (!departmentMap.has(key)) {
          departmentMap.set(key, {
            code: item['Département Code'],
            name: item['Département'],
            population: await this.getPopulation(item['Département Code']),
            vaccinationCoverage: 0,
            year: parseInt(item['Année']) || targetYear,
            ageGroups: { '65+': 0, '<65': 0 },
            vaccineTypes: {
              grippe65ansPlus: 0,
              grippeMoins65: 0,
              hpvFilles: 0,
              hpvGarcons: 0,
              meningocoque: 0,
              covid19: 0
            }
          });
        }
        
        const dept = departmentMap.get(key)!;
        
        switch (dataType) {
          case 'hpv-vaccination':
            const hpvFilles = parseFloat(item['HPV filles 2 doses à 16 ans']) || 0;
            const hpvGarcons = parseFloat(item['HPV garçons 2 doses à 16 ans']) || 0;
            
            if (hpvFilles > 0) {
              dept.vaccinationCoverage = Math.max(dept.vaccinationCoverage || 0, hpvFilles);
              dept.vaccineTypes!.hpvFilles = hpvFilles;
            }
            if (hpvGarcons > 0) {
              dept.vaccineTypes!.hpvGarcons = hpvGarcons;
            }
            break;

          case 'covid-vaccination':
            const covid19 = parseFloat(item['Covid-19 65 ans et plus']) || 0;
            if (covid19 > 0) {
              dept.vaccinationCoverage = Math.max(dept.vaccinationCoverage || 0, covid19);
              dept.vaccineTypes!.covid19 = covid19;
            }
            break;

          case 'meningocoque-vaccination':
            const meningocoque = parseFloat(item['Méningocoque C 15-19 ans']) || 0;
            if (meningocoque > 0) {
              dept.vaccinationCoverage = Math.max(dept.vaccinationCoverage || 0, meningocoque);
              dept.vaccineTypes!.meningocoque = meningocoque;
            }
            break;
        }
      }
    }

    // Convertir en array
    const departments = Array.from(departmentMap.values()).filter(dept => 
      dept.vaccinationCoverage && dept.vaccinationCoverage > 0
    );

    console.log(`📊 Total départements/régions avec données de vaccination: ${departments.length}`);
    return this.addRankingAndPercentile(departments, 'vaccinationCoverage');
  }

  /**
   * Ajoute le classement et percentile aux départements
   */
  private addRankingAndPercentile(departments: DepartmentData[], sortField: keyof DepartmentData): DepartmentData[] {
    // Trier par le champ spécifié (décroissant)
    const sorted = departments.sort((a, b) => {
      const aVal = (a[sortField] as number) || 0;
      const bVal = (b[sortField] as number) || 0;
      return bVal - aVal;
    });

    // Ajouter le ranking et percentile
    sorted.forEach((dept, index) => {
      dept.ranking = index + 1;
      dept.percentile = Math.round(((sorted.length - index) / sorted.length) * 100);
    });

    return sorted;
  }

  /**
   * Charge les données de campagne pour une année donnée
   */
  private async loadCampaignData(year: number): Promise<{ coverage65: number, coverageMoins65: number } | null> {
    try {
      // Essayer de charger les données de campagne
      const campaignData = await this.loadCSV(`/data/campagne-${year}.csv`);
      
      if (campaignData.length > 0) {
        // Chercher les données de pourcentage
        const percentageData = campaignData.find(item => item['variable'] === 'POURCENTAGE');
        if (percentageData) {
          const coverage = parseFloat(percentageData['valeur']) || 0;
          // Pour l'instant, utiliser le même pourcentage pour les deux groupes
          // TODO: Affiner avec les données spécifiques par groupe d'âge
          return {
            coverage65: coverage,
            coverageMoins65: coverage * 0.3 // Estimation basée sur les données historiques
          };
        }
      }
      
      // Si pas de données de campagne, essayer les données nationales
      const nationalData = await this.loadCSV('/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-france.csv');
      const yearData = nationalData.find(item => parseInt(item['Année']) === year);
      
      if (yearData) {
        const grippe65 = parseFloat(yearData['Grippe 65 ans et plus']) || 0;
        const grippeMoins65 = parseFloat(yearData['Grippe moins de 65 ans à risque']) || 0;
        
        if (grippe65 > 0) {
          return {
            coverage65: grippe65,
            coverageMoins65: grippeMoins65
          };
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`Impossible de charger les données de campagne pour ${year}:`, error);
      return null;
    }
  }

  /**
   * Extrait l'année d'une date
   */
  private extractYearFromDate(dateStr: string): number {
    if (!dateStr) return 2024;
    
    // Essayer différents formats de date
    const year = parseInt(dateStr.split('-')[0]) || 
                 parseInt(dateStr.split('/')[2]) || 
                 2024;
    
    return year;
  }
}

// Instance singleton exportée
export const dashboardDataService = DashboardDataService.getInstance();