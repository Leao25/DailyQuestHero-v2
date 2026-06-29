import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
      },
      colors: {
        hp: '#e74c3c',
        xp: '#2ecc71',
        gold: '#f0c040',
      },
    },
  },
  plugins: [],
} satisfies Config
