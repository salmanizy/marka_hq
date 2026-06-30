const KLEDO_API_HOST = process.env.KLEDO_API_HOST!
const KLEDO_PAT = process.env.KLEDO_PAT!

if (!KLEDO_API_HOST || !KLEDO_PAT) {
  console.warn("KLEDO_API_HOST or KLEDO_PAT is not set in environment variables")
}

async function kledoFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${KLEDO_API_HOST}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${KLEDO_PAT}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 }, // cache 5 menit
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Kledo API error ${res.status}: ${text}`)
  }

  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────
// Berdasarkan struktur asli response GET /reportings/profitLoss

export type Period = {
  date_from: string // "YYYY-MM-DD"
  date_to: string
}

type AccountRowRaw = {
  account_id: number
  net: number
  account: {
    id: number
    name: string
    ref_code: string
    formatted: string
  }
}

export type ProfitLossResponse = {
  success: boolean
  data: {
    data: {
      sales: AccountRowRaw[]
      other_revenue: AccountRowRaw[]
      cost_of_sales: AccountRowRaw[]
      expenses: AccountRowRaw[]
      other_expenses: AccountRowRaw[]
    }
    total: {
      trading_income: number   // = Revenue
      cost_of_sales: number
      gross_profit: number
      expenses: number          // = OPEX
      net_profit: number
    }
  }
  message: string
}

export type AccountRow = {
  id: number
  name: string
  ref_code: string
  finance_account_category_id: number
  balance: number
  is_parent: number
  parent_id: number | null
}

export type AccountData = {
  data: { data: AccountRow[] }
}

export type TransactionRow = {
  id: number
  date: string
  amount: number
  description: string
  category_name: string
  tag_name: string | null
}

export type TransactionData = {
  data: {
    data: TransactionRow[]
    total: number
  }
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getProfitLoss(period: Period): Promise<ProfitLossResponse> {
  return kledoFetch("/reportings/profitLoss", {
    date_from: period.date_from,
    date_to: period.date_to,
  })
}

export async function getCashAccounts(): Promise<AccountData> {
  return kledoFetch("/finance/accounts")
}

export async function getExpenses(period: Period): Promise<TransactionData> {
  return kledoFetch("/finance/expenses", {
    date_from: period.date_from,
    date_to: period.date_to,
    per_page: "200",
  })
}

export async function getRevenue(period: Period): Promise<TransactionData> {
  return kledoFetch("/finance/invoices", {
    date_from: period.date_from,
    date_to: period.date_to,
    status: "paid",
    per_page: "200",
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPeriodDates(period: "mtd" | "qtd" | "ytd"): Period {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  if (period === "mtd") {
    return {
      date_from: formatDate(new Date(year, month, 1)),
      date_to: formatDate(now),
    }
  }
  if (period === "qtd") {
    const quarterStart = new Date(year, Math.floor(month / 3) * 3, 1)
    return { date_from: formatDate(quarterStart), date_to: formatDate(now) }
  }
  return {
    date_from: formatDate(new Date(year, 0, 1)),
    date_to: formatDate(now),
  }
}

// Konversi array account rows mentah → format breakdown sederhana { name, total }
export function mapAccountRows(rows: AccountRowRaw[] | undefined): Array<{ name: string; total: number }> {
  if (!rows) return []
  return rows.map((r) => ({
    name: r.account?.name ?? `Account ${r.account_id}`,
    total: r.net ?? 0,
  }))
}