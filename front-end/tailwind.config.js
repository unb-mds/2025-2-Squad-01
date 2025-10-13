/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Definindo a fonte diretamente
        'didot': ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}