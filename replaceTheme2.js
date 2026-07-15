const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  path.join(__dirname, 'frontend', 'src', 'pages', 'LoginPage.tsx'),
  path.join(__dirname, 'frontend', 'src', 'components', 'ui', 'LoadingScreen.tsx'),
  path.join(__dirname, 'frontend', 'src', 'components', 'ui', 'Section.tsx'),
  path.join(__dirname, 'frontend', 'src', 'components', 'ui', 'StatCard.tsx')
];

for (const targetFile of filesToUpdate) {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');

    // Replace slate with black/zinc equivalents
    content = content.replace(/slate-950/g, 'black');
    content = content.replace(/slate-900/g, '[#0a0a0a]');
    content = content.replace(/slate-800/g, '[#111111]');

    // Let text colors be zinc
    content = content.replace(/text-slate-200/g, 'text-zinc-200');
    content = content.replace(/text-slate-300/g, 'text-zinc-300');
    content = content.replace(/text-slate-400/g, 'text-zinc-400');
    content = content.replace(/text-slate-500/g, 'text-zinc-500');

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`${targetFile} updated!`);
  }
}
