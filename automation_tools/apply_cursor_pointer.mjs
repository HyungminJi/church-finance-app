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

    // HTML 태그를 정규식으로 매칭하여 속성 분석
    content = content.replace(/<([a-zA-Z0-9-]+)([^>]+)>/g, (match, tag, attrs) => {
        const lowerTag = tag.toLowerCase();
        // 버튼, NuxtLink, 또는 @click 이벤트가 있는 요소 필터링
        const isClickable = lowerTag === 'button' || lowerTag === 'nuxtlink' || attrs.includes('@click');
        
        if (isClickable) {
            // 이미 cursor-pointer가 있거나, disabled 상태인 경우는 건너뜀
            if (attrs.includes('cursor-pointer') || attrs.includes('cursor-not-allowed')) {
                return match;
            }
            
            // 클래스 속성이 있는 경우
            if (attrs.includes('class="')) {
                return match.replace(/class="([^"]*)"/, 'class="cursor-pointer $1"');
            } else if (attrs.includes("class='")) {
                 return match.replace(/class='([^']*)'/, "class='cursor-pointer $1'");
            } 
            // 클래스 속성이 없는 경우
            else {
                return `<${tag} class="cursor-pointer"${attrs}>`;
            }
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

processDirectory('app');
console.log('All clickable elements have been updated with cursor-pointer.');
