import daisyui from "daisyui"

module.exports = {
  content: [
    './views/**/*.{html,js,css,hbs}',
    './public/css/vendor.css',
  ],
  plugins: [
    daisyui,
    require('@tailwindcss/forms'),
  ],
  daisyui: {
    themes: ["light", "dark", "business"]
  }
}

