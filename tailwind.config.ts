import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tailwind's gray-950 ships in v3.3+; add as explicit fallback
        gray: {
          950: '#030712',
        },
      },
    },
  },
  plugins: [],
}
export default config
