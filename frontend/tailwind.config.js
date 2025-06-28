// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B46C1',
        secondary: '#2C7A7B',
        accent: '#F6E05E',
      },
      backgroundImage: {
        'gradient-vertical': 'linear-gradient(to bottom, #6B46C1, #2C7A7B)',
      },
      fontFamily: {
        heading: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
