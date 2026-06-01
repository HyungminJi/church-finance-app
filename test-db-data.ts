import { readFileSync } from 'fs';
import { db } from './app/server/utils/db';
import { sql } from 'kysely';

const env = readFileSync('.env', 'utf-8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL='))?.split('=')[1];
process.env.DATABASE_URL = dbUrl;

(async () => {
  try {
    const campaignId = '61c946eb-e257-42e1-8db5-44733c773733';
    
    const campaign = await db.selectFrom('pledge_campaigns')
      .selectAll()
      .where('id', '=', campaignId)
      .executeTakeFirstOrThrow();
      
    console.log('Campaign Account Code:', campaign.account_code);
    console.log('Campaign Start Date:', campaign.start_date);
    
    const txs = await db.selectFrom('transactions')
      .selectAll()
      .where('account_code', '=', campaign.account_code)
      .limit(5)
      .execute();
      
    console.log('Sample transactions for this account code:', txs);
    
  } catch (err: any) {
    console.error('DB ERROR:', err.message);
  }
  process.exit(0);
})();
