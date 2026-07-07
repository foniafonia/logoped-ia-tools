/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        papel: '#FBF4E2',
        crema: '#FFFBF0',
        tinta: '#3B3024',
        sol: '#F7B32B',
        cereza: '#E4572E',
        hierba: '#5F9E3E',
        cielo: '#3E7CB1',
        calabaza: '#E8891D',
      },
      fontFamily: {
        hand: ['"Patrick Hand"', 'cursive'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        crayon: '0 4px 0 rgba(59, 48, 36, 0.15)',
        lift: '0 10px 24px -8px rgba(59, 48, 36, 0.3)',
      },
    },
  },
  plugins: [],
};
