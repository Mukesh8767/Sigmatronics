export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    extend: {
      colors: {
        richblack: '#0F0F0F',
        slateblack: '#232D3F',
        emerald: '#005B41',
        lightgray: '#F5F5F5',
        mutedgray: '#6B7280',
        chartindigo: '#6366F1',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
