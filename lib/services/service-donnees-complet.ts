import { ParseurVaccination } from './parseur-vaccination';
import { ParseurGrippe } from './parseur-grippe';
import { ParseurVaccinationEtendu, CouvertureVaccinaleDetailleeData, CouvertureVaccinaleNationaleData } from './parseur-vaccination-etendu';
import { 
  VaccinationCampaignData, 
  VaccinationCoverageData, 
  VaccinationDosesActesData,
  FluSurveillanceNationalData,
  FluSurveillanceDepartmentalData,
  ResultatValidation,
  IndicateurQualiteDonnees
} from '../types';

export interface DonneesCompletes {
  // Données de vaccination de base (grippe)
  vaccinationCampagnes: VaccinationCampaignData[];
  vaccinationCouverture: VaccinationCoverageData[];
  vaccinationDosesActes: VaccinationDosesActesData[];
  
  // Données de couverture vaccinale étendue
  couvertureDetailleeParDepartement: CouvertureVaccinaleDetailleeData[];
  couvertureNationale: CouvertureVaccinaleNationaleData[];
  couvertureRegionale: CouvertureVaccinaleNationaleData[];
  
  // Données de surveillance grippe
  grippeNationale: FluSurveillanceNationalData[];
  grippeDepartementale: FluSurveillanceDepartmentalData[];
  grippeRegionale: FluSurveillanceDepartmentalData[];
  
  // Métadonnées
  validation: ResultatValidation;
  indicateursQualite: IndicateurQualiteDonnees[];
  anneesDisponibles: number[];
  regionsDisponibles: { code: string; nom: string }[];
  departementsDisponibles: { code: string; nom: string; region: string }[];
}

export class ServiceDonneesComplet {
  private static instance: ServiceDonneesComplet;
  private donneesCache: DonneesCompletes | null = null;
  private dernierChargement: Date | null = null;

  private constructor() {}

  static getInstance(): ServiceDonneesComplet {
    if (!ServiceDonneesComplet.instance) {
      ServiceDonneesComplet.instance = new ServiceDonneesComplet();
    }
    return ServiceDonneesComplet.instance;
  }

