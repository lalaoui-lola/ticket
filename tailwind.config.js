/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f3',
          100: '#cce5e7',
          200: '#99cbd0',
          300: '#66b1b8',
          400: '#3397a1',
          500: '#175C64', // Couleur principale
          600: '#124a50',
          700: '#0e373c',
          800: '#0E3A40', // Couleur foncée
          900: '#071d20',
        },
        accent: {
          50: '#fef5f3',
          100: '#feeae7',
          200: '#fdd5cf',
          300: '#fcc0b7',
          400: '#fbab9f',
          500: '#F7C7BB', // Couleur accent rose
          600: '#f5a08e',
          700: '#f3795d',
          800: '#f1522c',
          900: '#c73e1f',
        },
        neutral: {
          50: '#f9fafa',
          100: '#EEF2F2', // Couleur neutre claire
          200: '#dde5e5',
          300: '#ccd8d8',
          400: '#bbcbcb',
          500: '#aabebe',
          600: '#889595',
          700: '#667070',
          800: '#444b4b',
          900: '#222626',
        },
      },
    },
  },
  plugins: [],
}
