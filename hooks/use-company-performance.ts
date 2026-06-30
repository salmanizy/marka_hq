"use client"

import { useState, useEffect, useCallback } from "react"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"

export type DashboardMetrics = {
  revenue: number
  opex: number
  grossProfit: number
  netProfit: number
  netProfitMargin: number
  opexBreakdown: Array<{ name: string; total: number }>
  revenueBreakdown: Array<{ name: string; total: number }>
  prevRevenue: number
  prevOpex: number
  prevNetProfit: number
  period: { date_from: string; date_to: string }
}

export type RunwayMetrics = {
  total_cash: number
  avg_monthly_burn: number
  runway_months: number | null
}

export type LoadingState = "idle" | "loading" | "success" | "error"

type AccountRowRaw = {
  account_id: number
  net: number
  account: { name: string }
}

function mapRows(rows: AccountRowRaw[] | undefined): Array<{ name: string; total: number }> {
  if (!rows) return []
  return rows
    .map((r) => ({ name: r.account?.name ?? `Account ${r.account_id}`, total: r.net ?? 0 }))
    .filter((r) => r.total !== 0)
}

export function useCompanyPerformance(dateRange: DateRange | undefined) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [runway, setRunway] = useState<RunwayMetrics | null>(null)
  const [state, setState] = useState<LoadingState>("idle")
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setState("loading")
    setError(null)

    const dateFrom = format(dateRange.from, "yyyy-MM-dd")
    const dateTo   = format(dateRange.to,   "yyyy-MM-dd")

    try {
      const [plRes, runwayRes] = await Promise.all([
        fetch(`/api/kledo/profit-loss?date_from=${dateFrom}&date_to=${dateTo}`),
        fetch(`/api/kledo/runway`),
      ])

      if (!plRes.ok)     throw new Error(`Profit loss fetch failed: ${plRes.status}`)
      if (!runwayRes.ok) throw new Error(`Runway fetch failed: ${runwayRes.status}`)

      const plData     = await plRes.json()
      const runwayData = await runwayRes.json()

      // Struktur asli Kledo: current.data.data.total & current.data.data.data
      const curTotal  = plData.current?.data?.data?.total ?? {}
      const curRows   = plData.current?.data?.data?.data ?? {}
      const prevTotal = plData.previous?.data?.data?.total ?? {}

      const revenue   = curTotal.trading_income ?? 0
      const opex      = Math.abs(curTotal.expenses ?? 0)
      const netProfit = curTotal.net_profit ?? revenue - opex
      const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

      setMetrics({
        revenue,
        opex,
        grossProfit: curTotal.gross_profit ?? 0,
        netProfit,
        netProfitMargin,
        opexBreakdown: mapRows(curRows.expenses),
        revenueBreakdown: mapRows(curRows.sales),
        prevRevenue:   prevTotal.trading_income ?? 0,
        prevOpex:      Math.abs(prevTotal.expenses ?? 0),
        prevNetProfit: prevTotal.net_profit ?? 0,
        period: { date_from: dateFrom, date_to: dateTo },
      })

      setRunway(runwayData)
      setState("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setState("error")
    }
  }, [dateRange?.from?.toISOString(), dateRange?.to?.toISOString()])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, runway, state, error, refetch: fetchData }
}