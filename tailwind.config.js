/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores del sistema BRISA
        primary: {
          DEFAULT: '#0B2E50',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#27C5DA',
          hover: '#3AC0B8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#3AC0B8',
          foreground: '#ffffff',
        },
        danger: {
          DEFAULT: '#EF5C52',
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: '#7A95D9',
          foreground: '#ffffff',
        },
        // Estados
        pendiente: '#27C5DA',
        aprobado: '#3AC0B8',
        rechazado: '#EF5C52',
        // UI Colors
        background: '#f8fafc',
        foreground: '#0B2E50',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0B2E50',
        },
        border: '#e2e8f0',
        input: '#f1f5f9',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
