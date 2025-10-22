import { ParseurVaccination } from './parseur-vaccination';
import { 
  VaccinationCampaignData, 
  VaccinationCoverageData, 
  VaccinationDosesActesData,
  ResultatValidation,
  IndicateurQualiteDonnees,
  Region
} from '../types';

export interface DonneesVaccinationCompletes {
  campagnes: VaccinationCampaignData[];
  couverture: VaccinationCoverageData[];
  dosesActes: VaccinationDosesActesData[];
  validation: ResultatValidation;
  indicateursQualite: IndicateurQualiteDonnees[];
}

export class ServiceDonneesVaccination {
  private static instance: ServiceDonneesVaccination;
  private donneesCache: DonneesVaccinationCompletes | null = null;
  private dernierChargement: Date | null = null;

  private constructor() {}

  static getInstance(): ServiceDonneesVaccination {
    if (!ServiceDonneesVaccination.instance) {
      ServiceDonneesVaccination.instance = new ServiceDonneesVaccination();
    }
    return ServiceDonneesVaccination.instance;
  }

  /**
   * Charge toutes les données de vaccination
   */
  async chargerToutesDonnees(): Promise<DonneesVaccinationCompletes> {
    try {
      console.log('🔄 Chargement des données de vaccination...');
      
      // Charger les fichiers CSV
      const [contenuCampagne, contenuCouverture, contenuDosesActes] = await Promise.all([
        ParseurVaccination.chargerFichierCSV('/data/campagne-2024.csv'),
        ParseurVaccination.chargerFichierCSV('/data/couverture-2024.csv'),
        ParseurVaccination.chargerFichierCSV('/data/doses-actes-2024.csv')
      ]);

      // Parser les données
      const [campagnes, couverture, dosesActes] = await Promise.all([
        ParseurVaccination.parserCampagne(contenuCampagne),
        ParseurVaccination.parserCouverture(contenuCouverture),
        ParseurVaccination.parserDosesActes(contenuDosesActes)
      ]);

      // Valider les données
      const validationCampagne = ParseurVaccination.validerDonnees(campagnes, 'campagne-2024.csv');
      const validationCouverture = ParseurVaccination.validerDonnees(couverture, 'couverture-2024.csv');
      const validationDosesActes = ParseurVaccination.validerDonnees(dosesActes, 'doses-actes-2024.csv');

      // Combiner les résultats de validation
      const validation: ResultatValidation = {
        estValide: validationCampagne.estValide && validationCouverture.estValide && validationDosesActes.estValide,
        erreurs: [
          ...validationCampagne.erreurs,
          ...validationCouverture.erreurs,
          ...validationDosesActes.erreurs
        ],
        avertissements: [
          ...validationCampagne.avertissements,
          ...validationCouverture.avertissements,
          ...validationDosesActes.avertissements
        ],
        statutFichiers: {
          ...validationCampagne.statutFichiers,
          ...validationCouverture.statutFichiers,
          ...validationDosesActes.statutFichiers
        }
      };

      // Créer les indicateurs de qualité
      const indicateursQualite: IndicateurQualiteDonnees[] = [
        {
          nomFichier: 'campagne-2024.csv',
          statut: validation.statutFichiers['campagne-2024.csv'],
          message: this.obtenirMessageStatut(validation.statutFichiers['campagne-2024.csv'], campagnes.length),
          nombreEnregistrements: campagnes.length,
          derniereMiseAJour: new Date().toISOString()
        },
        {
          nomFichier: 'couverture-2024.csv',
          statut: validation.statutFichiers['couverture-2024.csv'],
          message: this.obtenirMessageStatut(validation.statutFichiers['couverture-2024.csv'], couverture.length),
          nombreEnregistrements: couverture.length,
          derniereMiseAJour: new Date().toISOString()
        },
        {
          nomFichier: 'doses-actes-2024.csv',
          statut: validation.statutFichiers['doses-actes-2024.csv'],
          message: this.obtenirMessageStatut(validation.statutFichiers['doses-actes-2024.csv'], dosesActes.length),
          nombreEnregistrements: dosesActes.length,
          derniereMiseAJour: new Date().toISOString()
        }
      ];

      const donneesCompletes: DonneesVaccinationCompletes = {
        campagnes,
        couverture,
        dosesActes,
        validation,
        indicateursQualite
      };

      // Mettre en cache
      this.donneesCache = donneesCompletes;
      this.dernierChargement = new Date();

      console.log('✅ Données de vaccination chargées avec succès');
      console.log(`📊 Campagnes: ${campagnes.length} enregistrements`);
      console.log(`📊 Couverture: ${couverture.length} enregistrements`);
      console.log(`📊 Doses/Actes: ${dosesActes.length} enregistrements`);

      return donneesCompletes;

    } catch (erreur) {
      console.error('❌ Erreur lors du chargement des données de vaccination:', erreur);
      throw erreur;
    }
  }

