/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // AWS风格色彩系统
        'aws': {
          'dark': '#0f1419',
          'darker': '#0a0e13',
          'navy': '#232f3e',
          'navy-light': '#37475a',
          'orange': '#ff9900',
          'orange-dark': '#e88600',
          'orange-light': '#ffb84d',
          'blue': '#146eb4',
          'blue-light': '#2074d9',
          'gray': {
            50: '#fafbfc',
            100: '#f0f3f6',
            200: '#e1e8ed',
            300: '#d2dae2',
            400: '#879099',
            500: '#5a6c7d',
            600: '#4a5568',
            700: '#2d3748',
            800: '#1a202c',
            900: '#171923',
          }
        },
        primary: {
          50: '#eff6ff',
          500: '#146eb4',
          600: '#0f5a94',
          700: '#0a4674',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      boxShadow: {
        'aws': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'aws-lg': '0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'aws-xl': '0 8px 16px 0 rgba(0, 0, 0, 0.15), 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'aws-gradient': 'linear-gradient(135deg, #0f1419 0%, #232f3e 100%)',
        'aws-card': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}