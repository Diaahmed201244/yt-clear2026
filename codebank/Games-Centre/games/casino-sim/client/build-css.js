const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');

// Read the input CSS file
const css = fs.readFileSync('src/index.css', 'utf8');

// Process the CSS with PostCSS
postcss([
  tailwindcss,
  autoprefixer,
])
  .process(css, {
    from: 'src/index.css',
    to: 'dist/output.css',
  })
  .then((result) => {
    fs.writeFileSync('dist/output.css', result.css);
    console.log('CSS built successfully!');
  })
  .catch((error) => {
    console.error('Error processing CSS:', error);
  });
