/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#0A0F1E', card: '#0D1530', glass: 'rgba(13,21,48,0.7)' },
        brand: { blue: '#3B82F6', purple: '#8B5CF6', cyan: '#22D3EE' },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        head: ['Inter', 'DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
};
