/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#13315C",
          accent: "#FFD166",
          soft: "#E9F1FF"
        }
      },
      fontFamily: {
        display: ["'Avenir Next'", "system-ui", "sans-serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
};
