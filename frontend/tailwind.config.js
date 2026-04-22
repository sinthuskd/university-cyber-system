module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        void:    '#03060f',
        deep:    '#060c1a',
        base:    '#0a1224',
        elevated:'#0f1a30',
        surface: '#111d33',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
