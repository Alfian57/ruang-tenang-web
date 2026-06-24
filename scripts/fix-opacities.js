const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/dashboard/**/*.tsx').concat(glob.sync('components/layout/dashboard/**/*.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // e.g. bg-primary/10/50 -> bg-primary/5
  // border-primary/20/50 -> border-primary/10
  // bg-primary/10/60 -> bg-primary/10
  
  content = content.replace(/(primary|accent|secondary)\/(\d+)\/(\d+)/g, (match, color, first, second) => {
    return `${color}/${first}`; // Just strip the second one, keep the first opacity
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Fixed opacities in ${file}`);
  }
});
