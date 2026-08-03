const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Find <Button ...> and <button ...> that do not have onClick, type="submit"
      const buttonRegex = /<(Button|button)\b([^>]*?)>/g;
      
      content = content.replace(buttonRegex, (match, tag, attrs) => {
        // if it already has onClick or type="submit", skip
        if (attrs.includes('onClick=') || attrs.includes('type="submit"')) {
          return match;
        }
        
        changed = true;
        return `<${tag} onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })} ${attrs}>`;
      });

      if (changed) {
        // Ensure toast is imported
        if (!content.includes("import toast")) {
          if (!content.includes("import { toast }")) {
            content = "import toast from 'react-hot-toast';\n" + content;
          }
        }
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src/pages'));
