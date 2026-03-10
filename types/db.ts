import type { ColumnType, Generated } from 'kysely'

export type AccountType = 'INCOME' | 'EXPENSE'
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

export interface AccountsTable {
  code: string
  name: string
  type: AccountType
  category_name: string | null
  is_active: ColumnType<boolean, never, boolean | undefined>
  created_at: ColumnType<Date, never, never>
}

export interface BudgetsTable {
  id: Generated<string>
  account_code: string | null
  fiscal_year: number
  amount: ColumnType<bigint, bigint | undefined, bigint>
  created_at: ColumnType<Date, never, never>
}

export interface TransactionsTable {
  id: Generated<string>
  transaction_date: Date
  account_code: string | null
  amount: bigint
  description: string | null
  created_at: ColumnType<Date, never, never>
}

export interface UsersTable {
  id: Generated<string>
  login_id: string
  password_hash: string
  name: string
  phone_number: string
  church_role: string
  role: ColumnType<UserRole, UserRole | undefined, UserRole>
  is_active: ColumnType<boolean, boolean | undefined, boolean | undefined>
  created_at: ColumnType<Date, never, never>
  last_login_at: ColumnType<Date | null, Date | undefined, Date | undefined>
}

export interface Database {
  accounts: AccountsTable
  budgets: BudgetsTable
  transactions: TransactionsTable
  users: UsersTable
}
