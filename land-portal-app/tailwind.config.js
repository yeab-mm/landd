/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        secondary: "#F9A825",
        accent: "#1565C0",
      },
    },
  },
  plugins: [],
};