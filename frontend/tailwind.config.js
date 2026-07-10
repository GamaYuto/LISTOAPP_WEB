/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fc',
          100: '#e6ebf8',
          200: '#c7d5ef',
          300: '#9cb5e3',
          400: '#6b90d4',
          500: '#486bc6',
          600: '#3551b0',
          700: '#2c408f',
          800: '#283675',
          900: '#24305f',
        }
      }
    },
  },
  plugins: [],
}
