/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2942',
          blue: '#1e3a8a',
          sky: '#0284c7',
          forest: '#15803d',
          emerald: '#059669',
          amber: '#b45309',
          gold: '#d97706',
          saffron: '#f97316',
          slate: '#334155',
          light: '#f8fafc',
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
