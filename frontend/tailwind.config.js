/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B00',
        maroon: '#8B1A1A',
        gold: '#D4A017',
        cream: '#FDF6EC',
        charcoal: '#1A1A1A',
        brown: '#2C1810',
        offwhite: '#F5F0E8',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
        dmserif: ['"DM Serif Display"', 'serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 80s linear infinite',
        'float-up': 'floatUp 6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0px)', opacity: '0.7' },
          '100%': { transform: 'translateY(-100vh)', opacity: '0' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.3)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
