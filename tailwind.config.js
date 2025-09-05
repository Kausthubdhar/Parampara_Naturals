/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#66BB6A',
          light: '#81C784',
        },
        background: {
          DEFAULT: '#F9F9F9',
          dark: '#1A1A1A',
          secondary: '#FFFFFF',
          'secondary-dark': '#2D2D2D',
        },
        text: {
          DEFAULT: '#1A1A1A',
          dark: '#F5F5F5',
          secondary: '#666666',
          'secondary-dark': '#B0B0B0',
        },
        accent: {
          brown: '#8D6E63',
          orange: '#FF9800',
          'brown-dark': '#A1887F',
          'orange-dark': '#FFB74D',
        },
        secondary: {
          DEFAULT: '#F1F8E9',
          dark: '#2E3A1F',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#404040',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#2D2D2D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
