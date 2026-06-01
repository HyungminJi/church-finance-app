import { readFileSync } from 'fs';
import { db } from './app/server/utils/db.ts';
import { sql } from 'kysely';

const env = readFileSync('.env', 'utf-8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL='))?.split('=')[1];
process.env.DATABASE_URL = dbUrl;

(async () => {
  try {
    const year = '2026';
    const campaign_account_code = '0000000000'; // mock
    
    let baseQuery = db.selectFrom('transactions as t')
      .select([
        sql<string>\`TO_CHAR(t.transaction_date, 'MM')\`.as('month'),
        sql<number>\`SUM(t.amount)\`.as('amount')
      ])
      .where('t.account_code', '=', campaign_account_code)
      .where(sql\`EXTRACT(YEAR FROM t.transaction_date)\`, '=', year)
      
    console.log(baseQuery.compile().sql);
    console.log('Success compilation');
  } catch (err) {
    console.error('DB ERROR:', err.message);
  }
  process.exit(0);
})();
