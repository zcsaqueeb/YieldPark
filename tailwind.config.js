/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yield: {
          bg: '#080B14',
          surface: '#0D1117',
          card: '#111827',
          border: '#1F2937',
          teal: '#00D4AA',
          cyan: '#06B6D4',
          purple: '#7C3AED',
          violet: '#8B5CF6',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          muted: '#6B7280',
          subtle: '#374151',
          text: '#F9FAFB',
          dim: '#9CA3AF',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'teal-glow': 'radial-gradient(circle at 50% 50%, rgba(0,212,170,0.15) 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'counter': 'counter 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,212,170,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,212,170,0.6), 0 0 40px rgba(0,212,170,0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
