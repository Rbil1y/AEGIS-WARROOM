/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#080c14',
          subtle: '#0d131f',
          surface: '#121a29',
          elevated: '#1a2438',
          border: '#1e293b',
          borderHover: '#334155'
        },
        brand: {
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          accent: '#38bdf8',
          indigo: '#6366f1'
        },
        status: {
          healthy: '#10b981',
          healthyBg: 'rgba(16, 185, 129, 0.1)',
          warning: '#f59e0b',
          warningBg: 'rgba(245, 158, 11, 0.1)',
          critical: '#ef4444',
          criticalBg: 'rgba(239, 68, 68, 0.1)',
          quarantine: '#818cf8',
          quarantineBg: 'rgba(129, 140, 248, 0.1)'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.6)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
      }
    },
  },
  plugins: [],
}
