/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f7f9fb',
          dim: '#d8dadc',
          bright: '#f7f9fb',
          variant: '#e0e3e5',
          container: {
            lowest: '#ffffff',
            low: '#f2f4f6',
            DEFAULT: '#eceef0',
            high: '#e6e8ea',
            highest: '#e0e3e5',
          }
        },
        'on-surface': {
          DEFAULT: '#191c1e',
          variant: '#45464d',
        },
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        outline: {
          DEFAULT: '#76777d',
          variant: '#c6c6cd',
        },
        primary: {
          DEFAULT: '#000000',
          container: '#131b2e',
          fixed: '#dae2fd',
          'fixed-dim': '#bec6e0',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#7c839b',
          fixed: '#131b2e',
          'fixed-variant': '#3f465c',
        },
        'inverse-primary': '#bec6e0',
        secondary: {
          DEFAULT: '#4059aa',
          container: '#8fa7fe',
          fixed: '#dce1ff',
          'fixed-dim': '#b6c4ff',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#1d3989',
          fixed: '#00164e',
          'fixed-variant': '#264191',
        },
        tertiary: {
          DEFAULT: '#000000',
          container: '#271901',
          fixed: '#fcdeb5',
          'fixed-dim': '#dec29a',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#98805d',
          fixed: '#271901',
          'fixed-variant': '#574425',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        brand: {
          blue: '#88C1E0',
          'blue-hover': '#72b2d4',
          'blue-light': '#eaf4fa',
          accent: '#FFC300',
          'accent-hover': '#e6b000',
          'accent-light': '#fff8e1',
          dark: '#333333',
          white: '#FFFFFF',
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
