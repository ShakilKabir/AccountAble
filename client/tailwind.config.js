/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'custom-bg': '#F9F4F1',
      }
    },
  },
  plugins: [],
}
