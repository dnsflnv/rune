/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#866c53',
        secondary: '#eed0a8',
        accent: '#df6446',
      },
    },
  },
  plugins: [],
}

