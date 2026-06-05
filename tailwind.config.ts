import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'apple': {
          'bg': '#F5F5F7',
          'surface': '#FFFFFF',
          'surface-secondary': '#FBFBFD',
          'border': 'rgba(0, 0, 0, 0.06)',
          'border-strong': 'rgba(0, 0, 0, 0.12)',
          'text': '#1D1D1F',
          'text-secondary': '#6E6E73',
          'text-tertiary': '#A1A1A6',
          'blue': '#0071E3',
          'blue-hover': '#0077ED',
          'blue-light': '#E8F2FF',
          'green': '#34C759',
          'green-light': '#E8F8ED',
          'orange': '#FF9500',
          'orange-light': '#FFF4E5',
          'red': '#FF3B30',
          'red-light': '#FFEAE8',
          'purple': '#AF52DE',
          'purple-light': '#F3E8FF',
          'teal': '#5AC8FA',
          'teal-light': '#E5F7FF',
          'indigo': '#5856D6',
          'indigo-light': '#EEECFF',
          50: '#FBFBFD',
          100: '#F5F5F7',
          200: '#E8E8ED',
          300: '#D1D1D6',
          400: '#A1A1A6',
          500: '#6E6E73',
          600: '#48484A',
          700: '#3A3A3C',
          800: '#2C2C2E',
          900: '#1D1D1F',
        },
        'brand': {
          'primary': '#0071E3',
          'success': '#34C759',
          'warning': '#FF9500',
          'accent': '#FF3B30',
          'secondary': '#AF52DE',
        },
      },
      boxShadow: {
        'apple-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-lg': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'apple-xl': '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
        'apple-glow-blue': '0 0 20px rgba(0, 113, 227, 0.12)',
        'apple-glow-green': '0 0 20px rgba(52, 199, 89, 0.12)',
        'apple-inner': 'inset 0 1px 1px 0 rgba(0, 0, 0, 0.02)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionDuration: {
        '200': '200ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
      },
    },
  },
  plugins: [],
};
export default config;