/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3a86ff',
          light: '#5d9bff',
          dark: '#1a66d9',
        },
        secondary: {
          DEFAULT: '#ff5a5f',
          light: '#ff8087',
          dark: '#e03940',
        },
        neutral: {
          dark: '#1a1a1a',
          DEFAULT: '#404040',
          light: '#f0f0f0',
        },
        accent: {
          DEFAULT: '#ffbe0b',
          light: '#ffd056',
          dark: '#e6a900',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 20px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 15px 30px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
