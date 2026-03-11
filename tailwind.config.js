/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#10b981',
          'accent-hover': '#059669',
          'accent-glow': 'rgba(16, 185, 129, 0.15)',
          text: '#f8fafc',
          'text-muted': '#94a3b8',
          danger: '#ef4444',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
