// Optional PostCSS configuration for applications that need it.
// This config includes `postcss-preset-env` to transpile modern CSS
// for older browsers and `autoprefixer` to add vendor prefixes.
export const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      stage: 2,
      features: {
        // Enable fallbacks for CSS gap in flexbox and logical properties
        "gap-properties": true,
        "logical-properties-and-values": true
      }
    },
    autoprefixer: {
      // Consumers should set a browserslist; this adds broad support including IE11 when requested
      overrideBrowserslist: ["defaults", "ie 11"]
    }
  },
};
