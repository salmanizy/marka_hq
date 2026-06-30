import { NextRequest, NextResponse } from "next/server"
import { getCashAccounts, getProfitLoss } from "@/lib/kledo"

// Kledo tidak punya field "type" string untuk akun.
// Kategori "Kas & Bank" diidentifikasi lewat finance_account_category_id === 1
const CASH_BANK_CATEGORY_ID = 1

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const customFrom = searchParams.get("date_from")
    const customTo   = searchParams.get("date_to")

    // ── 1. Current Cash Balance ──────────────────────────────────────────
    const accounts = await getCashAccounts()
    const totalCash = accounts.data.data
      .filter((a) => a.finance_account_category_id === CASH_BANK_CATEGORY_ID)
      .reduce((sum, a) => sum + (a.balance ?? 0), 0)

    // ── 2. Monthly Net Burn Rate = Monthly Expense - Monthly Revenue ─────
    // Kalau user kasih date range custom, pakai itu sebagai 1 periode "bulan ini".
    // Kalau tidak, default ke rata-rata 3 bulan kalender terakhir.
    let netBurnRate: number

    if (customFrom && customTo) {
      const pl = await getProfitLoss({ date_from: customFrom, date_to: customTo })
      const expense = pl.data?.total?.expenses ?? 0
      const revenue = pl.data?.total?.trading_income ?? 0
      netBurnRate = expense - revenue
    } else {
      const burns = await Promise.all(
        [1, 2, 3].map((monthsAgo) => {
          const now = new Date()
          const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
          const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0)
          const fmt = (d: Date) => d.toISOString().split("T")[0]
          return getProfitLoss({ date_from: fmt(start), date_to: fmt(end) })
        })
      )
      const totalBurn = burns.reduce((sum, b) => {
        const expense = b.data?.total?.expenses ?? 0
        const revenue = b.data?.total?.trading_income ?? 0
        return sum + (expense - revenue)
      }, 0)
      netBurnRate = totalBurn / 3
    }

    // ── 3. Runway = Current Cash Balance ÷ Monthly Net Burn Rate ─────────
    // Kalau net burn <= 0 artinya profitable / break-even → runway "tak terbatas" (null)
    const runwayMonths = netBurnRate > 0 ? totalCash / netBurnRate : null

    return NextResponse.json({
      total_cash: totalCash,
      monthly_net_burn: netBurnRate,
      runway_months: runwayMonths,
      is_profitable: netBurnRate <= 0,
      accounts: accounts.data.data,
    })
  } catch (err) {
    console.error("[kledo/runway]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch runway" },
      { status: 500 }
    )
  }
}