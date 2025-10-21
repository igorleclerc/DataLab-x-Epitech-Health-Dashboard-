import Papa from 'papaparse';
import { ResultatValidation } from '../types';

// Nouvelles interfaces pour les données étendues
export interface CouvertureVaccinaleDetailleeData {
  annee: number;
  departementCode: string;
  departement: string;
  hpvFilles1Dose15ans?: number;
  hpvFilles2Doses16ans?: number;
  hpvGarcons1Dose15ans?: number;
  hpvGarcons2Doses16ans?: number;
  meningocoque10_14ans?: number;
  meningocoque15_19ans?: number;
  meningocoque20_24ans?: number;
  grippeMoins65ansRisque?: number;
  grippe65ansPlus?: number;
  grippe65_74ans?: number;
  grippe75ansPlus?: number;
  covid19_65ansPlus?: number;
  region: string;
  regionCode: string;
}

export interface CouvertureVaccinaleNationaleData {
  annee: number;
  typeVaccin: string;
  classeAge: string;
  tauxCouverture: number;
  region?: string;
}

export class ParseurVaccinationEtendu {
  /**
   * Parse les données détaillées de couverture vaccinale par département
   */
  static async parserCouvertureDetailleeParDepartement(contenuCSV: string): Promise<CouvertureVaccinaleDetailleeData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(contenuCSV, {
        header: true,
        skipEmptyLines: true,
        transform: (valeur: string, champ: string) => {
          valeur = valeur.trim();
          
          // Convertir les années et codes
          if (champ === 'Année' || champ.includes('Code')) {
            const nombre = parseInt(valeur, 10);
            return isNaN(nombre) ? (champ === 'Année' ? 0 : valeur) : nombre;
          }
          
          // Convertir les pourcentages et taux
          if (champ.includes('HPV') || champ.includes('Méningocoque') || 
              champ.includes('Grippe') || champ.includes('Covid')) {
            const nombre = parseFloat(valeur);
            return isNaN(nombre) ? undefined : nombre;
          }
          
          return valeur;
        },
        complete: (resultats) => {
          try {
            const donneesValidees = resultats.data
              .filter((ligne: any) => ligne['Année'] && ligne['Département'])
              .map((ligne: any) => ({
                annee: ligne['Année'],
                departementCode: ligne['Département Code']?.toString() || '',
                departement: ligne['Département'] || '',
                hpvFilles1Dose15ans: ligne['HPV filles 1 dose à 15 ans'],
                hpvFilles2Doses16ans: ligne['HPV filles 2 doses à 16 ans'],
                hpvGarcons1Dose15ans: ligne['HPV garçons 1 dose à 15 ans'],
                hpvGarcons2Doses16ans: ligne['HPV garçons 2 doses à 16 ans'],
                meningocoque10_14ans: ligne['Méningocoque C 10-14 ans'],
                meningocoque15_19ans: ligne['Méningocoque C 15-19 ans'],
                meningocoque20_24ans: ligne['Méningocoque C 20-24 ans'],
                grippeMoins65ansRisque: ligne['Grippe moins de 65 ans à risque'],
                grippe65ansPlus: ligne['Grippe 65 ans et plus'],
                grippe65_74ans: ligne['Grippe 65-74 ans'],
                grippe75ansPlus: ligne['Grippe 75 ans et plus'],
                covid19_65ansPlus: ligne['Covid-19 65 ans et plus'],
                region: ligne['Région'] || '',
                regionCode: ligne['Région Code']?.toString() || ''
              }));
            
            resolve(donneesValidees);
          } catch (erreur: any) {
            reject(new Error(`Erreur lors du parsing des données de couverture détaillée: ${erreur}`));
          }
        },
        error: (erreur: any) => {
          reject(new Error(`Erreur Papa Parse couverture détaillée: ${erreur.message}`));
        }
      });
    });
  }

  /**
   * Parse les données nationales de couverture vaccinale
   */
  static async parserCouvertureNationale(contenuCSV: string): Promise<CouvertureVaccinaleNationaleData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(contenuCSV, {
        header: true,
        skipEmptyLines: true,
        transform: (valeur: string, champ: string) => {
          valeur = valeur.trim();
          
          if (champ === 'Année') {
            const nombre = parseInt(valeur, 10);
            return isNaN(nombre) ? 0 : nombre;
          }
          
          // Détecter les colonnes de taux (numériques)
          const nombre = parseFloat(valeur);
          if (!isNaN(nombre) && champ !== 'Année') {
            return nombre;
          }
          
          return valeur;
        },
        complete: (resultats) => {
          try {
            const donneesValidees: CouvertureVaccinaleNationaleData[] = [];
            
            resultats.data.forEach((ligne: any) => {
              if (!ligne['Année']) return;
              
              // Transformer chaque colonne de vaccination en ligne de données
              Object.keys(ligne).forEach(cle => {
                if (cle !== 'Année' && cle !== 'Région' && typeof ligne[cle] === 'number') {
                  donneesValidees.push({
                    annee: ligne['Année'],
                    typeVaccin: cle,
                    classeAge: 'Tous âges', // À adapter selon la structure réelle
                    tauxCouverture: ligne[cle],
                    region: ligne['Région']
                  });
                }
              });
            });
            
            resolve(donneesValidees);
          } catch (erreur: any) {
            reject(new Error(`Erreur lors du parsing des données nationales: ${erreur}`));
          }
        },
        error: (erreur: any) => {
          reject(new Error(`Erreur Papa Parse couverture nationale: ${erreur.message}`));
        }
      });
    });
  }

  /**
   * Parse les données régionales de couverture vaccinale
   */
  static async parserCouvertureRegionale(contenuCSV: string): Promise<CouvertureVaccinaleNationaleData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(contenuCSV, {
        header: true,
        skipEmptyLines: true,
        transform: (valeur: string, champ: string) => {
          valeur = valeur.trim();
          
          if (champ === 'Année') {
            const nombre = parseInt(valeur, 10);
            return isNaN(nombre) ? 0 : nombre;
          }
          
          const nombre = parseFloat(valeur);
          if (!isNaN(nombre) && champ !== 'Année') {
            return nombre;
          }
          
          return valeur;
        },
        complete: (resultats) => {
          try {
            const donneesValidees: CouvertureVaccinaleNationaleData[] = [];
            
            resultats.data.forEach((ligne: any) => {
              if (!ligne['Année']) return;
              
              Object.keys(ligne).forEach(cle => {
                if (cle !== 'Année' && cle !== 'Région' && cle !== 'Code région' && typeof ligne[cle] === 'number') {
                  donneesValidees.push({
                    annee: ligne['Année'],
                    typeVaccin: cle,
                    classeAge: 'Tous âges',
                    tauxCouverture: ligne[cle],
                    region: ligne['Région']
                  });
                }
              });
            });
            
            resolve(donneesValidees);
          } catch (erreur: any) {
            reject(new Error(`Erreur lors du parsing des données régionales: ${erreur}`));
          }
        },
        error: (erreur: any) => {
          reject(new Error(`Erreur Papa Parse couverture régionale: ${erreur.message}`));
        }
      });
    });
  }

  /**
   * Détecte automatiquement le type de fichier CSV et parse en conséquence
   */
  static async parserFichierAutomatique(contenuCSV: string, nomFichier: string): Promise<any[]> {
    // Analyser les en-têtes pour déterminer le type
    const lignes = contenuCSV.split('\n');
    const entetes = lignes[0]?.toLowerCase() || '';
    
    if (entetes.includes('département code') && entetes.includes('hpv')) {
      return await this.parserCouvertureDetailleeParDepartement(contenuCSV);
    } else if (entetes.includes('région') && !entetes.includes('département')) {
      return await this.parserCouvertureRegionale(contenuCSV);
    } else if (nomFichier.includes('france') || nomFichier.includes('national')) {
      return await this.parserCouvertureNationale(contenuCSV);
    } else {
      // Fallback vers le parseur de base
      throw new Error(`Type de fichier non reconnu: ${nomFichier}`);
    }
  }

  /**
   * Valide la qualité des données étendues
   */
  static validerDonneesEtendues(donnees: any[], typeFichier: string): ResultatValidation {
    const erreurs: string[] = [];
    const avertissements: string[] = [];
    
    if (!donnees || donnees.length === 0) {
      erreurs.push(`Aucune donnée trouvée dans le fichier ${typeFichier}`);
      return {
        estValide: false,
        erreurs,
        avertissements,
        statutFichiers: { [typeFichier]: 'erreur' }
      };
    }

    // Vérifier les années manquantes
    const lignesAvecAnneesManquantes = donnees.filter(ligne => 
      !ligne.annee || ligne.annee < 2010 || ligne.annee > 2030
    );

    if (lignesAvecAnneesManquantes.length > 0) {
      avertissements.push(`${lignesAvecAnneesManquantes.length} lignes avec des années invalides dans ${typeFichier}`);
    }

    // Vérifier les taux aberrants (> 100% pour les couvertures vaccinales)
    const lignesAvecTauxAberrants = donnees.filter(ligne => {
      const valeursNumeriques = Object.values(ligne).filter(val => typeof val === 'number');
      return valeursNumeriques.some(val => val > 100 || val < 0);
    });

    if (lignesAvecTauxAberrants.length > 0) {
      avertissements.push(`${lignesAvecTauxAberrants.length} lignes avec des taux aberrants dans ${typeFichier}`);
    }

    const estValide = erreurs.length === 0;
    const statut = erreurs.length > 0 ? 'erreur' : avertissements.length > 0 ? 'avertissement' : 'succes';

    return {
      estValide,
      erreurs,
      avertissements,
      statutFichiers: { [typeFichier]: statut }
    };
  }

  /**
   * Charge et parse un fichier CSV depuis le système de fichiers
   */
  static async chargerFichierCSV(cheminFichier: string): Promise<string> {
    try {
      const response = await fetch(cheminFichier);
      if (!response.ok) {
        throw new Error(`Impossible de charger le fichier: ${response.statusText}`);
      }
      return await response.text();
    } catch (erreur: any) {
      throw new Error(`Erreur lors du chargement du fichier ${cheminFichier}: ${erreur}`);
    }
  }
}