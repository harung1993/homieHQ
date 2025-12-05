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
        primary: '#38bdf8',  // Sky blue primary
        secondary: '#3b82f6', // Blue secondary
        accent: '#ED8936',   // Orange shade
        'property-primary': '#38bdf8', // Sky blue for PropertyPal
        'property-secondary': '#3b82f6', // Blue secondary for PropertyPal
        'property-light': '#f0f9ff', // Light sky blue
        'property-color': '#38bdf8', // Sky blue for "Property" text
        text: '#E5E7EB',
        'text-dark': '#9CA3AF',
        'input-bg': '#374151',
        'input-border': '#4B5563',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'property-gradient': 'linear-gradient(to bottom right, #38bdf8, #3b82f6)',
      },
    },
  },
  plugins: [],
}
