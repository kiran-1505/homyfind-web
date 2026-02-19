/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF3FC',
          100: '#D6E7F9',
          200: '#ADCff3',
          300: '#85B7ED',
          400: '#5CA0E7',
          500: '#4A90E2',
          600: '#3A7BD0',
          700: '#2E63A8',
          800: '#234B80',
          900: '#183358',
        },
        secondary: '#2ecc71',
      },
    },
  },
  plugins: [],
}
