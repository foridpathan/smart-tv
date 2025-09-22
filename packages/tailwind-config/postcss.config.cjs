module.exports = {
  // Use the plugin-name: options form to avoid ESM/CJS interop issues when
  // postcss-loader (which may `require()` this file) loads plugins.
  plugins: {
    'postcss-import': {},
  // Use the official PostCSS adapter package for Tailwind. This keeps the
  // PostCSS plugin boundary stable across Tailwind releases and module types.
  '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'gap-properties': true,
        'logical-properties-and-values': true,
      },
    },
    autoprefixer: { overrideBrowserslist: ['defaults', 'ie 11'] },
  },
};
