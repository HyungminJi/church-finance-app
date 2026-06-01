import fs from 'fs';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: 'admin', password: 'admin123!' })
    });
    
    const cookie = loginRes.headers.get('set-cookie');
    
    const campaignsRes = await fetch('http://localhost:3000/api/pledges/campaigns', {
      headers: { 'cookie': cookie }
    });
    const campaigns = await campaignsRes.json();
    console.log('Campaigns:', campaigns.data.map(c => ({ id: c.id, name: c.name, total_collected: c.total_collected, account_code: c.account_code })));
    
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
