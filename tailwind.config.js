/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vertPale: '#ECFDF5',      // Vert pâle très doux
        vertLight: '#D1FAE5',     // Vert menthe claire
        vertAccent: '#10B981',    // Vert émeraude vibrant
        vertHover: '#059669',     // Vert émeraude soutenu
        vertDark: '#064E3B',      // Vert forêt profond
        
        obsidienne: '#064E3B',    // Vert forêt sombre chic pour headers/sidebars
        champagne: '#10B981',     // Vert émeraude lumineuse (accent)
        ivoire: '#FFFFFF',        // Blanc pur
        ardoise: '#043A2C',       // Vert sombre ardoise
        
        primary: '#064E3B',
        accent: '#10B981',
        background: '#F0FDF4',
        darkText: '#064E3B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'sans-serif'],
        mono: ['Inter', 'system-ui', 'sans-serif'], // Remplace la police code/monospace par la police basique Inter !
      },
      borderRadius: {
        'pill': '9999px',
        '2rem': '2rem',
        '3rem': '3rem',
      },
      transitionTimingFunction: {
        'magnetic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'elastic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [],
}
