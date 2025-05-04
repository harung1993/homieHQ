/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#1F2937',
        'card-bg': '#2D3748',
        primary: '#2C5282',  // Blue shade
        secondary: '#38B2AC', // Teal shade
        accent: '#ED8936',   // Orange shade
        'home-color': '#38B2AC', // Teal for "Home" text
        'property-color': '#4299E1', // Blue for "Property" text
        text: '#E5E7EB',
        'text-dark': '#9CA3AF',
        'input-bg': '#374151',
        'input-border': '#4B5563',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
