const postcss = require('postcss');

const removeCssVariables = () => {
  return {
    postcssPlugin: 'transform-css-variables-for-chrome30',
    Once(root) {
      // Map of CSS variables to their fallback values
      const variableMap = {
        '--tw-border-spacing-x': '0',
        '--tw-border-spacing-y': '0',
        '--tw-translate-x': '0',
        '--tw-translate-y': '0',
        '--tw-rotate': '0deg',
        '--tw-skew-x': '0deg',
        '--tw-skew-y': '0deg',
        '--tw-scale-x': '1',
        '--tw-scale-y': '1',
        '--tw-pan-x': '',
        '--tw-pan-y': '',
        '--tw-pinch-zoom': '',
        '--tw-scroll-snap-strictness': 'proximity',
        '--tw-gradient-from-position': '',
        '--tw-gradient-via-position': '',
        '--tw-gradient-to-position': '',
        '--tw-ordinal': '',
        '--tw-slashed-zero': '',
        '--tw-numeric-figure': '',
        '--tw-numeric-spacing': '',
        '--tw-numeric-fraction': '',
        '--tw-ring-inset': '',
        '--tw-ring-offset-width': '0px',
        '--tw-ring-offset-color': '#fff',
        '--tw-ring-color': 'rgba(59, 130, 246, 0.5)',
        '--tw-ring-offset-shadow': '0 0 transparent',
        '--tw-ring-shadow': '0 0 transparent',
        '--tw-shadow': '0 0 transparent',
        '--tw-shadow-colored': '0 0 transparent',
        '--tw-blur': '',
        '--tw-brightness': '',
        '--tw-contrast': '',
        '--tw-grayscale': '',
        '--tw-hue-rotate': '',
        '--tw-invert': '',
        '--tw-saturate': '',
        '--tw-sepia': '',
        '--tw-drop-shadow': '',
        '--tw-backdrop-blur': '',
        '--tw-backdrop-brightness': '',
        '--tw-backdrop-contrast': '',
        '--tw-backdrop-grayscale': '',
        '--tw-backdrop-hue-rotate': '',
        '--tw-backdrop-invert': '',
        '--tw-backdrop-opacity': '',
        '--tw-backdrop-saturate': '',
        '--tw-backdrop-sepia': '',
        '--tw-contain-size': '',
        '--tw-contain-layout': '',
        '--tw-contain-paint': '',
        '--tw-contain-style': '',
      };

      // Replace var() usage with fallback values
      root.walkDecls(decl => {
        if (decl.value.includes('var(')) {
          let newValue = decl.value;
          
          // Replace each var() with its fallback value
          Object.entries(variableMap).forEach(([variable, fallback]) => {
            const varRegex = new RegExp(`var\\(${variable.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\)`, 'g');
            newValue = newValue.replace(varRegex, fallback);
          });
          
          // Handle transform functions specifically
          if (decl.prop === 'transform' || decl.prop === '-webkit-transform') {
            // Simplify transform functions for Chrome 30
            newValue = newValue
              .replace(/translate\(0,\s*0\)/g, 'translate(0, 0)')
              .replace(/rotate\(0deg\)/g, 'rotate(0deg)')
              .replace(/skewX\(0deg\)/g, 'skewX(0deg)')
              .replace(/skewY\(0deg\)/g, 'skewY(0deg)')
              .replace(/scaleX\(1\)/g, 'scaleX(1)')
              .replace(/scaleY\(1\)/g, 'scaleY(1)');
          }
          
          // Handle box-shadow and other shadow properties
          if (decl.prop.includes('shadow')) {
            newValue = newValue
              .replace(/0 0 transparent/g, '0 0 #0000')
              .replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/g, (match, r, g, b, a) => {
                // Convert rgba to older syntax for Chrome 30
                if (a === '1') return `rgb(${r}, ${g}, ${b})`;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
              });
          }
          
          // Only update if the value actually changed
          if (newValue !== decl.value) {
            decl.value = newValue;
          }
        }
      });

      // Remove CSS variable declarations but keep the selectors
      root.walkDecls(decl => {
        if (decl.prop.startsWith('--tw-')) {
          decl.remove();
        }
      });
      
      // Clean up empty rules but be more careful
      root.walkRules(rule => {
        if (rule.nodes.length === 0 && !rule.selector.includes('::before') && !rule.selector.includes('::after')) {
          rule.remove();
        }
      });
    },
  };
};

removeCssVariables.postcss = true;

module.exports = removeCssVariables;
