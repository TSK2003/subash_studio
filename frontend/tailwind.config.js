/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F8F5EF",
        "bg-soft": "#FBF8F2",
        "bg-cream": "#F4EFE6",
        card: "#FFFFFF",
        ink: "#2B2B2B",
        "ink-soft": "#6B7280",
        gold: {
          DEFAULT: "#C9A669",
          light: "#E4D3A6",
          dark: "#9C7B3D",
        },
        champagne: "#D8C3A5",
        "warm-beige": "#E7D8C5",
        line: "#E7E0D2",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.32em",
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(43,43,43,0.18)",
        card: "0 10px 40px -15px rgba(43,43,43,0.14)",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.65,0,0.35,1)",
      },
    },
  },
  plugins: [],
};