  /**
   * Charge toutes les données disponibles
   */
  async chargerToutesDonnees(): Promise<DonneesCompletes> {
    try {
      console.log('🔄 Chargement complet des données...');
      
      // Définir tous les fichiers à charger
      const fichiersACharger = [
        // Vaccination grippe par année
        { chemin: '/data/campagne-2021.csv', type: 'campagne', annee: 2021 },
        { chemin: '/data/campagne-2022.csv', type: 'campagne', annee: 2022 },
        { chemin: '/data/campagne-2023.csv', type: 'campagne', annee: 2023 },
        { chemin: '/data/campagne-2024.csv', type: 'campagne', annee: 2024 },
        
        { chemin: '/data/couverture-2021.csv', type: 'couverture', annee: 2021 },
        { chemin: '/data/couverture-2022.csv', type: 'couverture', annee: 2022 },
        { chemin: '/data/couverture-2023.csv', type: 'couverture', annee: 2023 },
        { chemin: '/data/couverture-2024.csv', type: 'couverture', annee: 2024 },
        
        { chemin: '/data/doses-actes-2021.csv', type: 'doses-actes', annee: 2021 },
        { chemin: '/data/doses-actes-2022.csv', type: 'doses-actes', annee: 2022 },
        { chemin: '/data/doses-actes-2023.csv', type: 'doses-actes', annee: 2023 },
        { chemin: '/data/doses-actes-2024.csv', type: 'doses-actes', annee: 2024 },
        
        // Couvertures vaccinales étendues
        { chemin: '/data/couvertures-vaccinales-des-adolescent-et-adultes-departement.csv', type: 'couverture-detaillee' },
        { chemin: '/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-france.csv', type: 'couverture-nationale' },
        { chemin: '/data/couvertures-vaccinales-des-adolescents-et-adultes-depuis-2011-region.csv', type: 'couverture-regionale' },
        
        // Surveillance grippe
        { chemin: '/data/grippe-passages-aux-urgences-et-actes-sos-medecins-france.csv', type: 'grippe-nationale' },
        { chemin: '/data/grippe-passages-aux-urgences-et-actes-sos-medecins-departement.csv', type: 'grippe-departementale' },
        { chemin: '/data/grippe-passages-urgences-et-actes-sos-medecin_reg.csv', type: 'grippe-regionale' }
      ];

      // Charger tous les fichiers en parallèle
      const resultatsChargement = await Promise.allSettled(
        fichiersACharger.map(async (fichier) => {
          try {
            const contenu = await this.chargerFichierCSV(fichier.chemin);
            return { ...fichier, contenu, succes: true };
          } catch (erreur) {
            console.warn(`⚠️ Impossible de charger ${fichier.chemin}:`, erreur);
            return { ...fichier, contenu: '', succes: false, erreur };
          }
        })
      );

      // Séparer les fichiers chargés avec succès
      const fichiersCharges = resultatsChargement
        .filter((resultat): resultat is PromiseFulfilledResult<any> => 
          resultat.status === 'fulfilled' && resultat.value.succes
        )
        .map(resultat => resultat.value);

      // Parser les données par type
      const donneesCompletes = await this.parserTousLesFichiers(fichiersCharges);

      // Générer les métadonnées
      const metadonnees = this.genererMetadonnees(donneesCompletes);

      const resultatFinal: DonneesCompletes = {
        vaccinationCampagnes: donneesCompletes.vaccinationCampagnes || [],
        vaccinationCouverture: donneesCompletes.vaccinationCouverture || [],
        vaccinationDosesActes: donneesCompletes.vaccinationDosesActes || [],
        couvertureDetailleeParDepartement: donneesCompletes.couvertureDetailleeParDepartement || [],
        couvertureNationale: donneesCompletes.couvertureNationale || [],
        couvertureRegionale: donneesCompletes.couvertureRegionale || [],
        grippeNationale: donneesCompletes.grippeNationale || [],
        grippeDepartementale: donneesCompletes.grippeDepartementale || [],
        grippeRegionale: donneesCompletes.grippeRegionale || [],
        validation: donneesCompletes.validation || { estValide: false, erreurs: [], avertissements: [], statutFichiers: {} },
        indicateursQualite: donneesCompletes.indicateursQualite || [],
        ...metadonnees
      };

      // Mettre en cache
      this.donneesCache = resultatFinal;
      this.dernierChargement = new Date();

      console.log('✅ Chargement complet terminé');
      this.afficherStatistiques(resultatFinal);

      return resultatFinal;

    } catch (erreur) {
      console.error('❌ Erreur lors du chargement complet:', erreur);
      throw erreur;
    }
  }

