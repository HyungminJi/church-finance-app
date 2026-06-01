import { readFileSync } from 'fs';

const env = readFileSync('.env', 'utf-8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL='))?.split('=')[1];
process.env.DATABASE_URL = dbUrl;

import { db } from './app/server/utils/db.ts';
import { sql } from 'kysely';

(async () => {
  try {
    const keyword = '';
    const phone = '';
    const status = 'CURRENT';
    const cellGroupId = '';
    const role = '';
    const churchId = '00000000-0000-0000-0000-000000000001';

    let baseQuery = db.selectFrom('donors as d')
        .innerJoin('members as m', 'd.id', 'm.donor_id')
        .leftJoin('common_codes as cc', (join) => join
          .onRef('m.church_role', '=', 'cc.code')
          .on('cc.group_code', '=', 'CHURCH_ROLE')
        )
        .leftJoin('cell_groups as cg', 'm.cell_group_id', 'cg.id')
        .leftJoin('users as u', 'm.id', 'u.member_id')
        .where('d.donor_type', '=', 'MEMBER')
        .where('d.church_id', '=', churchId);
        
    baseQuery = baseQuery.where('m.removed_date', 'is', null);

    const totalRes = await baseQuery.select(db.fn.count('donors.id').as('count')).executeTakeFirstOrThrow();
    console.log('Total Count:', totalRes.count);
    
    console.log('Success!');
  } catch (err) {
    console.error('DB ERROR:', err.message);
  }
  process.exit(0);
})();
