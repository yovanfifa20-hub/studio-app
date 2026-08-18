import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14110f",
        surface: "#1e1a17",
        surface2: "#26211d",
        line: "#372f28",
        ink: "#ede6dd",
        muted: "#948a7e",
        accent: "#b0361f",
        ok: "#6a8f6b",
        warn: "#c99a3a",
      },
    },
  },
  plugins: [],
};
export default config;
