module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],  // ← This line is REQUIRED
  theme: {
    extend: {
      colors: {
        primary: '#125f43',
        'primary-dark': '#0d4a35',
        'primary-light': '#1a7f5a',
      },
    },
  },
  plugins: [],
}