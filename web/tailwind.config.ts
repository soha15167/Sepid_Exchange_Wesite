module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf4",
          100: "#d6f5e4",
          200: "#b0ead0",
          300: "#7dd9b4",
          400: "#47c191",
          500: "#24a673",
          600: "#16855b",
          700: "#126a4a",
          800: "#11543d",
          900: "#0f4534",
        },
        ink: {
          950: "#0a0f0d",
          900: "#101816",
          800: "#1a2420",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.25)",
        glow: "0 0 40px rgba(36,166,115,0.15)",
      },
      backgroundImage: {
        mesh: "radial-gradient(at 40% 20%, rgba(36,166,115,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(16,133,91,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(71,193,145,0.12) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
