import Papa from 'papaparse';
import { 
  FluSurveillanceNationalData, 
  FluSurveillanceDepartmentalData,
  ResultatValidation 
} from '../types';

export class ParseurGrippe {
  /**
   * Parse les données nationales de surveillance grippe
   */
  static async parserDonneesNationales(contenuCSV: string): Promise<FluSurveillanceNationalData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(contenuCSV, {
        header: true,
        skipEmptyLines: true,
        transform: (valeur: string, champ: string) => {
          valeur = valeur.trim();
          
          // Convertir les nombres pour les taux
          if (champ.includes('Taux') || champ.includes('taux')) {
            const nombre = parseFloat(valeur);
            return isNaN(nombre) ? 0 : nombre;
          }
          
          return valeur;
        },
        complete: (resultats) => {
          try {
            const donneesValidees = resultats.data
              .filter((ligne: any) => ligne['1er jour de la semaine'] && ligne['Semaine'])
              .map((ligne: any) => ({
                premierJourSemaine: ligne['1er jour de la semaine'],
                semaine: ligne['Semaine'],
                classeAge: ligne['Classe d\'âge'] || 'Non spécifié',
                tauxPassagesUrgences: ligne['Taux de passages aux urgences pour grippe'] || 0,
                tauxHospitalisations: ligne['Taux d\'hospitalisations après passages aux urgences pour grippe'] || 0,
                tauxActesSOS: ligne['Taux d\'actes médicaux SOS médecins pour grippe'] || 0
              }));
            
            resolve(donneesValidees);
          } catch (erreur: any) {
            reject(new Error(`Erreur lors du parsing des données nationales grippe: ${erreur}`));
          }
        },
        error: (erreur: any) => {
          reject(new Error(`Erreur Papa Parse grippe nationale: ${erreur.message}`));
        }
      });
    });
  }

  /**
   * Parse les données départementales de surveillance grippe
   */
  static async parserDonneesDepartementales(contenuCSV: string): Promise<FluSurveillanceDepartmentalData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(contenuCSV, {
        header: true,
        skipEmptyLines: true,
        transform: (valeur: string, champ: string) => {
          valeur = valeur.trim();
          
          if (champ.includes('Taux') || champ.includes('taux') || champ.includes('Code')) {
            const nombre = parseFloat(valeur);
            return isNaN(nombre) ? (champ.includes('Code') ? valeur : 0) : nombre;
          }
          
          return valeur;
        },
        complete: (resultats) => {
          try {
            const donneesValidees = resultats.data
              .filter((ligne: any) => ligne['1er jour de la semaine'] && ligne['Semaine'] && ligne['Département'])
              .map((ligne: any) => ({
                premierJourSemaine: ligne['1er jour de la semaine'],
                semaine: ligne['Semaine'],
                departementCode: ligne['Département Code']?.toString() || '',
                departement: ligne['Département'] || '',
                classeAge: ligne['Classe d\'âge'] || 'Non spécifié',
                tauxPassagesUrgences: ligne['Taux de passages aux urgences pour grippe'] || 0,
                tauxHospitalisations: ligne['Taux d\'hospitalisations après passages aux urgences pour grippe'] || 0,
                tauxActesSOS: ligne['Taux d\'actes médicaux SOS médecins pour grippe'] || 0,
                region: ligne['Région'] || '',
                regionCode: ligne['Région Code']?.toString() || ''
              }));
            
            resolve(donneesValidees);
          } catch (erreur: any) {
            reject(new Error(`Erreur lors du parsing des données départementales grippe: ${erreur}`));
          }
        },
        error: (erreur: any) => {
          reject(new Error(`Erreur Papa Parse grippe départementale: ${erreur.message}`));
        }
      });
    });
  }

  /**
   * Parse les données régionales de surveillance grippe
   */
  static async parserDonneesRegionales(contenuCSV: string): Promise<FluSurveillanceDepartmentalData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(contenuCSV, {
        header: true,
        skipEmptyLines: true,
        transform: (valeur: string, champ: string) => {
          valeur = valeur.trim();
          
          if (champ.includes('Taux') || champ.includes('taux') || champ.includes('Code')) {
            const nombre = parseFloat(valeur);
            return isNaN(nombre) ? (champ.includes('Code') ? valeur : 0) : nombre;
          }
          
          return valeur;
        },
        complete: (resultats) => {
          try {
            const donneesValidees = resultats.data
              .filter((ligne: any) => ligne['1er jour de la semaine'] && ligne['Semaine'])
              .map((ligne: any) => ({
                premierJourSemaine: ligne['1er jour de la semaine'],
                semaine: ligne['Semaine'],
                departementCode: '', // Pas de département pour les données régionales
                departement: '',
                classeAge: ligne['Classe d\'âge'] || 'Non spécifié',
                tauxPassagesUrgences: ligne['Taux de passages aux urgences pour grippe'] || 0,
                tauxHospitalisations: ligne['Taux d\'hospitalisations après passages aux urgences pour grippe'] || 0,
                tauxActesSOS: ligne['Taux d\'actes médicaux SOS médecins pour grippe'] || 0,
                region: ligne['Région'] || ligne['Region'] || '',
                regionCode: ligne['Région Code']?.toString() || ligne['Region Code']?.toString() || ''
              }));
            
            resolve(donneesValidees);
          } catch (erreur: any) {
            reject(new Error(`Erreur lors du parsing des données régionales grippe: ${erreur}`));
          }
        },
        error: (erreur: any) => {
          reject(new Error(`Erreur Papa Parse grippe régionale: ${erreur.message}`));
        }
      });
    });
  }

  /**
   * Valide la qualité des données de grippe
   */
  static validerDonnees(donnees: any[], typeFichier: string): ResultatValidation {
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

    // Vérifier les valeurs manquantes critiques
    const lignesAvecDatesManquantes = donnees.filter(ligne => 
      !ligne.premierJourSemaine || !ligne.semaine
    );

    if (lignesAvecDatesManquantes.length > 0) {
      avertissements.push(`${lignesAvecDatesManquantes.length} lignes avec des dates manquantes dans ${typeFichier}`);
    }

    // Vérifier les taux aberrants (négatifs ou très élevés)
    const lignesAvecTauxAberrants = donnees.filter(ligne => 
      ligne.tauxPassagesUrgences < 0 || ligne.tauxPassagesUrgences > 10000 ||
      ligne.tauxHospitalisations < 0 || ligne.tauxHospitalisations > 10000 ||
      ligne.tauxActesSOS < 0 || ligne.tauxActesSOS > 50000
    );

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