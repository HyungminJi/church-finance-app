import { db } from '../app/server/utils/db'

async function check() {
  const data = await db.selectFrom('transactions as t')
    .leftJoin('accounts as a', 't.account_code', 'a.code')
    .select(['t.transaction_date', 'a.type', 't.amount', 't.description', 't.account_code'])
    .limit(5)
    .execute()
  
  console.log(data)
  process.exit(0)
}

check()