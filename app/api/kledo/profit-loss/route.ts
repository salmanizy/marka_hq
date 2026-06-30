import { NextRequest, NextResponse } from "next/server"
import { getProfitLoss, getPeriodDates } from "@/lib/kledo"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const periodParam = (searchParams.get("period") ?? "mtd") as "mtd" | "qtd" | "ytd"
    const customFrom = searchParams.get("date_from") ?? searchParams.get("date_start")
    const customTo   = searchParams.get("date_to")   ?? searchParams.get("date_end")

    const period =
      customFrom && customTo
        ? { date_from: customFrom, date_to: customTo }
        : getPeriodDates(periodParam)

    const [current, previous] = await Promise.all([
      getProfitLoss(period),
      getProfitLoss(getPreviousPeriod(period)),
    ])

    return NextResponse.json({ current, previous, period })
  } catch (err) {
    console.error("[kledo/profit-loss]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch data" },
      { status: 500 }
    )
  }
}

function getPreviousPeriod(period: { date_from: string; date_to: string }) {
  const start = new Date(period.date_from)
  const end = new Date(period.date_to)
  const diffMs = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - diffMs)
  const fmt = (d: Date) => d.toISOString().split("T")[0]
  return { date_from: fmt(prevStart), date_to: fmt(prevEnd) }
}