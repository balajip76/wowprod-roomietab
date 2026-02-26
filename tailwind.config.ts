import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        caveat: ['var(--font-caveat)', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
      },
      boxShadow: {
        card: '3px 4px 0 #C4B8D9',
        'card-hover': '1px 2px 0 #C4B8D9',
        fab: '3px 3px 0 #4338CA, 0 4px 16px rgba(99,102,241,0.35)',
        toast: '3px 4px 0 #C4B8D9',
        drawer: '0 -4px 32px rgba(99,102,241,0.12)',
      },
      animation: {
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-scale': 'pulseScale 1s ease-in-out 3',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateX(-50%) translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [forms],
}

export default config
