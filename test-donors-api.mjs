import fs from 'fs';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: 'admin', password: 'admin123!' })
    });
    const cookie = loginRes.headers.get('set-cookie');
    
    const res = await fetch('http://localhost:3000/api/donors?type=MEMBER&page=1&limit=10', {
      headers: { 'cookie': cookie }
    });
    
    if (!res.ok) {
      console.log('API Error:', res.status, await res.text());
    } else {
      const data = await res.json();
      console.log('API Success, Data length:', data.data?.length);
      if (data.data?.length === 0) {
        console.log('Data is empty. Let us check the raw DB data.');
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
