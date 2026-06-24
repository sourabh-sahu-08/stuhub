/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        ink: "#0f172a",
        mist: "#f7f8fb",
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#3478f6",
          600: "#245fd5",
          700: "#1d4cad"
        }
      },
      boxShadow: {
        soft: "0 16px 50px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
