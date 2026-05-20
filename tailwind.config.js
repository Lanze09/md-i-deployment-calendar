/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accenture: {
          50: '#F3E5FF',
          100: '#E0B3FF',
          200: '#C266FF',
          300: '#B84DFF',
          400: '#A100FF',
          500: '#8A00DB',
          600: '#7B00CF',
          700: '#5C0099',
          800: '#460073',
          900: '#2E004D',
        },
        surface: {
          'light-primary': '#FFFFFF',
          'light-secondary': '#F4F4F6',
          'light-tertiary': '#EAEAEF',
          'dark-primary': '#0D0D1A',
          'dark-secondary': '#1A1A2E',
          'dark-tertiary': '#252540',
        },
        team: {
          idm: '#A100FF',
          dqa: '#00B140',
          rmt: '#0070F3',
          prt: '#F5A623',
          cdp: '#E4002B',
          myconcerto: '#00C2CE',
          nexus: '#FF6B35',
        },
        status: {
          success: '#00B140',
          warning: '#F5A623',
          danger: '#E4002B',
          info: '#0070F3',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'freeze-stripes':
          'repeating-linear-gradient(45deg, rgba(245,166,35,0.18), rgba(245,166,35,0.18) 6px, transparent 6px, transparent 12px)',
        'freeze-stripes-dark':
          'repeating-linear-gradient(45deg, rgba(245,166,35,0.28), rgba(245,166,35,0.28) 6px, transparent 6px, transparent 12px)',
      },
    },
  },
  plugins: [],
};
