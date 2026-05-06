/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#020617",
        cyanGlow: "#06b6d4",
        slateGlass: "rgba(15, 23, 42, 0.7)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(6, 182, 212, 0.18)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(34, 211, 238, 0.16), transparent 30%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 25%), linear-gradient(160deg, #020617, #0f172a 40%, #111827)",
      },
    },
  },
  plugins: [],
};
