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
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca"
        }
      },
      boxShadow: {
        soft: "0 16px 50px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