  /**
   * Obtient les données depuis le cache ou les recharge si nécessaire
   */
  async obtenirDonnees(forceReload = false): Promise<DonneesVaccinationCompletes> {
    if (!this.donneesCache || forceReload) {
      return await this.chargerToutesDonnees();
    }
    return this.donneesCache;
  }

  /**
   * Obtient la liste des régions disponibles
   */
  async obtenirRegionsDisponibles(): Promise<Region[]> {
    const donnees = await this.obtenirDonnees();
    const regionsUniques = new Map<string, Region>();

    donnees.couverture.forEach(item => {
      if (!regionsUniques.has(item.code)) {
        regionsUniques.set(item.code, {
          code: item.code,
          name: item.region
        });
      }
    });

    return Array.from(regionsUniques.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtient la liste des années disponibles
   */
  async obtenirAnneesDisponibles(): Promise<string[]> {
    const donnees = await this.obtenirDonnees();
    const annees = new Set<string>();

    // Extraire les années des campagnes
    donnees.campagnes.forEach(item => {
      const annee = item.campagne.split('-')[0];
      if (annee) annees.add(annee);
    });

    // Extraire les années des doses/actes
    donnees.dosesActes.forEach(item => {
      const annee = item.campagne.split('-')[0];
      if (annee) annees.add(annee);
    });

    return Array.from(annees).sort();
  }

  /**
   * Filtre les données selon les critères spécifiés
   */
  async filtrerDonnees(filtres: {
    annees?: string[];
    regions?: string[];
    groupesAge?: string[];
  }): Promise<DonneesVaccinationCompletes> {
    const donnees = await this.obtenirDonnees();

    let couvertureFiltree = donnees.couverture;
    let dosesActesFiltrees = donnees.dosesActes;
    let campagnesFiltrees = donnees.campagnes;

    // Filtrer par régions
    if (filtres.regions && filtres.regions.length > 0) {
      couvertureFiltree = couvertureFiltree.filter(item => 
        filtres.regions!.includes(item.code)
      );
    }

    // Filtrer par groupes d'âge
    if (filtres.groupesAge && filtres.groupesAge.length > 0) {
      couvertureFiltree = couvertureFiltree.filter(item => 
        filtres.groupesAge!.includes(item.groupe)
      );
      dosesActesFiltrees = dosesActesFiltrees.filter(item => 
        filtres.groupesAge!.includes(item.groupe)
      );
    }

    // Filtrer par années
    if (filtres.annees && filtres.annees.length > 0) {
      campagnesFiltrees = campagnesFiltrees.filter(item => {
        const annee = item.campagne.split('-')[0];
        return filtres.annees!.includes(annee);
      });
      dosesActesFiltrees = dosesActesFiltrees.filter(item => {
        const annee = item.campagne.split('-')[0];
        return filtres.annees!.includes(annee);
      });
    }

    return {
      ...donnees,
      campagnes: campagnesFiltrees,
      couverture: couvertureFiltree,
      dosesActes: dosesActesFiltrees
    };
  }

  private obtenirMessageStatut(statut: string, nombreEnregistrements: number): string {
    switch (statut) {
      case 'succes':
        return `${nombreEnregistrements} enregistrements chargés avec succès`;
      case 'avertissement':
        return `${nombreEnregistrements} enregistrements chargés avec des avertissements`;
      case 'erreur':
        return 'Erreur lors du chargement des données';
      default:
        return 'Statut inconnu';
    }
  }

  /**
   * Vide le cache des données
   */
  viderCache(): void {
    this.donneesCache = null;
    this.dernierChargement = null;
  }
}