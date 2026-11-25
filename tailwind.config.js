export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--c-bg, #1d1226)',
        paper: 'var(--c-paper, #f4e4dc)',
        ink: 'var(--c-ink, #3a1c2e)',
        berry: 'var(--c-berry, #c2255c)',
        gold: 'var(--c-gold, #d9a441)'
      },
      fontFamily: { display: ['Fraunces', 'serif'], sans: ['Nunito', 'sans-serif'] }
    }
  },
  plugins: []
}