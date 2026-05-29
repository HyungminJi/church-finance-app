import { readFileSync } from 'fs';

async function run() {
  const env = readFileSync('.env', 'utf-8');
  const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL='))?.split('=')[1];
  
  // 직접 DB 조회를 하기엔 번거로우니 API를 호출해봅니다.
  // 실제 세션 쿠키가 필요하므로, 로그인 API를 먼저 거칩니다.
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login_id: 'admin', password: 'admin123!' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  
  const churchRes = await fetch('http://localhost:3000/api/churches/current', {
    headers: { 'cookie': cookie }
  });
  const data = await churchRes.json();
  console.log('Current Church Data:', JSON.stringify(data, null, 2));
}

run();
