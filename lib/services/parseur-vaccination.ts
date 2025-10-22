import Papa from 'papaparse';
import {
    VaccinationCampaignData,
    VaccinationCoverageData,
    VaccinationDosesActesData,
    ResultatValidation
} from '../types';

export class ParseurVaccination {
    /**
     * Parse les données de campagne de vaccination
     */
    static async parserCampagne(contenuCSV: string): Promise<VaccinationCampaignData[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(contenuCSV, {
                header: true,
                skipEmptyLines: true,
                transform: (valeur: string, champ: string) => {
                    // Nettoyer les espaces
                    valeur = valeur.trim();

                    // Convertir les nombres
                    if (champ === 'valeur' || champ === 'cible') {
                        const nombre = parseFloat(valeur);
                        return isNaN(nombre) ? 0 : nombre;
                    }

                    return valeur;
                },
                complete: (resultats) => {
                    try {
                        const donneesValidees = resultats.data
                            .filter((ligne: any) => ligne.campagne && ligne.date && ligne.variable)
                            .map((ligne: any) => ({
                                campagne: ligne.campagne,
                                date: ligne.date,
                                variable: ligne.variable as VaccinationCampaignData['variable'],
                                valeur: ligne.valeur,
                                cible: ligne.cible
                            }));

                        resolve(donneesValidees);
                    } catch (erreur: any) {
                        reject(new Error(`Erreur lors du parsing des données de campagne: ${erreur}`));
                    }
                },
                error: (erreur: any) => {
                    reject(new Error(`Erreur Papa Parse campagne: ${erreur.message}`));
                }
            });
        });
    }

    /**
     * Parse les données de couverture vaccinale
     */
    static async parserCouverture(contenuCSV: string): Promise<VaccinationCoverageData[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(contenuCSV, {
                header: true,
                skipEmptyLines: true,
                transform: (valeur: string, champ: string) => {
                    valeur = valeur.trim();

                    if (champ === 'valeur') {
                        const nombre = parseFloat(valeur);
                        return isNaN(nombre) ? 0 : nombre;
                    }

                    return valeur;
                },
                complete: (resultats) => {
                    try {
                        const donneesValidees = resultats.data
                            .filter((ligne: any) => ligne.region && ligne.code && ligne.variable && ligne.groupe)
                            .map((ligne: any) => ({
                                region: ligne.region,
                                code: ligne.code,
                                variable: ligne.variable as VaccinationCoverageData['variable'],
                                groupe: ligne.groupe as VaccinationCoverageData['groupe'],
                                valeur: ligne.valeur
                            }));

                        resolve(donneesValidees);
                    } catch (erreur: any) {
                        reject(new Error(`Erreur lors du parsing des données de couverture: ${erreur}`));
                    }
                },
                error: (erreur: any) => {
                    reject(new Error(`Erreur Papa Parse couverture: ${erreur.message}`));
                }
            });
        });
    }

    /**
     * Parse les données de doses et actes
     */
    static async parserDosesActes(contenuCSV: string): Promise<VaccinationDosesActesData[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(contenuCSV, {
                header: true,
                skipEmptyLines: true,
                transform: (valeur: string, champ: string) => {
                    valeur = valeur.trim();

                    if (champ === 'valeur' || champ === 'jour') {
                        const nombre = parseFloat(valeur);
                        return isNaN(nombre) ? 0 : nombre;
                    }

                    return valeur;
                },
                complete: (resultats) => {
                    try {
                        const donneesValidees = resultats.data
                            .filter((ligne: any) => ligne.campagne && ligne.date && ligne.variable && ligne.groupe)
                            .map((ligne: any) => ({
                                campagne: ligne.campagne,
                                date: ligne.date,
                                jour: ligne.jour,
                                variable: ligne.variable as VaccinationDosesActesData['variable'],
                                groupe: ligne.groupe as VaccinationDosesActesData['groupe'],
                                valeur: ligne.valeur
                            }));

                        resolve(donneesValidees);
                    } catch (erreur: any) {
                        reject(new Error(`Erreur lors du parsing des données doses-actes: ${erreur}`));
                    }
                },
                error: (erreur: any) => {
                    reject(new Error(`Erreur Papa Parse doses-actes: ${erreur.message}`));
                }
            });
        });
    }

    /**
     * Valide la qualité des données parsées
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

        // Vérifier les valeurs manquantes
        const lignesAvecValeursManquantes = donnees.filter(ligne =>
            Object.values(ligne).some(valeur => valeur === null || valeur === undefined || valeur === '')
        );

        if (lignesAvecValeursManquantes.length > 0) {
            avertissements.push(`${lignesAvecValeursManquantes.length} lignes avec des valeurs manquantes dans ${typeFichier}`);
        }

        // Vérifier les valeurs numériques négatives
        const lignesAvecValeursNegatives = donnees.filter(ligne =>
            'valeur' in ligne && ligne.valeur < 0
        );

        if (lignesAvecValeursNegatives.length > 0) {
            avertissements.push(`${lignesAvecValeursNegatives.length} lignes avec des valeurs négatives dans ${typeFichier}`);
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