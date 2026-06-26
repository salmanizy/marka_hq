"use client"

import * as React from "react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface MetaActionArray {
  action_type: string
  value: string
}

interface InsightRow {
  spend: string
  impressions: string
  clicks: string
  ctr: string
  cpc: string
  account_name: string
  date_start: string
  date_stop: string
  reach?: string
  frequency?: string
  cpm?: string
  conversions?: string
  actions?: MetaActionArray[]
  cost_per_action_type?: MetaActionArray[]
}

function fmtNum(value: string | number) {
  return new Intl.NumberFormat("id-ID").format(Math.round(Number(value)))
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function MetricCard({
  label,
  value,
  sub,
  hero = false,
  valueClassName = "",
  loading = false,
}: {
  label: string
  value: string
  sub?: string
  hero?: boolean
  valueClassName?: string
  loading?: boolean
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 flex flex-col gap-2 ${hero ? "p-6 border-primary/20 bg-primary/5" : ""}`}>
      <p className="text-xs text-muted-foreground tracking-wide font-medium">{label}</p>
      {loading ? (
        <Skeleton className={hero ? "h-10 w-32 my-1" : "h-8 w-24 my-0.5"} />
      ) : (
        <p className={`font-semibold leading-none tracking-tight ${hero ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"} ${valueClassName}`}>
          {value}
        </p>
      )}
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  )
}

export function InsightsClient({ actId }: { actId: string }) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const thirtyDaysAgo = new Date(yesterday)
  thirtyDaysAgo.setDate(yesterday.getDate() - 30)

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: yesterday,
  })
  const [pendingRange, setPendingRange] = React.useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: yesterday,
  })
  const [calOpen, setCalOpen] = React.useState(false)
  const [rows, setRows] = React.useState<InsightRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchInsights = React.useCallback(
    async (range: DateRange | undefined) => {
      setLoading(true)
      setError(null)
      let url = `/api/insights/${actId}`
      if (range?.from && range?.to) {
        url += `?since=${format(range.from, "yyyy-MM-dd")}&until=${format(range.to, "yyyy-MM-dd")}`
      }
      try {
        const res = await fetch(url)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Failed to fetch insights")
        setRows(json.data ?? [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    [actId]
  )

  React.useEffect(() => {
    fetchInsights(dateRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const row = rows[0]

  const totalResultsRaw = row?.conversions
    ? row.conversions
    : row?.actions?.find((x) => x.action_type === "purchase" || x.action_type === "lead" || x.action_type === "omni_purchase")?.value
      || row?.actions?.[0]?.value || "0"

  const cpl = row?.cost_per_action_type?.find(
    (x) => x.action_type === "lead" || x.action_type === "omni_lead"
  )?.value || "0"

  return (
    <div className="flex flex-col gap-6">
      {/* Date picker */}
      <div className="flex items-center gap-2">
        <Popover
          open={calOpen}
          onOpenChange={(open) => {
            setCalOpen(open)
            if (!open) setPendingRange(dateRange) // reset pending kalau ditutup tanpa apply
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={pendingRange?.from}
              selected={pendingRange}
              onSelect={setPendingRange}
              numberOfMonths={2}
              disabled={(date) => date > new Date(new Date().setHours(0, 0, 0, 0)) || date < new Date("1900-01-01")}
            />
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPendingRange(dateRange)
                  setCalOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!pendingRange?.from || !pendingRange?.to}
                onClick={() => {
                  setDateRange(pendingRange)
                  fetchInsights(pendingRange)
                  setCalOpen(false)
                }}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {dateRange && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              const defaultRange = {from: thirtyDaysAgo, to: yesterday}
              setDateRange(defaultRange)
              setPendingRange(defaultRange)
              fetchInsights(defaultRange)
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border bg-destructive/5 p-6 text-center text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Account identity card */}
      <div className="rounded-xl border bg-card px-5 py-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {loading ? "..." : row ? initials(row.account_name) : actId.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <Skeleton className="h-5 w-28 mb-1" />
          ) : (
            <p className="font-medium text-base leading-none">{row?.account_name ?? `${actId}`}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">{actId}</p>
        </div>
        {row && (
          <span className="text-xs text-muted-foreground bg-muted rounded-md px-2.5 py-1 whitespace-nowrap">
            {row.date_start} – {row.date_stop}
          </span>
        )}
      </div>

      {/* Kelompok 1: Core Performance Metrics (Hero Grid) */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight text-muted-foreground/80">Core Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MetricCard
            hero
            label="Total Spend"
            value={row ? `Rp ${Math.round(Number(row.spend)).toLocaleString('id-ID')}` : "—"}
            sub="Total biaya pengeluaran iklan"
            loading={loading}
          />
          <MetricCard
            hero
            label="Total Result"
            value={row ? fmtNum(totalResultsRaw) : "—"}
            sub="Total tindakan konversi utama"
            valueClassName="text-emerald-600 dark:text-emerald-400"
            loading={loading}
          />
          <MetricCard
            hero
            label="Cost per Lead (CPL)"
            value={row && cpl !== "0" ? `Rp ${Math.round(Number(cpl)).toLocaleString('id-ID')}` : "—"}
            sub="Biaya rata-rata perolehan prospek"
            valueClassName="text-blue-600 dark:text-blue-400"
            loading={loading}
          />
        </div>
      </div>

      {/* Kelompok 2: Delivery & Distribution Metrics */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight text-muted-foreground/80">Delivery & Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Reach"
            value={row?.reach ? fmtNum(row.reach) : "—"}
            sub="Jumlah audiens unik"
            loading={loading}
          />
          <MetricCard
            label="Impressions"
            value={row ? fmtNum(row.impressions) : "—"}
            sub="Total tayangan iklan"
            loading={loading}
          />
          <MetricCard
            label="Frequency"
            value={row?.frequency ? `${parseFloat(row.frequency).toFixed(2)}x` : "—"}
            sub="Rata-rata frekuensi per orang"
            loading={loading}
          />
          <MetricCard
            label="CPM"
            value={row?.cpm ? `Rp ${Math.round(Number(row.cpm)).toLocaleString('id-ID')}` : "—"}
            sub="Cost per 1.000 impressions"
            loading={loading}
          />
        </div>
      </div>

      {/* Kelompok 3: Performance & Engagement Metrics */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight text-muted-foreground/80">Engagement & Traffic</h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Clicks"
            value={row ? fmtNum(row.clicks) : "—"}
            sub="Total klik tindakan iklan"
            loading={loading}
          />
          <MetricCard
            label="CTR"
            value={row ? `${parseFloat(row.ctr).toFixed(2)}%` : "—"}
            sub="Click-through rate"
            valueClassName="text-emerald-600 dark:text-emerald-400"
            loading={loading}
          />
          <MetricCard
            label="CPC"
            value={row ? `Rp ${parseFloat(row.cpc).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
            sub="Rata-rata biaya per klik"
            valueClassName="text-blue-600 dark:text-blue-400"
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}