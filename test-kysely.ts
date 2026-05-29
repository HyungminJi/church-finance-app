import { readFileSync } from 'fs';
import { db } from './app/server/utils/db';
import { sql } from 'kysely';

const env = readFileSync('.env', 'utf-8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL='))?.split('=')[1];
process.env.DATABASE_URL = dbUrl;

(async () => {
  try {
    const allTransactions = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        'a.type',
        sql<string>`sum(t.amount)`.as('sum_amount')
      ])
      .groupBy('a.type')
      .execute();
    console.log('Query success:', allTransactions);
  } catch (e: any) {
    console.error('Query error:', e);
  }
  process.exit(0);
})();
