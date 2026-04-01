import { PostgresDialect, Kysely } from 'kysely'
import pg from 'pg'
import type { Database } from './db.type'

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
