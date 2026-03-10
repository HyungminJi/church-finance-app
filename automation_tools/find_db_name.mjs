import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'seoji.iptime.org',
  port: 5432,
  user: 'ledgeradmin',
  password: 'wlgudals1!',
  database: 'postgres',
});

async function findDatabase() {
  try {
    await client.connect();
    console.log('Listing all databases...');
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('Available databases:', res.rows.map(r => r.datname));
    await client.end();
  } catch (err) {
    console.error('Failed to list databases:', err.message);
  }
}

findDatabase();
