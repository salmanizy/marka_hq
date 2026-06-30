import { NextRequest, NextResponse } from "next/server"
import { getCashAccounts, getProfitLoss } from "@/lib/kledo"

// Kledo tidak menyediakan field "type" string untuk akun.
// Kategori "Kas & Bank" diidentifikasi lewat finance_account_category_id === 1
// (terlihat dari response /finance/accounts: "Kas", "Rekening Bank", semua "Bank BCA...", dll
// semuanya punya finance_account_category_id: 1)
const CASH_BANK_CATEGORY_ID = 1

export async function GET(_req: NextRequest) {
  try {
    // Ambil saldo kas sekarang
    const accounts = await getCashAccounts()
    const totalCash = accounts.data.data
      .filter((a) => a.finance_account_category_id === CASH_BANK_CATEGORY_ID)
      .reduce((sum, a) => sum + (a.balance ?? 0), 0)

    // Hitung rata-rata burn 3 bulan terakhir
    const burns = await Promise.all(
      [1, 2, 3].map((monthsAgo) => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0)
        const fmt = (d: Date) => d.toISOString().split("T")[0]
        return getProfitLoss({ date_from: fmt(start), date_to: fmt(end) })
      })
    )

    const avgMonthlyBurn =
      burns.reduce((sum, b) => sum + Math.abs(b.data?.total?.expenses ?? 0), 0) / 3

    //Rumus Runway = Total Cash / Average Monthly Burn
    const runwayMonths = avgMonthlyBurn > 0 ? totalCash / avgMonthlyBurn : null

    return NextResponse.json({
      total_cash: totalCash,
      avg_monthly_burn: avgMonthlyBurn,
      runway_months: runwayMonths,
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