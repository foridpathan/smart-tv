const fs = require('fs');
const path = require('path');

// Fix the generated HTML for older browser compatibility
const htmlFile = path.join(__dirname, 'dist/index.html');
let html = fs.readFileSync(htmlFile, 'utf8');

// Remove type="module" and crossorigin for compatibility
html = html.replace('type="module" crossorigin', '');
html = html.replace('type="module"', '');

// Ensure CSS is loaded before JS
html = html.replace(
  /(<script[^>]*src="[^"]*"[^>]*><\/script>)/,
  '$1'
);

fs.writeFileSync(htmlFile, html);
console.log('HTML file fixed for older browser compatibility');
