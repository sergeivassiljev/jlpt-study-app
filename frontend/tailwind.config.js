/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      colors: {
        // Light mode colors
        'light-bg': '#f8f5f2',
        'light-headline': '#232323',
        'light-paragraph': '#222525',
        'light-button': '#078080',
        'light-accent-secondary': '#078080',
        'light-accent-tertiary': '#f8f5f2',
        
        // Dark mode colors
        'dark-bg': '#0b1418',
        'dark-headline': '#e6f1f5',
        'dark-paragraph': '#c6d4df',
        'dark-button': '#14b8a6',
        'dark-accent-secondary': '#14b8a6',
        'dark-accent-tertiary': '#122027',
        
        // Semantic color names
        'primary': '#078080', // Light mode primary (teal)
        'primary-dark': '#14b8a6', // Dark mode primary (teal)
        'secondary': '#078080', // Secondary (teal)
        'success': '#14b8a6', // Accent/success (teal)
      },
    },
  },
  plugins: [],
}
