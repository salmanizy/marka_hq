"use client"

import * as React from "react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface InsightRow {
  spend: string
  impressions: string
  clicks: string
  ctr: string
  cpc: string
  conversions?: string
  account_name: string
  date_start: string
  date_stop: string
}

function toIDRAbbr(value: string) {
  const n = Math.round(Number(value))
  if (n >= 1_000_000_000) return `Rp ${(n / 1e9).toFixed(2)}B`
  if (n >= 1_000_000) return `Rp ${(n / 1e6).toFixed(2)}M`
  if (n >= 1_000) return `Rp ${(n / 1e3).toFixed(0)}K`
  return `Rp ${new Intl.NumberFormat("id-ID").format(n)}`
}

function toIDRFull(value: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseFloat(value))
}

function fmtNum(value: string) {
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
    <div className={`rounded-xl border bg-card p-5 flex flex-col gap-2 ${hero ? "p-6" : ""}`}>
      <p className="text-xs text-muted-foreground tracking-wide">{label}</p>
      {loading ? (
        <Skeleton className={hero ? "h-10 w-32" : "h-8 w-24"} />
      ) : (
        <p className={`font-medium leading-none tracking-tight ${hero ? "text-4xl" : "text-3xl"} ${valueClassName}`}>
          {value}
        </p>
      )}
      {sub && <p className="text-xs text-muted-foreground/60">{sub}</p>}
    </div>
  )
}

export function InsightsClient({ actId }: { actId: string }) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: today,
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

  return (
    <div className="flex flex-col gap-5">

      {/* Date picker */}
      <div className="flex items-center gap-2">
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 min-w-[240px] justify-start font-normal">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
                : "Select date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range)
                if (range?.from && range?.to) {
                  setCalOpen(false)
                  fetchInsights(range)
                }
              }}
              numberOfMonths={2}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>

        {dateRange && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setDateRange(undefined)
              fetchInsights(undefined)
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
            <p className="font-medium text-base leading-none">{row?.account_name ?? `act_${actId}`}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">act_{actId}</p>
        </div>
        {row && (
          <span className="text-xs text-muted-foreground bg-muted rounded-md px-2.5 py-1 whitespace-nowrap">
            {row.date_start} – {row.date_stop}
          </span>
        )}
      </div>

      {/* Hero metrics — Spend & Impressions */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          hero
          label="Total spend"
          value={row ? toIDRAbbr(row.spend) : "—"}
          sub={row ? toIDRFull(row.spend) : "IDR"}
          loading={loading}
        />
        <MetricCard
          hero
          label="Impressions"
          value={row ? fmtNum(row.impressions) : "—"}
          sub="Total tayangan"
          loading={loading}
        />
      </div>

      {/* Secondary metrics — Clicks, CTR, CPC */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Clicks"
          value={row ? fmtNum(row.clicks) : "—"}
          sub="Total klik"
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
          value={row ? toIDRAbbr(row.cpc) : "—"}
          sub="Cost per click"
          valueClassName="text-blue-600 dark:text-blue-400"
          loading={loading}
        />
      </div>

      {/* Conversions */}
      <MetricCard
        label="Conversions"
        value={row?.conversions ? fmtNum(row.conversions) : "—"}
        sub={row?.conversions ? "Total konversi" : "Tidak ada data konversi untuk periode ini"}
        loading={loading}
      />
    </div>
  )
}