  /**
   * Parse tous les fichiers selon leur type
   */
  private async parserTousLesFichiers(fichiersCharges: any[]): Promise<Partial<DonneesCompletes>> {
    const donnees: Partial<DonneesCompletes> = {
      vaccinationCampagnes: [],
      vaccinationCouverture: [],
      vaccinationDosesActes: [],
      couvertureDetailleeParDepartement: [],
      couvertureNationale: [],
      couvertureRegionale: [],
      grippeNationale: [],
      grippeDepartementale: [],
      grippeRegionale: []
    };

    const erreurs: string[] = [];
    const avertissements: string[] = [];
    const indicateursQualite: IndicateurQualiteDonnees[] = [];

    for (const fichier of fichiersCharges) {
      try {
        let donneesParses: any[] = [];
        let validation: ResultatValidation;

        switch (fichier.type) {
          case 'campagne':
            donneesParses = await ParseurVaccination.parserCampagne(fichier.contenu);
            validation = ParseurVaccination.validerDonnees(donneesParses, fichier.chemin);
            donnees.vaccinationCampagnes!.push(...donneesParses);
            break;

          case 'couverture':
            donneesParses = await ParseurVaccination.parserCouverture(fichier.contenu);
            validation = ParseurVaccination.validerDonnees(donneesParses, fichier.chemin);
            donnees.vaccinationCouverture!.push(...donneesParses);
            break;

          case 'doses-actes':
            donneesParses = await ParseurVaccination.parserDosesActes(fichier.contenu);
            validation = ParseurVaccination.validerDonnees(donneesParses, fichier.chemin);
            donnees.vaccinationDosesActes!.push(...donneesParses);
            break;

          case 'couverture-detaillee':
            donneesParses = await ParseurVaccinationEtendu.parserCouvertureDetailleeParDepartement(fichier.contenu);
            validation = ParseurVaccinationEtendu.validerDonneesEtendues(donneesParses, fichier.chemin);
            donnees.couvertureDetailleeParDepartement!.push(...donneesParses);
            break;

          case 'couverture-nationale':
            donneesParses = await ParseurVaccinationEtendu.parserCouvertureNationale(fichier.contenu);
            validation = ParseurVaccinationEtendu.validerDonneesEtendues(donneesParses, fichier.chemin);
            donnees.couvertureNationale!.push(...donneesParses);
            break;

          case 'couverture-regionale':
            donneesParses = await ParseurVaccinationEtendu.parserCouvertureRegionale(fichier.contenu);
            validation = ParseurVaccinationEtendu.validerDonneesEtendues(donneesParses, fichier.chemin);
            donnees.couvertureRegionale!.push(...donneesParses);
            break;

          case 'grippe-nationale':
            donneesParses = await ParseurGrippe.parserDonneesNationales(fichier.contenu);
            validation = ParseurGrippe.validerDonnees(donneesParses, fichier.chemin);
            donnees.grippeNationale!.push(...donneesParses);
            break;

          case 'grippe-departementale':
            donneesParses = await ParseurGrippe.parserDonneesDepartementales(fichier.contenu);
            validation = ParseurGrippe.validerDonnees(donneesParses, fichier.chemin);
            donnees.grippeDepartementale!.push(...donneesParses);
            break;

          case 'grippe-regionale':
            donneesParses = await ParseurGrippe.parserDonneesRegionales(fichier.contenu);
            validation = ParseurGrippe.validerDonnees(donneesParses, fichier.chemin);
            donnees.grippeRegionale!.push(...donneesParses);
            break;

          default:
            console.warn(`Type de fichier non reconnu: ${fichier.type}`);
            continue;
        }

        // Ajouter les erreurs et avertissements
        erreurs.push(...validation.erreurs);
        avertissements.push(...validation.avertissements);

        // Créer l'indicateur de qualité
        const statut = Object.values(validation.statutFichiers)[0] || 'succes';
        indicateursQualite.push({
          nomFichier: fichier.chemin.split('/').pop() || '',
          statut: statut as any,
          message: `${donneesParses.length} enregistrements chargés`,
          nombreEnregistrements: donneesParses.length,
          derniereMiseAJour: new Date().toISOString()
        });

      } catch (erreur) {
        console.error(`Erreur lors du parsing de ${fichier.chemin}:`, erreur);
        erreurs.push(`Erreur lors du parsing de ${fichier.chemin}: ${erreur}`);
      }
    }

    // Créer la validation globale
    donnees.validation = {
      estValide: erreurs.length === 0,
      erreurs,
      avertissements,
      statutFichiers: {}
    };

    donnees.indicateursQualite = indicateursQualite;

    return donnees;
  }

  /**
   * Génère les métadonnées (années, régions, départements disponibles)
   */
  private genererMetadonnees(donnees: Partial<DonneesCompletes>) {
    const anneesSet = new Set<number>();
    const regionsMap = new Map<string, string>();
    const departementsMap = new Map<string, { nom: string; region: string }>();

    // Extraire les années des différentes sources
    donnees.couvertureDetailleeParDepartement?.forEach(item => {
      if (item.annee) anneesSet.add(item.annee);
    });

    donnees.couvertureNationale?.forEach(item => {
      if (item.annee) anneesSet.add(item.annee);
    });

    // Extraire les régions et départements
    donnees.couvertureDetailleeParDepartement?.forEach(item => {
      if (item.regionCode && item.region) {
        regionsMap.set(item.regionCode, item.region);
      }
      if (item.departementCode && item.departement && item.region) {
        departementsMap.set(item.departementCode, {
          nom: item.departement,
          region: item.region
        });
      }
    });

    donnees.vaccinationCouverture?.forEach(item => {
      if (item.code && item.region) {
        regionsMap.set(item.code, item.region);
      }
    });

    return {
      anneesDisponibles: Array.from(anneesSet).sort(),
      regionsDisponibles: Array.from(regionsMap.entries()).map(([code, nom]) => ({ code, nom })),
      departementsDisponibles: Array.from(departementsMap.entries()).map(([code, info]) => ({
        code,
        nom: info.nom,
        region: info.region
      }))
    };
  }

