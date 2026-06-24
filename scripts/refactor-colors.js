const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/dashboard/**/*.tsx').concat(glob.sync('components/layout/dashboard/**/*.tsx'));

const colorPrefixes = ['violet', 'indigo', 'rose', 'sky', 'emerald', 'fuchsia', 'cyan', 'teal', 'lime', 'purple', 'pink', 'orange', 'blue', 'green'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  colorPrefixes.forEach(color => {
    // text
    content = content.replace(new RegExp(`\\btext-${color}-(700|800|900|950)\\b`, 'g'), 'text-primary');
    content = content.replace(new RegExp(`\\btext-${color}-(500|600)\\b`, 'g'), 'text-primary/80');
    content = content.replace(new RegExp(`\\btext-${color}-(300|400)\\b`, 'g'), 'text-primary/60');
    content = content.replace(new RegExp(`\\btext-${color}-(50|100|200)\\b`, 'g'), 'text-primary/40');

    // bg
    content = content.replace(new RegExp(`\\bbg-${color}-(50|100)\\b`, 'g'), 'bg-primary/10');
    content = content.replace(new RegExp(`\\bbg-${color}-(200|300)\\b`, 'g'), 'bg-primary/20');
    content = content.replace(new RegExp(`\\bbg-${color}-(400|500)\\b`, 'g'), 'bg-primary');
    content = content.replace(new RegExp(`\\bbg-${color}-(600|700|800|900|950)\\b`, 'g'), 'bg-primary');

    // border
    content = content.replace(new RegExp(`\\bborder-${color}-(50|100|200)\\b`, 'g'), 'border-primary/20');
    content = content.replace(new RegExp(`\\bborder-${color}-(300|400|500)\\b`, 'g'), 'border-primary/40');
    content = content.replace(new RegExp(`\\bborder-${color}-(600|700|800|900|950)\\b`, 'g'), 'border-primary/60');

    // from
    content = content.replace(new RegExp(`\\bfrom-${color}-(50|100|200)\\b`, 'g'), 'from-primary/10');
    content = content.replace(new RegExp(`\\bfrom-${color}-(300|400)\\b`, 'g'), 'from-primary/40');
    content = content.replace(new RegExp(`\\bfrom-${color}-(500|600|700|800|900|950)\\b`, 'g'), 'from-primary');

    // via
    content = content.replace(new RegExp(`\\bvia-${color}-(50|100|200)\\b`, 'g'), 'via-primary/10');
    content = content.replace(new RegExp(`\\bvia-${color}-(300|400)\\b`, 'g'), 'via-primary/40');
    content = content.replace(new RegExp(`\\bvia-${color}-(500|600|700|800|900|950)\\b`, 'g'), 'via-primary');

    // to
    content = content.replace(new RegExp(`\\bto-${color}-(50|100|200)\\b`, 'g'), 'to-primary/10');
    content = content.replace(new RegExp(`\\bto-${color}-(300|400)\\b`, 'g'), 'to-primary/40');
    content = content.replace(new RegExp(`\\bto-${color}-(500|600|700|800|900|950)\\b`, 'g'), 'to-primary');

    // ring
    content = content.replace(new RegExp(`\\bring-${color}-\\d+\\b`, 'g'), 'ring-primary/50');
    
    // fill
    content = content.replace(new RegExp(`\\bfill-${color}-\\d+\\b`, 'g'), 'fill-primary');
    
    // stroke
    content = content.replace(new RegExp(`\\bstroke-${color}-\\d+\\b`, 'g'), 'stroke-primary');
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
