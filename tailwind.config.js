/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        aura: { light: '#3B82F6', mid: '#0F172A', dark: '#020617' },
        elixir: { light: '#FDE68A', mid: '#D4A017', dark: '#2D1B0E' },
        verdant: { light: '#86EFAC', mid: '#14532D', dark: '#02110A' },
        rose: { light: '#F9A8D4', mid: '#EC4899', dark: '#4A044E' },
        crimson: { light: '#F87171', mid: '#991B1B', dark: '#250808' },
      },
    },
  },
  plugins: [],
}
