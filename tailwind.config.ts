import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#C4948E',
          light: '#D8B5B0',
          pale: '#F0E5E3',
          deep: '#A87872',
        },
        beige: {
          DEFAULT: '#E6DDD1',
          deep: '#CEC3B3',
        },
        cream: '#FAF8F3',
        oak: '#7B4E2D',
        sand: '#B8A89A',
        textMain: '#2A1F17',
        textLight: '#5A4535',
        textMuted: '#9A8878',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
