import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

// Custom plugin to unwrap layers
function unwrapLayers() {
  return {
    postcssPlugin: 'unwrap-layers',
    AtRule: {
      layer(rule) {
        rule.replaceWith(rule.nodes) // flatten
      },
    },
  }
}
unwrapLayers.postcss = true

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    unwrapLayers(),
  ],
}