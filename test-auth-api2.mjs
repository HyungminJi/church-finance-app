import fs from 'fs';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: 'admin', password: 'admin123!' })
    });
    const cookie = loginRes.headers.get('set-cookie');
    
    const churchRes = await fetch('http://localhost:3000/api/churches/current', {
      headers: { 'cookie': cookie }
    });
    
    if (!churchRes.ok) {
      console.log('Church API Error:', churchRes.status, await churchRes.text());
    } else {
      console.log('Church API Success:', await churchRes.json());
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
