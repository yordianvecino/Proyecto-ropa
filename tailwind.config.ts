import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#F7B7C9',     // rosa suave (fondo/acento)
          rose: '#E78CA8',     // rosa medio (botones/acento)
          blush: '#FDE7EF',    // muy claro para secciones
          gold: '#D4AF37',     // dorado de la corona
          black: '#111827',    // casi negro para textos
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        // Poppins-like fallback stack
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        // Script accent fallback
        accent: ['"Brush Script MT"', '"Segoe Script"', 'cursive'],
      }
    },
  },
  plugins: [],
}
export default config