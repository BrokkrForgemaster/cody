import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        panel: "#171717",
        "panel-light": "#252525",
        text: "#F8F8F8",
        muted: "#A3A3A3",
        accent: "#C1121F",
        "blue-accent": "#1E90FF",
        "cfg-orange": "#C1121F",
        "cfg-orange-dark": "#9f1020",
      },
      fontFamily: {
        heading: ["Bebas Neue", "Oswald", "Arial Narrow", "Impact", "sans-serif"],
        body: ["Inter", "Manrope", "Segoe UI", "Arial", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 45px rgba(193, 18, 31, 0.28)",
        "blue-glow": "0 0 45px rgba(30, 144, 255, 0.25)",
      },
      backgroundImage: {
        "radial-red": "radial-gradient(circle at center, rgba(193, 18, 31, 0.28), transparent 58%)",
        "radial-blue": "radial-gradient(circle at center, rgba(30, 144, 255, 0.24), transparent 58%)",
      },
    },
  },
  plugins: [],
};

export default config;
