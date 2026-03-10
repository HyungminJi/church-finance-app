import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'seoji.iptime.org',
  port: 5432,
  user: 'ledgeradmin',
  password: 'wlgudals1!',
  database: 'ledgerrection',
});

async function checkTable() {
  try {
    await client.connect();
    console.log('Checking accounts table in ledgerrection...');
    const res = await client.query('SELECT count(*) FROM accounts');
    console.log('Row count in accounts:', res.rows[0].count);
    
    if (res.rows[0].count > 0) {
      const data = await client.query('SELECT * FROM accounts LIMIT 1');
      console.log('Sample row:', data.rows[0]);
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTable();
