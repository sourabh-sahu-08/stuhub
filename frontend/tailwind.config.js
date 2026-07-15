/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      colors: {
        ink: "#000000",
        mist: "#f7f8fb",
        background: "#000000",
        surface: "#0a0a0a",
        "surface-dim": "#0a0a0a",
        "surface-bright": "#1a1a1a",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#0a0a0a",
        "surface-container": "#111111",
        "surface-container-high": "#1a1a1a",
        "surface-container-highest": "#222222",
        "on-surface": "#e2e2e2",
        "on-surface-variant": "#d7c3ae",
        "inverse-surface": "#e2e2e2",
        "inverse-on-surface": "#222222",
        outline: "#272727",
        "outline-variant": "#524434",
        "surface-tint": "#FF9000",
        primary: {
          DEFAULT: "#FF9000",
          container: "#FF9000",
          fixed: "#ffddb5",
          "fixed-dim": "#ffb957",
          "on-container": "#4a2a00"
        },
        secondary: {
          DEFAULT: "#c6c6cf",
          container: "#45464e",
          "on-container": "#b4b4bd"
        },
        tertiary: {
          DEFAULT: "#9ad9ff",
          container: "#36c2ff",
          "on-container": "#004d69"
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
          "on-container": "#ffdad6"
        },
        brand: {
          50: "#fff8f0",
          100: "#ffefd6",
          500: "#FF9000",
          600: "#e07d00",
          700: "#b36300"
        }
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
