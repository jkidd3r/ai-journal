/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./apps/web/**/*.{js,ts,jsx,tsx}",
      "./packages/ui/**/*.{js,ts,jsx,tsx}",
      './src/**/*.{js,ts,jsx,tsx}' // adjust if your paths are different
    ],
    theme: {
      extend: {
        colors: {
          background: '#1a1a1a',
          accent: '#6e56cf',
        },
        fontFamily: {
          sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
          mono: ['var(--font-mono)', 'monospace'],
        },
      },
    },
   // darkMode: 'class', // or 'media'
    plugins: [],
  }  