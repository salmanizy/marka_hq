"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

type RunwayMeterProps = {
  months: number | null
  totalCash: number
  monthlyBurn: number
}

type Status = "good" | "warning" | "danger" | "neutral"

function getStatus(months: number | null): Status {
  if (months === null) return "neutral"
  if (months >= 12) return "good"
  if (months >= 6) return "warning"
  return "danger"
}

const STATUS_CONFIG: Record<Status, {
  border: string
  bar: string
  badge: string
  label: string
}> = {
  good:    { border: "border-l-emerald-500", bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", label: "Runway sehat ✓" },
  warning: { border: "border-l-amber-500",   bar: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",       label: "Perlu perhatian" },
  danger:  { border: "border-l-red-500",     bar: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",                   label: "Kritis — butuh action" },
  neutral: { border: "border-l-border",      bar: "bg-muted",       badge: "bg-muted text-muted-foreground border-border",                                                                      label: "Data tidak tersedia" },
}

// Max gauge = 24 bulan
const MAX_MONTHS = 24

export function RunwayMeter({ months, totalCash, monthlyBurn }: RunwayMeterProps) {
  const status = getStatus(months)
  const cfg = STATUS_CONFIG[status]
  const gaugePercent = months !== null ? Math.min((months / MAX_MONTHS) * 100, 100) : 0

  return (
    <Card className={cn("shadow-sm border-l-4", cfg.border)}>
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Company Runway
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                Total kas dibagi rata-rata burn rate 3 bulan terakhir
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        {/* Value */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-semibold tracking-tight">
            {months !== null ? months.toFixed(1) : "—"}
          </span>
          <span className="text-lg text-muted-foreground">bulan</span>
        </div>

        {/* Gauge bar */}
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", cfg.bar)}
            style={{ width: `${gaugePercent}%` }}
          />
          {/* Threshold markers */}
          <div className="absolute top-0 bottom-0 w-px bg-background/60" style={{ left: "25%" }} />
          <div className="absolute top-0 bottom-0 w-px bg-background/60" style={{ left: "50%" }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/60">
          <span>0</span>
          <span>6 bln</span>
          <span>12 bln</span>
          <span>24 bln</span>
        </div>

        {/* Status badge */}
        <div className="mt-3">
          <Badge variant="outline" className={cn("text-xs", cfg.badge)}>
            {cfg.label}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Kas</p>
            <p className="text-sm font-medium">{formatCurrency(totalCash)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Burn/Bulan (avg 3bln)</p>
            <p className="text-sm font-medium">{formatCurrency(monthlyBurn)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(val: number) {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`
  if (val >= 1_000_000)     return `Rp ${(val / 1_000_000).toFixed(1)}jt`
  return `Rp ${val.toLocaleString("id-ID")}`
}