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
        // Light mode colors — Sakura Day
        'light-bg': '#FAF6F3',
        'light-headline': '#2B2B2B',
        'light-paragraph': '#6B6B6B',
        'light-button': '#C83A4A',
        'light-accent-secondary': '#F2A7B8',
        'light-accent-tertiary': '#F4E8EC',
        
        // Dark mode colors — Temple Night
        'dark-bg': '#141417',
        'dark-headline': '#F2F2F2',
        'dark-paragraph': '#B9B9C0',
        'dark-button': '#D14A5A',
        'dark-accent-secondary': '#C97A8B',
        'dark-accent-tertiary': '#1E1E24',
        
        // Semantic color names
        'primary': '#C83A4A', // Light mode primary (shrine red)
        'primary-dark': '#D14A5A', // Dark mode primary (lantern red)
        'secondary': '#F2A7B8', // Secondary (sakura pink)
        'success': '#C97A8B', // Accent/success (night sakura)
      },
    },
  },
  plugins: [],
}
