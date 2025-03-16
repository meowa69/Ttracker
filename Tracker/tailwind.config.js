/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Add Poppins as a custom font
      },

      animation: {
        pulse: "pulse 1.5s infinite",
      },
      keyframes: {
        pulse: {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};