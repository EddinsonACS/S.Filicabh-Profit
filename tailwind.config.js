/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D7879",
        secondary: "#2ad5c48f",
        background: "#F9F8FD"
      },
    },
  },
  plugins: [],
}