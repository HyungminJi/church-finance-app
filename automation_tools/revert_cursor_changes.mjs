import fs from 'fs';
import path from 'path';

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.vue')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. class 속성 내의 cursor-pointer 제거 (앞뒤 공백 처리)
    content = content.replace(/class="cursor-pointer\s+/g, 'class="');
    content = content.replace(/class="([^"]*)\scursor-pointer"/g, 'class="$1"');
    content = content.replace(/class="cursor-pointer"/g, ''); // 단독 속성인 경우 제거

    // 2. 만약 class="" 가 남았다면 제거
    content = content.replace(/\sclass=""/g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Reverted: ${filePath}`);
    }
}

processDirectory('app');
console.log('Cursor-pointer changes have been reverted to restore stability.');
