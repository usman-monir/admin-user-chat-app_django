/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*/templates/*/*.html',
    './*/templates/*/*/*.html',
    './*/templates/*/*/*/*.html',
    './static/js/*.js',
    './*/*.py',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

