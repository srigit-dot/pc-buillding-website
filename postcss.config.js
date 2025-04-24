// postcss.config.js
module.exports = {
    plugins: {
      // ← this is the new entrypoint!
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  }
  