  /**
   * Affiche les statistiques de chargement
   */
  private afficherStatistiques(donnees: DonneesCompletes) {
    console.log('📊 Statistiques des données chargées:');
    console.log(`   Campagnes vaccination: ${donnees.vaccinationCampagnes.length}`);
    console.log(`   Couverture vaccination: ${donnees.vaccinationCouverture.length}`);
    console.log(`   Doses/Actes: ${donnees.vaccinationDosesActes.length}`);
    console.log(`   Couverture détaillée: ${donnees.couvertureDetailleeParDepartement.length}`);
    console.log(`   Grippe nationale: ${donnees.grippeNationale.length}`);
    console.log(`   Grippe départementale: ${donnees.grippeDepartementale.length}`);
    console.log(`   Années disponibles: ${donnees.anneesDisponibles.join(', ')}`);
    console.log(`   Régions: ${donnees.regionsDisponibles.length}`);
    console.log(`   Départements: ${donnees.departementsDisponibles.length}`);
  }

  /**
   * Obtient les données depuis le cache ou les recharge
   */
  async obtenirDonnees(forceReload = false): Promise<DonneesCompletes> {
    if (!this.donneesCache || forceReload) {
      return await this.chargerToutesDonnees();
    }
    return this.donneesCache;
  }

  /**
   * Filtre les données selon les critères spécifiés
   */
  async filtrerDonnees(filtres: {
    annees?: number[];
    regions?: string[];
    departements?: string[];
    typeVaccin?: string[];
  }): Promise<DonneesCompletes> {
    const donnees = await this.obtenirDonnees();
    
    // Créer une copie filtrée
    const donneesFiltrées: DonneesCompletes = { ...donnees };

    // Filtrer par années
    if (filtres.annees && filtres.annees.length > 0) {
      donneesFiltrées.couvertureDetailleeParDepartement = donnees.couvertureDetailleeParDepartement
        .filter(item => filtres.annees!.includes(item.annee));
      
      donneesFiltrées.couvertureNationale = donnees.couvertureNationale
        .filter(item => filtres.annees!.includes(item.annee));
    }

    // Filtrer par régions
    if (filtres.regions && filtres.regions.length > 0) {
      donneesFiltrées.vaccinationCouverture = donnees.vaccinationCouverture
        .filter(item => filtres.regions!.includes(item.code));
      
      donneesFiltrées.couvertureDetailleeParDepartement = donneesFiltrées.couvertureDetailleeParDepartement
        .filter(item => filtres.regions!.includes(item.regionCode));
    }

    // Filtrer par départements
    if (filtres.departements && filtres.departements.length > 0) {
      donneesFiltrées.couvertureDetailleeParDepartement = donneesFiltrées.couvertureDetailleeParDepartement
        .filter(item => filtres.departements!.includes(item.departementCode));
      
      donneesFiltrées.grippeDepartementale = donnees.grippeDepartementale
        .filter(item => filtres.departements!.includes(item.departementCode));
    }

    return donneesFiltrées;
  }

