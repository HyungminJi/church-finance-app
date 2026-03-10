import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const password_hash = await bcrypt.hash('admin123!', 10);
    console.log('Inserting test admin user...');
    
    // admin 계정이 이미 있는지 확인 후 없으면 삽입
    const existing = await client.query("SELECT id FROM users WHERE login_id = 'admin'");
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO users (login_id, password_hash, name, role, is_active)
        VALUES ('admin', $1, '관리자', 1, true)
      `, [password_hash]);
      console.log('Success!');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
