const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let hasError = false;

walkDir('c:/Users/jnsid/Downloads/CampusOne/js', function(filePath) {
  if (filePath.endsWith('.js')) {
    try {
      execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
    } catch (e) {
      console.error(`Syntax Error in ${filePath}:`);
      console.error(e.stderr.toString());
      hasError = true;
    }
  }
});

if (!hasError) {
  console.log('All frontend JS files passed syntax validation.');
}
