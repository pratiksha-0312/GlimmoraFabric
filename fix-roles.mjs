import fs from 'fs';
import path from 'path';

const REPLACEMENTS = {
  '"platform_engineer"': '"platform_engineering_lead"',
  "'platform_engineer'": "'platform_engineering_lead'",
  '`platform_engineer`': '`platform_engineering_lead`',
  
  '"product_manager"': '"product_lead"',
  "'product_manager'": "'product_lead'",
  '`product_manager`': '`product_lead`',
  
  '"governance_admin"': '"cto"',
  "'governance_admin'": "'cto'",
  '`governance_admin`': '`cto`'
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir('./src');
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [oldStr, newStr] of Object.entries(REPLACEMENTS)) {
    if (content.includes(oldStr)) {
      content = content.replaceAll(oldStr, newStr);
      changed = true;
    }
  }
  
  if (content.includes('role: "product_manager"')) {
     content = content.replaceAll('role: "product_manager"', 'role: "product_lead"');
     changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Updated ${changedCount} files.`);
