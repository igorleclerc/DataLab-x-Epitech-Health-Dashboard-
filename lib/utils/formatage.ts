import { TEXTES_INTERFACE } from '../constants/textes';

/**
 * Formate une date en français
 */
export function formaterDate(date: string | Date, format: 'court' | 'long' | 'complet' = 'court'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Paris',
  };
  
  switch (format) {
    case 'court':
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;
    case 'long':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
    case 'complet':
      options.weekday = 'long';
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
  }
  
  return dateObj.toLocaleDateString('fr-FR', options);
}

/**
 * Formate un nombre avec les séparateurs français
 */
export function formaterNombre(nombre: number, decimales: number = 0): string {
  return nombre.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/**
 * Formate un pourcentage
 */
export function formaterPourcentage(valeur: number, decimales: number = 1): string {
  return `${formaterNombre(valeur, decimales)} %`;
}

/**
 * Formate un nombre avec unité (k, M)
 */
export function formaterNombreAvecUnite(nombre: number): string {
  if (nombre >= 1000000) {
    return `${formaterNombre(nombre / 1000000, 1)} M`;
  } else if (nombre >= 1000) {
    return `${formaterNombre(nombre / 1000, 1)} k`;
  }
  return formaterNombre(nombre);
}

/**
 * Formate une semaine épidémiologique
 */
export function formaterSemaine(semaine: string): string {
  // Format: "2024-S01" -> "Semaine 1, 2024"
  const [annee, sem] = semaine.split('-S');
  const numeroSemaine = parseInt(sem, 10);
  return `Semaine ${numeroSemaine}, ${annee}`;
}

/**
 * Formate un taux pour 100k habitants
 */
export function formaterTaux(taux: number, decimales: number = 1): string {
  return `${formaterNombre(taux, decimales)} pour 100 000 hab.`;
}

/**
 * Convertit un nom de mois anglais en français
 */
export function obtenirNomMoisFrancais(mois: number): string {
  const nomsMois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return nomsMois[mois - 1] || '';
}

/**
 * Convertit un nom de jour anglais en français
 */
export function obtenirNomJourFrancais(jour: number): string {
  const nomsJours = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];
  return nomsJours[jour] || '';
}

/**
 * Formate une plage de dates
 */
export function formaterPlageDates(debut: string, fin: string): string {
  return `Du ${formaterDate(debut, 'long')} au ${formaterDate(fin, 'long')}`;
}