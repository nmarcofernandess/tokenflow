import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              50: "#F0F9FF",
              100: "#E0F2FE",
              200: "#BAE6FD",
              300: "#7DD3FC",
              400: "#38BDF8",
              500: "#0EA5E9",
              600: "#0284C7",
              700: "#0369A1",
              800: "#075985",
              900: "#0C4A6E",
              DEFAULT: "#0EA5E9",
              foreground: "#FFFFFF",
            },
            focus: "#0EA5E9",
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              50: "#0C4A6E",
              100: "#075985",
              200: "#0369A1",
              300: "#0284C7",
              400: "#0EA5E9",
              500: "#38BDF8",
              600: "#7DD3FC",
              700: "#BAE6FD",
              800: "#E0F2FE",
              900: "#F0F9FF",
              DEFAULT: "#38BDF8",
              foreground: "#FFFFFF",
            },
            focus: "#38BDF8",
          },
        },
      },
    }),
  ],
}

export default config 