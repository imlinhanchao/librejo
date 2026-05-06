/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
    './renderer/**/*.{vue,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
    darkTheme: 'dark',
  },
}
