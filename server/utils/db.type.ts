import type { Generated } from 'kysely'

export interface AccountsTable {
  code: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  is_active: boolean | null
  created_at: Generated<Date>
  parent_code: string | null
  level: number
}

export interface MembersTable {
  id: Generated<string>
  name: string
  phone_number: string
  spouse_name: string | null
  birth_date: string | Date | null
  address: string | null
  removed_date: string | Date | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
  email: string | null
  church_role: number | null
  cell_group_id: string | null
  is_user: boolean | null
  postcode: string | null
  detail_address: string | null
}

export interface CellGroupsTable {
  id: Generated<string>
  name: string
  leader_id: string | null
  parent_group: string | null
  is_active: boolean | null
  created_at: Generated<Date>
}

export interface CommonGroupsTable {
  group_code: string
  group_name: string
  description: string | null
  is_active: boolean | null
  created_at: Generated<Date>
}

export interface CommonCodesTable {
  group_code: string
  code: number
  name: string
  name_en: string
  is_active: boolean | null
  created_at: Generated<Date>
}

export interface BudgetsTable {
  id: Generated<string>
  account_code: string
  amount: number
  fiscal_year: number
  created_at: Generated<Date>
}

export interface TransactionsTable {
  id: Generated<string>
  account_code: string
  amount: number
  transaction_date: string | Date
  description: string | null
  member_id: string | null
  created_at: Generated<Date>
}

export interface UsersTable {
  id: Generated<string>
  login_id: string
  password_hash: string
  role: number
  is_active: boolean | null
  member_id: string | null
  created_at: Generated<Date>
  last_login_at: Date | null
}

export interface Database {
  accounts: AccountsTable
  members: MembersTable
  cell_groups: CellGroupsTable
  common_groups: CommonGroupsTable
  common_codes: CommonCodesTable
  budgets: BudgetsTable
  transactions: TransactionsTable
  users: UsersTable
}
