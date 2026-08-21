/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        'primary-text': '#111827',
        'secondary-text': '#6B7280',
        brand: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          text: '#15803D',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          text: '#B91C1C',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          text: '#B45309',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
