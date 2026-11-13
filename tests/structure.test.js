// Structure + accessibility guards for the static portfolio.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

let failures = [];
function check(name, ok) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name);
  if (!ok) failures.push(name);
}

function lum(hex) {
  const [r, g, b] = hex.match(/\w\w/g)
    .map(h => parseInt(h, 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  return m && m[1];
}

check('sections exist', ['top', 'about', 'skills', 'projects', 'contact'].every(s => html.includes(`id="${s}"`)));
check('project sheet markup exists', html.includes('id="project-sheet"') && html.includes('id="sheet-back"') && html.includes('id="sheet-panel"'));
check('sheet fields exist', ['sheet-title', 'sheet-meta', 'sheet-brief', 'sheet-steps', 'sheet-facts', 'sheet-tools', 'sheet-outcome'].every(id => html.includes(`id="${id}"`)));
check('skills markup exists', html.includes('skill-list') && html.includes('skill-row'));
check('nav toggle js exists', js.includes('nav-toggle'));

// The project card is a role=button; a nested link would be an invalid, conflicting target.
const card = (html.match(/<article class="project-card"[\s\S]*?<\/article>/) || [''])[0];
check('project card is a single button target', card.includes('role="button"') && !card.includes('<a '));
check('page has a main landmark', html.includes('<main id="main">'));
check('project sheet js exists', js.includes('openProject') && js.includes('closeProject'));
check('sheet returns focus to opener', js.includes('opener.focus'));
check('sheet inerts the page behind it', js.includes('pageMain.inert = true') && js.includes('pageMain.inert = false'));
check('no stray console calls in js', !/console\.(log|warn|error)/.test(js));

// Fixed nav must not cover anchor targets.
check('anchor scroll offset for fixed nav', /scroll-padding-top:\s*\d+px/.test(css));
check('no unused template styles', !/sheet-gallery|sheet-hero/.test(css));
check('decorative grid background is present', html.includes('class="grid-bg"') && css.includes('.grid-bg'));
check('accent meets AA on background', contrast(token('accent'), token('bg')) >= 4.5);
check('muted meets AA on background', contrast(token('muted'), token('bg')) >= 4.5);

if (failures.length) { console.log(failures.length + ' failing'); process.exit(1); }
console.log('All structure checks pass');
