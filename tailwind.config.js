/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enables dark mode via class strategy
  theme: {
    extend: {
      fontFamily: {
        azonix: ['AZONIX', 'Arial', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        // EAST theme (Anime - Neon Red)
        east: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ff1a1a',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d'
        },
        // WEST theme (Movies/Cartoons - Neon Blue)
        west: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#00bfff',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        // Netflix-inspired dark theme
        netflix: {
          black: '#000000',
          dark: '#141414',
          gray: '#333333',
          lightGray: '#564d4d'
        }
      },
      boxShadow: {
        'glow-east': '0 0 10px #ff1a1a, 0 0 20px #ff1a1a',
        'glow-west': '0 0 10px #00bfff, 0 0 20px #00bfff',
        neon: '0 0 8px #ff1a1a, 0 0 16px #ff1a1a',
        glow: '0 0 10px #ff1e56, 0 0 20px #ff1e56',
      },
      textColor: {
        'glow-red': '#ff1e56',
        'glow-blue': '#00ffff',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        glow: 'glow 2s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor' },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
