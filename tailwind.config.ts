import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand primary — red #8A0909
        primary: {
          50:  "rgb(253 235 235)",
          100: "rgb(250 210 210)",
          200: "rgb(244 163 163)",
          300: "rgb(218 100 100)",
          400: "rgb(192 55 55)",
          500: "rgb(138 9 9)",
          600: "rgb(110 7 7)",
          700: "rgb(83 5 5)",
          800: "rgb(55 3 3)",
          900: "rgb(28 1 1)",
          DEFAULT: "rgb(138 9 9)",
        },
        // Brand secondary — dark red #540303
        secondary: {
          50:  "rgb(253 237 237)",
          100: "rgb(250 210 210)",
          200: "rgb(220 140 140)",
          300: "rgb(180 80 80)",
          400: "rgb(130 30 30)",
          500: "rgb(84 3 3)",
          600: "rgb(70 2 2)",
          700: "rgb(56 2 2)",
          800: "rgb(42 1 1)",
          900: "rgb(28 1 1)",
          DEFAULT: "rgb(84 3 3)",
        },
        // Brand tertiary — emerald #10B981
        tertiary: {
          50:  "rgb(236 253 245)",
          100: "rgb(209 250 229)",
          200: "rgb(167 243 208)",
          300: "rgb(110 231 183)",
          400: "rgb(52 211 153)",
          500: "rgb(16 185 129)",
          600: "rgb(5 150 105)",
          700: "rgb(4 120 87)",
          800: "rgb(6 95 70)",
          900: "rgb(6 78 59)",
          DEFAULT: "rgb(16 185 129)",
        },
        // Neutral — dark #1B1D1D
        neutral: {
          50:  "rgb(248 248 248)",
          100: "rgb(240 240 240)",
          200: "rgb(220 220 220)",
          300: "rgb(190 190 190)",
          400: "rgb(155 155 155)",
          500: "rgb(115 115 115)",
          600: "rgb(82 82 82)",
          700: "rgb(58 58 58)",
          800: "rgb(38 38 38)",
          900: "rgb(27 29 29)",
          DEFAULT: "rgb(27 29 29)",
        },
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        sans:    ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        DEFAULT: "10px",
        lg: "10px",
      },
      boxShadow: {
        card:       "0px 4px 4px 0px rgba(27,29,29,0.10)",
        "card-hover": "0px 6px 8px 0px rgba(27,29,29,0.16)",
      },
      spacing: {
        base: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
