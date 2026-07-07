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
        ink: "#0f172a",
        mist: "#f7f8fb",
        background: "#09090B",
        surface: "#121414",
        "surface-dim": "#121414",
        "surface-bright": "#38393a",
        "surface-container-lowest": "#0c0f0f",
        "surface-container-low": "#1a1c1c",
        "surface-container": "#1e2020",
        "surface-container-high": "#282a2b",
        "surface-container-highest": "#333535",
        "on-surface": "#e2e2e2",
        "on-surface-variant": "#d7c3ae",
        "inverse-surface": "#e2e2e2",
        "inverse-on-surface": "#2f3131",
        outline: "#27272D",
        "outline-variant": "#524434",
        "surface-tint": "#ffb957",
        primary: {
          DEFAULT: "#F5A524",
          container: "#F5A524",
          fixed: "#ffddb5",
          "fixed-dim": "#ffb957",
          "on-container": "#643f00"
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
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#F5A524",
          600: "#e0931f",
          700: "#cc8218"
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
