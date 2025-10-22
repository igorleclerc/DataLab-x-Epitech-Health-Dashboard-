// Couleurs officielles du Gouvernement français
export const GOVERNMENT_COLORS = {
  // Bleu France
  'blue-france': {
    'sun-113': {
      primary: '#000091',
      hover: '#1212ff',
      active: '#2323ff'
    }
  },
  
  // Rouge Marianne
  'red-marianne': {
    'main-472': {
      primary: '#e1000f',
      hover: '#ff292f',
      active: '#ff4347'
    }
  },
  
  // Couleurs complémentaires du système de design de l'État
  'grey-france': {
    '50': '#f6f6f6',
    '100': '#eeeeee',
    '200': '#e5e5e5',
    '300': '#d4d4d4',
    '400': '#929292',
    '500': '#666666',
    '600': '#4d4d4d',
    '700': '#383838',
    '800': '#1e1e1e',
    '900': '#161616'
  },
  
  // Couleurs d'état
  success: '#18753c',
  warning: '#fc5d00',
  error: '#ce0500',
  info: '#0063cb'
} as const

// Couleurs pour les graphiques (respectant l'identité visuelle)
export const CHART_COLORS = {
  vaccination: {
    primary: GOVERNMENT_COLORS['blue-france']['sun-113'].primary,
    secondary: '#6a9bd1',
    light: '#b3d1f0'
  },
  surveillance: {
    primary: GOVERNMENT_COLORS['red-marianne']['main-472'].primary,
    secondary: '#f56565',
    light: '#fed7d7'
  },
  neutral: {
    primary: GOVERNMENT_COLORS['grey-france']['600'],
    secondary: GOVERNMENT_COLORS['grey-france']['400'],
    light: GOVERNMENT_COLORS['grey-france']['100']
  }
}