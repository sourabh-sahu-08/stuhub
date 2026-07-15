const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'frontend', 'src', 'pages', 'LoginPage.tsx');

let content = fs.readFileSync(targetFile, 'utf8');

// Replace background slates with black and very dark grays
content = content.replace(/bg-slate-950/g, 'bg-black');
content = content.replace(/bg-slate-900/g, 'bg-[#0a0a0a]');
content = content.replace(/bg-slate-800/g, 'bg-[#111111]');

// Replace text slates with neutral zinc
content = content.replace(/text-slate-200/g, 'text-zinc-200');
content = content.replace(/text-slate-300/g, 'text-zinc-300');
content = content.replace(/text-slate-400/g, 'text-zinc-400');
content = content.replace(/text-slate-500/g, 'text-zinc-500');

// Replace border colors
content = content.replace(/border-white\/5/g, 'border-[#272727]');
content = content.replace(/border-white\/10/g, 'border-[#333333]');
content = content.replace(/border-white\/15/g, 'border-[#444444]');

fs.writeFileSync(targetFile, content, 'utf8');

console.log('LoginPage.tsx theme updated successfully!');
