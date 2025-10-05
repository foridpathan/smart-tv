// Simple plugin to add Chrome 30 fallbacks
const chrome30Fallbacks = () => ({
  postcssPlugin: 'chrome30-fallbacks',
  Once(root) {
    root.walkDecls(decl => {
      // Add fallbacks for rgba colors with modern syntax
      if (decl.value.includes('rgb(') && decl.value.includes(' / ')) {
        const oldValue = decl.value;
        const newValue = oldValue.replace(/rgb\((\d+\s+\d+\s+\d+)\s*\/\s*([0-9.]+)\)/g, 'rgba($1, $2)');
        if (newValue !== oldValue) {
          decl.cloneBefore({ value: newValue });
        }
      }
    });
  },
});
chrome30Fallbacks.postcss = true;

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-flexbugs-fixes'),
    require('postcss-calc'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009',
        grid: false,
      },
      stage: 2, // More conservative stage
      features: {
        'custom-properties': {
          preserve: true, // Keep CSS variables but add fallbacks
          fallbacks: true,
        },
        'nesting-rules': false,
        'focus-visible-pseudo-class': false,
        'custom-selectors': false,
        'media-query-ranges': false,
        'logical-properties-and-values': false,
        'dir-pseudo-class': false,
        'any-link-pseudo-class': false,
        'color-functional-notation': true, // Transform modern color syntax
        'double-position-gradients': false,
        'place-properties': false,
        'not-pseudo-class': false,
      },
      browsers: [
        'Chrome >= 30',
        'Firefox >= 31',
        'Safari >= 7',
        'Edge >= 12',
        'IE >= 10',
        'iOS >= 7',
        'Android >= 4.1',
      ],
    }),
    chrome30Fallbacks,
  ],
};
