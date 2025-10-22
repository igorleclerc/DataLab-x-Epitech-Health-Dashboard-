/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'marianne': ['var(--font-marianne)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Couleurs officielles du Gouvernement français
        'blue-france': '#000091',
        'blue-france-hover': '#1212ff',
        'blue-france-active': '#2323ff',
        'red-marianne': '#e1000f',
        'red-marianne-hover': '#ff292f',
        'red-marianne-active': '#ff4347',
        
        // Couleurs grises officielles
        'grey-france': {
          50: '#f6f6f6',
          100: '#eeeeee',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#929292',
          500: '#666666',
          600: '#4d4d4d',
          700: '#383838',
          800: '#1e1e1e',
          900: '#161616'
        },
        
        // Couleurs d'état gouvernementales
        'success-france': '#18753c',
        'warning-france': '#fc5d00',
        'error-france': '#ce0500',
        'info-france': '#0063cb',
      },
      
      // Espacements selon le système de design de l'État
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Ombres selon le design system
      boxShadow: {
        'france': '0 2px 6px 0 rgba(0, 0, 0, 0.05)',
        'france-lg': '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}