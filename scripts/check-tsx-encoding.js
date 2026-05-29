const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(full);
  }
  return out;
}

const root = path.join(__dirname, '..', 'src');
const bad = [];

for (const file of walk(root)) {
  const b = fs.readFileSync(file);
  const utf16 = b.length > 3 && b[0] !== 0 && b[1] === 0;
  const bom = b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf;
  const utf16Bom = b[0] === 0xff && b[1] === 0xfe;
  if (utf16 || bom || utf16Bom) {
    bad.push({
      file: path.relative(path.join(__dirname, '..'), file),
      first: [...b.slice(0, 6)].map((x) => x.toString(16)).join(' '),
    });
  }
}

if (bad.length === 0) {
  console.log('All src TS/TSX files are UTF-8 without UTF-16/BOM issues.');
} else {
  console.log('Still bad:', bad);
}
