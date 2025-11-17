const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (
        !filePath.includes('node_modules') &&
        !filePath.includes('dist') &&
        !filePath.includes('.git')
      ) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      if (
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.d.ts')
      ) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function removeComments(content) {
  let inString = false;
  let stringChar = null;
  let i = 0;
  let output = '';

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    const prevChar = i > 0 ? content[i - 1] : null;

    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
      output += char;
      i++;
      continue;
    }

    if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
      output += char;
      i++;
      continue;
    }

    if (inString) {
      output += char;
      i++;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      while (i < content.length && content[i] !== '\n') {
        i++;
      }
      if (i < content.length && content[i] === '\n') {
        output += '\n';
        i++;
      }
      continue;
    }

    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < content.length) {
        if (content[i] === '*' && content[i + 1] === '/') {
          i += 2;
          if (i < content.length && content[i] === '\n') {
            output += '\n';
            i++;
          }
          break;
        }
        i++;
      }
      continue;
    }

    output += char;
    i++;
  }

  return output.replace(/\n{3,}/g, '\n\n');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = removeComments(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Đã xóa comment trong: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Lỗi khi xử lý ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const rootDir = process.cwd();
  const beDir = path.join(rootDir, 'be', 'src');
  const feDir = path.join(rootDir, 'qlda-fe', 'src');

  const allFiles = [];

  if (fs.existsSync(beDir)) {
    const beFiles = getAllFiles(beDir);
    allFiles.push(...beFiles);
  }

  if (fs.existsSync(feDir)) {
    const feFiles = getAllFiles(feDir);
    allFiles.push(...feFiles);
  }

  console.log(`Tìm thấy ${allFiles.length} file để xử lý...\n`);

  let processed = 0;
  for (const file of allFiles) {
    if (processFile(file)) {
      processed++;
    }
  }

  console.log(`\nHoàn thành! Đã xử lý ${processed} file.`);
}

main();

