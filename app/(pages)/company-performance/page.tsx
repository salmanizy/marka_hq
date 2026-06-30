"use client"

import { useState } from "react"
import { subDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { RefreshCw, AlertCircle, TrendingUp } from "lucide-react"

import { useCompanyPerformance } from "@/hooks/use-company-performance"
import { MetricCard }     from "@/components/metric-card"
import { RunwayMeter }    from "@/components/runway-meter"
import { BreakdownChart } from "@/components/breakdown-chart"
import { CalendarRange }  from "@/components/calendar-range"

import { Button }    from "@/components/ui/button"
import { Skeleton }  from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge }     from "@/components/ui/badge"

const DEFAULT_RANGE: DateRange = {
  from: subDays(new Date(), 29),
  to:   new Date(),
}

export default function CompanyPerformancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(DEFAULT_RANGE)
  const { metrics, runway, state, error, refetch } = useCompanyPerformance(dateRange)

  const isLoading = state === "idle" || state === "loading"

  const pctChange = (current: number, previous: number) =>
    previous === 0 ? undefined : ((current - previous) / previous) * 100

  const prevMargin =
    metrics && metrics.prevRevenue > 0
      ? (metrics.prevNetProfit / metrics.prevRevenue) * 100
      : 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">Company Performance</h1>
              <Badge variant="secondary" className="text-[10px] font-normal">
                Powered by Kledo
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {metrics?.period
                ? `${metrics.period.date_from} — ${metrics.period.date_to}`
                : "Pilih rentang tanggal untuk memuat data"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading || !dateRange?.from || !dateRange?.to}
              className="h-9 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Calendar Range Picker ─────────────────────────────────── */}
        <div className="flex justify-start">
          <CalendarRange
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <Separator />

        {/* ── Error banner ──────────────────────────────────────────── */}
        {state === "error" && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Gagal memuat data dari Kledo</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={refetch} className="shrink-0 h-7 text-xs">
                Coba lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Row 1: Runway + 3 KPI cards ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {isLoading || !runway ? (
            <CardSkeleton rows={4} />
          ) : (
            <RunwayMeter
              months={runway.runway_months}
              totalCash={runway.total_cash}
              monthlyBurn={runway.avg_monthly_burn}
            />
          )}

          {isLoading || !metrics ? (
            <CardSkeleton />
          ) : (
            <MetricCard
              title="Revenue"
              value={formatCurrency(metrics.revenue)}
              subtitle={`${metrics.period.date_from} — ${metrics.period.date_to}`}
              change={pctChange(metrics.revenue, metrics.prevRevenue)}
              status={
                metrics.prevRevenue === 0       ? "neutral"
                : metrics.revenue >= metrics.prevRevenue ? "good"
                : "warning"
              }
              tooltip="Total pendapatan yang sudah dibayar pada periode ini"
            />
          )}

          {isLoading || !metrics ? (
            <CardSkeleton />
          ) : (
            <MetricCard
              title="OPEX"
              value={formatCurrency(metrics.opex)}
              subtitle="Total operational expense"
              change={
                metrics.prevOpex > 0
                  ? -pctChange(metrics.opex, metrics.prevOpex)!
                  : undefined
              }
              status={
                metrics.prevOpex === 0          ? "neutral"
                : metrics.opex <= metrics.prevOpex ? "good"
                : "warning"
              }
              tooltip="Total pengeluaran operasional. Tanda + artinya lebih hemat vs periode lalu"
            />
          )}

          {isLoading || !metrics ? (
            <CardSkeleton />
          ) : (
            <MetricCard
              title="Net Profit Margin"
              value={`${metrics.netProfitMargin.toFixed(1)}%`}
              subtitle={`Net profit: ${formatCurrency(metrics.netProfit)}`}
              change={pctChange(metrics.netProfitMargin, prevMargin)}
              status={
                metrics.netProfitMargin >= 20 ? "good"
                : metrics.netProfitMargin >= 5  ? "warning"
                : metrics.netProfitMargin < 0   ? "danger"
                : "neutral"
              }
              tooltip="(Revenue - Total Cost) ÷ Revenue × 100. Umumnya sehat di atas 20%"
            />
          )}
        </div>

        {/* ── Row 2: Breakdown charts ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading || !metrics ? (
            <>
              <CardSkeleton rows={6} />
              <CardSkeleton rows={6} />
            </>
          ) : (
            <>
              <BreakdownChart
                title="OPEX Breakdown"
                rows={metrics.opexBreakdown}
                barColor="bg-rose-500"
                emptyLabel="Tidak ada data expense untuk periode ini"
              />
              <BreakdownChart
                title="Revenue Breakdown"
                rows={metrics.revenueBreakdown}
                barColor="bg-teal-500"
                emptyLabel="Tidak ada data revenue untuk periode ini"
              />
            </>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-muted-foreground/60 pb-2">
          Data di-cache 5 menit · Sumber: Kledo · Last updated:{" "}
          {new Date().toLocaleString("id-ID")}
        </p>

      </div>
    </div>
  )
}

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="shadow-sm border-l-4 border-l-border">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: rows - 2 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

function formatCurrency(val: number) {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`
  if (val >= 1_000_000)     return `Rp ${(val / 1_000_000).toFixed(1)}jt`
  return `Rp ${val.toLocaleString("id-ID")}`
}