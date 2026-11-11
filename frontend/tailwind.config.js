/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf6',
          100: '#d6f5ea',
          200: '#aeeada',
          300: '#7adcc4',
          400: '#45c4a8',
          500: '#20a98d',
          600: '#158872',
          700: '#146d5d',
          800: '#14574c',
          900: '#134840',
          950: '#062924',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
