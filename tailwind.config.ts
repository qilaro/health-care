import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#DB3924",
          dark: "#B52D1A",
          light: "#E85A42",
        },
        navy: {
          DEFAULT: "#1A2B4A",
          light: "#2C3E6B",
        },
        cream: "#FFF9F7",
      },
      fontFamily: {
        sans: ["Georgia", "serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
