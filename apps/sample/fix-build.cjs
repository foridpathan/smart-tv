const fs = require('fs');
const path = require('path');

// Fix the generated HTML for older browser compatibility
const htmlFile = path.join(__dirname, 'dist/index.html');
let html = fs.readFileSync(htmlFile, 'utf8');

// Remove type="module" and crossorigin for compatibility
html = html.replace('type="module" crossorigin', '');
html = html.replace('type="module"', '');

// Fix asset paths - make them relative instead of absolute
html = html.replace(/src="\/assets\//g, 'src="./assets/');
html = html.replace(/href="\/assets\//g, 'href="./assets/');

// Move script tag from head to bottom of body for proper DOM loading
const scriptMatch = html.match(/<script[^>]*src="[^"]*"[^>]*><\/script>/);
if (scriptMatch) {
  const scriptTag = scriptMatch[0];
  // Remove script from head
  html = html.replace(scriptTag, '');
  // Add script before closing body tag
  html = html.replace('</body>', `    ${scriptTag}\n  </body>`);
}

fs.writeFileSync(htmlFile, html);
console.log('HTML file fixed for older browser compatibility, relative paths, and proper script placement');
