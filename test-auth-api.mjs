import fs from 'fs';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: 'admin', password: 'admin123!' })
    });
    
    const cookie = loginRes.headers.get('set-cookie');
    if (!cookie) {
      console.log('Login failed, no cookie:', await loginRes.text());
      return;
    }
    
    console.log('Logged in successfully');
    
    const summaryRes = await fetch('http://localhost:3000/api/dashboard/summary', {
      headers: { 'cookie': cookie }
    });
    
    if (!summaryRes.ok) {
      console.log('Summary API Error:', summaryRes.status, await summaryRes.text());
      return;
    }
    
    const data = await summaryRes.json();
    console.log('Summary API Success:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