  /**
   * Charge un fichier CSV
   */
  private async chargerFichierCSV(cheminFichier: string): Promise<string> {
    try {
      const response = await fetch(cheminFichier);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (erreur: any) {
      throw new Error(`Erreur lors du chargement de ${cheminFichier}: ${erreur.message}`);
    }
  }

  /**
   * Obtient les données agrégées par département pour le dashboard
   */
  async getDepartmentalData(dataType: 'vaccination' | 'flu'): Promise<any[]> {
    const donnees = await this.obtenirDonnees();
    
    if (dataType === 'vaccination') {
      return this.aggregateVaccinationByDepartment(donnees);
    } else {
      return this.aggregateFluByDepartment(donnees);
    }
  }

  /**
   * Agrège les données de vaccination par département
   */
  private aggregateVaccinationByDepartment(donnees: DonneesCompletes): any[] {
    const departmentMap = new Map();

    // Utiliser les données de couverture détaillée par département
    donnees.couvertureDetailleeParDepartement.forEach(item => {
      if (!item.departementCode || !item.departement) return;

      const key = item.departementCode;
      if (!departmentMap.has(key)) {
        departmentMap.set(key, {
          code: item.departementCode,
          name: item.departement,
          population: 100000 + Math.random() * 500000, // Population simulée
          vaccinationCoverage: 0,
          ageGroups: { '65+': 0, '<65': 0 },
          dataCount: 0
        });
      }

      const dept = departmentMap.get(key);
      
      // Utiliser les données de grippe 65+ comme proxy pour la couverture vaccinale
      if (item.grippe65ansPlus && item.annee >= 2020) {
        dept.vaccinationCoverage = Math.max(dept.vaccinationCoverage, item.grippe65ansPlus);
        dept.ageGroups['65+'] = item.grippe65ansPlus;
      }

      // Utiliser les données de grippe <65 ans
      if (item.grippeMoins65ansRisque && item.annee >= 2020) {
        dept.ageGroups['<65'] = item.grippeMoins65ansRisque;
      }

      dept.dataCount++;
    });

    // Convertir en array et ajouter le ranking
    const departments = Array.from(departmentMap.values())
      .filter(dept => dept.vaccinationCoverage > 0)
      .sort((a, b) => b.vaccinationCoverage - a.vaccinationCoverage);

    // Ajouter le ranking et percentile
    departments.forEach((dept, index) => {
      dept.ranking = index + 1;
      dept.percentile = Math.round(((departments.length - index) / departments.length) * 100);
    });

    return departments;
  }

  /**
   * Agrège les données de grippe par département
   */
  private aggregateFluByDepartment(donnees: DonneesCompletes): any[] {
    const departmentMap = new Map();

    // Utiliser les données de grippe départementale
    donnees.grippeDepartementale.forEach(item => {
      if (!item.departementCode || !item.departement) return;

      const key = item.departementCode;
      if (!departmentMap.has(key)) {
        departmentMap.set(key, {
          code: item.departementCode,
          name: item.departement,
          population: 100000 + Math.random() * 500000, // Population simulée
          fluActivity: 0,
          ageGroups: { '65+': 0, '<65': 0 },
          dataCount: 0,
          totalUrgences: 0,
          totalSOS: 0
        });
      }

      const dept = departmentMap.get(key);
      
      // Calculer l'activité grippale moyenne
      if (item.tauxPassagesUrgences) {
        dept.totalUrgences += item.tauxPassagesUrgences;
      }
      if (item.tauxActesSOS) {
        dept.totalSOS += item.tauxActesSOS;
      }
      
      dept.dataCount++;
    });

    // Calculer les moyennes et convertir en array
    const departments = Array.from(departmentMap.values())
      .map(dept => {
        if (dept.dataCount > 0) {
          dept.fluActivity = (dept.totalUrgences + dept.totalSOS) / dept.dataCount;
        }
        return dept;
      })
      .filter(dept => dept.fluActivity > 0)
      .sort((a, b) => b.fluActivity - a.fluActivity);

    // Ajouter le ranking et percentile
    departments.forEach((dept, index) => {
      dept.ranking = index + 1;
      dept.percentile = Math.round(((departments.length - index) / departments.length) * 100);
    });

    return departments;
  }

  /**
   * Vide le cache
   */
  viderCache(): void {
    this.donneesCache = null;
    this.dernierChargement = null;
  }
}

// Instance singleton exportée
export const serviceDonneesComplet = ServiceDonneesComplet.getInstance();