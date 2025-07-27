/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette satirique inspirée South Park/Simpsons
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Orange principal
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Bleu satirique
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        satirical: {
          yellow: '#FFD700', // Jaune Simpsons
          green: '#32CD32',   // Vert satirique
          red: '#FF4444',     // Rouge cartoon
          purple: '#9932CC',  // Violet South Park
          pink: '#FF69B4',    // Rose cartoon
        },
        background: '#FFF8DC', // Beige cartoon
        surface: '#FFFFFF',
        'surface-variant': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cartoon: ['Comic Sans MS', 'cursive'],
        bold: ['Impact', 'Arial Black', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
      borderRadius: {
        'cartoon': '20px',
        'bubble': '25px',
      },
      boxShadow: {
        'cartoon': '4px 4px 0px 0px rgba(0,0,0,0.3)',
        'cartoon-hover': '6px 6px 0px 0px rgba(0,0,0,0.4)',
        'inner-cartoon': 'inset 2px 2px 4px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

