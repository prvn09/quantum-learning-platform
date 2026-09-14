/* Tailwind CSS Configuration (tailwind.config.js) */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6C5CE7', // Deep Purple
        'secondary': '#00D9FF', // Neon Blue
        'accent': '#39FF14', // Bright Green
        'background-dark': '#0F0C29', // Dark gradient start
        'background-mid': '#302B63', // Dark gradient end
        'text-bright': '#F5F5F5', // Bright White
      },
      screens: {
        'xs': '320px',
        'sm': '768px',
        'md': '1024px',
        'lg': '1440px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'full': '50%',
      },
      boxShadow: {
        'sm': '0 4px 12px rgba(107, 92, 231, 0.15)',
        'md': '0 8px 24px rgba(107, 92, 231, 0.2)',
        'lg': '0 12px 40px rgba(107, 92, 231, 0.25)',
        'glow': '0 0 20px rgba(107, 92, 231, 0.5)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        'gradientBG': {
          '0%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
          '100%': {
            'background-position': '0% 50%',
          },
        },
        'float': {
          '0%, 100%': {
            'transform': 'translateY(0)',
          },
          '50%': {
            'transform': 'translateY(-10px)',
          },
        },
        'glow': {
          '0%, 100%': {
            'box-shadow': '0 0 10px rgba(255, 255, 255, 0.2)',
            'opacity': '0.8',
          },
          '50%': {
            'box-shadow': '0 0 20px rgba(57, 255, 20, 0.7)', // Accent Green glow
            'opacity': '1',
          },
        },
        'fadeInScale': {
          'from': {
            'opacity': '0',
            'transform': 'scale(0.95)',
          },
          'to': {
            'opacity': '1',
            'transform': 'scale(1)',
          },
        },
        'ripple': {
          'to': {
            'box-shadow': '0 0 0 10px rgba(255, 255, 255, 0.7)',
            'transform': 'scale(1.5)',
            'opacity': '0',
          },
        },
        'slideIn': {
          'from': {
            'transform': 'translateX(100%)',
            'opacity': '0',
          },
          'to': {
            'transform': 'translateX(0)',
            'opacity': '1',
          },
        },
      },
      animation: {
        'gradient': 'gradientBG 15s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in-scale': 'fadeInScale 1s ease-out forwards',
        'ripple': 'ripple 0.6s linear forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
