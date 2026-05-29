import fs from 'fs';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: 'admin', password: 'admin123!' })
    });
    const cookie = loginRes.headers.get('set-cookie');
    
    const pageRes = await fetch('http://localhost:3000/', {
      headers: { 'cookie': cookie }
    });
    
    console.log('Page status:', pageRes.status);
    const html = await pageRes.text();
    if (pageRes.status === 500) {
       console.log('Error snippet:', html.substring(0, 1000));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
