/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'player-',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // Use hex instead of CSS variables
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#6b7280',
          foreground: '#ffffff',
        },
        background: '#ffffff',
        foreground: '#111827',
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#6b7280',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#3b82f6',
      },
      borderRadius: {
        lg: '0.5rem', // Use fixed values instead of CSS variables
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  corePlugins: {
    // Disable CSS Grid utilities (not supported in Chrome 30)
    gridTemplateColumns: false,
    gridColumn: false,
    gridColumnStart: false,
    gridColumnEnd: false,
    gridTemplateRows: false,
    gridRow: false,
    gridRowStart: false,
    gridRowEnd: false,
    gap: false,
    columnGap: false,
    rowGap: false,
    // Disable CSS custom properties utilities (limited support in Chrome 30)
    // Keep flexbox as it's supported in Chrome 30 (with prefixes)
    flexDirection: true,
    flexWrap: true,
    flex: true,
    flexGrow: true,
    flexShrink: true,
    // Disable some advanced features not well supported in Chrome 30
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    // Keep basic transforms but disable 3D transforms for better compatibility
    transform: true,
    transformGpu: false,
  },
  plugins: [],
};
