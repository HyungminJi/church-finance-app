import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'seoji.iptime.org',
  port: 5432,
  user: 'ledgeradmin',
  password: 'wlgudals1!',
  database: 'postgres',
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to postgres database.');
    const res = await client.query('SELECT current_database() as dbname');
    console.log('Connected DB name:', res.rows[0].dbname);
    await client.end();
  } catch (err) {
    console.error('Connection failed with postgres, trying ledgeradmin...', err.message);
    // 다시 시도
    const client2 = new Client({
      host: 'seoji.iptime.org',
      port: 5432,
      user: 'ledgeradmin',
      password: 'wlgudals1!',
      database: 'ledgeradmin',
    });
    try {
      await client2.connect();
      console.log('Successfully connected to ledgeradmin database.');
      await client2.end();
    } catch (err2) {
      console.error('Final connection attempt failed:', err2.message);
    }
  }
}

testConnection();
