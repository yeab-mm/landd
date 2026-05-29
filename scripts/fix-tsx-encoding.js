const fs = require('fs');
const path = require('path');

function isUtf16Le(buf) {
  if (buf.length < 4) return false;
  if (buf[0] === 0xff && buf[1] === 0xfe) return true;
  // UTF-16 LE without BOM: ASCII chars followed by null bytes
  return buf[0] !== 0 && buf[1] === 0 && buf[2] !== 0 && buf[3] === 0;
}

function hasUtf8Bom(buf) {
  return buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function decode(buf) {
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString('utf16le').slice(1);
  }
  if (isUtf16Le(buf)) {
    return buf.toString('utf16le');
  }
  let text = buf.toString('utf8');
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  return text;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(full);
  }
  return out;
}

const root = path.join(__dirname, '..', 'src');
const files = walk(root);
const fixed = [];

for (const file of files) {
  const buf = fs.readFileSync(file);
  const bad = isUtf16Le(buf) || hasUtf8Bom(buf);
  if (!bad) continue;

  const text = decode(buf);
  fs.writeFileSync(file, text, { encoding: 'utf8' });
  fixed.push(path.relative(path.join(__dirname, '..'), file));
}

console.log(`Fixed ${fixed.length} file(s):`);
fixed.forEach((f) => console.log('  -', f));
