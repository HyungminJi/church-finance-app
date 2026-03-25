import type { Generated } from 'kysely'

export interface AccountsTable {
  code: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  is_active: boolean | null
  created_at: Generated<Date>
  parent_code: string | null
  level: number
  default_fund_id: string | null
}

// 최상위 헌금자 (Donor Supertype)
export interface DonorsTable {
  id: Generated<string>
  donor_type: 'MEMBER' | 'CELL_GROUP' | 'ORGANIZATION'
  name: string
  created_at: Generated<Date>
}

export interface MembersTable {
  id: Generated<string>
  donor_id: string // donors 참조
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
  donor_id: string // donors 참조
  name: string
  leader_id: string | null
  parent_group: string | null
  is_active: boolean | null
  created_at: Generated<Date>
}

export interface OrganizationsTable {
  id: Generated<string>
  donor_id: string // donors 참조
  name: string
  org_type: string | null
  contact_info: string | null
  description: string | null
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
  transaction_date: string | Date
  account_code: string
  amount: number
  description: string | null
  donor_id: string | null // 기존 member_id 대체
  receipt_id: string | null
  fund_id: string | null
  created_at: Generated<Date>
}

export interface FundsTable {
  id: Generated<string>
  name: string
  bank_name: string | null
  account_number: string | null
  book_type: string | null
  category: string | null
  initial_balance: number
  description: string | null
  is_active: boolean | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
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

export interface PledgeCampaignsTable {
  id: Generated<string>
  name: string
  description: string | null
  start_date: string | Date
  end_date: string | Date | null
  target_amount: number
  account_code: string
  is_active: boolean | null
  fund_id: string | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface MemberPledgesTable {
  id: Generated<string>
  campaign_id: string
  member_id: string
  pledge_amount: number
  pledge_date: Generated<string | Date>
  notes: string | null
  created_at: Generated<Date>
}

export interface ReceiptsTable {
  id: Generated<string>
  receipt_number: string
  member_id: string
  target_year: number
  total_amount: number
  issued_date: Generated<string | Date>
  issued_by: string | null
  status: 'ISSUED' | 'CANCELLED'
  notes: string | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface Database {
  accounts: AccountsTable
  donors: DonorsTable
  members: MembersTable
  cell_groups: CellGroupsTable
  organizations: OrganizationsTable
  common_groups: CommonGroupsTable
  common_codes: CommonCodesTable
  budgets: BudgetsTable
  transactions: TransactionsTable
  users: UsersTable
  pledge_campaigns: PledgeCampaignsTable
  member_pledges: MemberPledgesTable
  funds: FundsTable
  receipts: ReceiptsTable
}
