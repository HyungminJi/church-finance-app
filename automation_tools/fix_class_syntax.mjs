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

    // 1. :class="cursor-pointer ... " 패턴 수정
    // :class="cursor-pointer (나머지)" 를 :class="(나머지)" 로 바꾸고 앞에 class="cursor-pointer" 추가
    content = content.replace(/:class="cursor-pointer\s+([^"]+)"/g, 'class="cursor-pointer" :class="$1"');

    // 2. 이미 class 속성이 있는 경우 중복 처리 방지하며 수정
    // class="abc" :class="cursor-pointer def" -> class="cursor-pointer abc" :class="def"
    content = content.replace(/class="([^"]*)"\s+:class="cursor-pointer\s+([^"]+)"/g, 'class="cursor-pointer $1" :class="$2"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed: ${filePath}`);
    }
}

processDirectory('app');
console.log('Class syntax errors have been fixed.');
