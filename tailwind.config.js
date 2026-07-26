/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "surface-container": "#e6eff8",
        "surface-container-low": "#ecf5fe",
        "primary": "#0035c5",
        "on-primary": "#ffffff",
        "on-surface": "#141d23",
        "on-surface-variant": "#434657",
        "surface-variant": "#dbe4ed",
        "error": "#ba1a1a",
      },
      spacing: {
        "margin-desktop": "48px",
        "margin-mobile": "16px",
        "container-max": "1280px",
        "gutter": "24px",
      },
      fontFamily: {
        "body-md": ["Inter"],
      },
    },
  },
  plugins: [],
}