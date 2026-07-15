const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src');
const ignoreFolders = ['stitch-ui'];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (ignoreFolders.includes(file)) {
        console.log(`Ignoring directory: ${fullPath}`);
        continue;
      }
      walkAndReplace(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Backgrounds
      content = content.replace(/bg-\[\#09090B\]/gi, 'bg-background'); // or bg-[#000000] but tailwind config has background: '#000000'
      content = content.replace(/bg-\[\#0F0F12\]/gi, 'bg-surface');
      content = content.replace(/bg-\[\#16161A\]/gi, 'bg-surface-container');
      content = content.replace(/bg-\[\#1C1C21\]/gi, 'bg-surface-container-high');
      
      // Borders
      content = content.replace(/border-\[\#27272D\]/gi, 'border-outline');
      content = content.replace(/border-white\/5/gi, 'border-outline');
      content = content.replace(/border-white\/10/gi, 'border-outline-variant');
      
      // Texts
      content = content.replace(/text-\[\#FAFAFA\]/gi, 'text-zinc-50');
      content = content.replace(/text-\[\#E2E2E2\]/gi, 'text-zinc-200');
      content = content.replace(/text-\[\#A1A1AA\]/gi, 'text-zinc-400');
      content = content.replace(/text-\[\#A3A3A3\]/gi, 'text-zinc-400');
      content = content.replace(/text-\[\#71717A\]/gi, 'text-zinc-500');

      // Remaining slates
      content = content.replace(/bg-slate-950/g, 'bg-black');
      content = content.replace(/bg-slate-900/g, 'bg-[#0a0a0a]');
      content = content.replace(/bg-slate-800/g, 'bg-[#111111]');
      content = content.replace(/bg-slate-[0-9]{3}\/[0-9]{1,2}/g, match => match.replace('slate', 'zinc')); // catch things like bg-slate-900/10

      content = content.replace(/text-slate-[0-9]{3}/g, match => match.replace('slate', 'zinc'));
      content = content.replace(/border-slate-[0-9]{3}/g, match => match.replace('slate', 'zinc'));
      content = content.replace(/from-slate-[0-9]{3}/g, match => match.replace('slate', 'zinc'));
      content = content.replace(/via-slate-[0-9]{3}/g, match => match.replace('slate', 'zinc'));
      content = content.replace(/to-slate-[0-9]{3}/g, match => match.replace('slate', 'zinc'));

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

walkAndReplace(directoryPath);
console.log('Global theme update completed!');
