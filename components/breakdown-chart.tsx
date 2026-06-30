"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type BreakdownChartProps = {
  title: string
  rows: Array<{ id: number; name: string; total: number }>
  barColor?: string // tailwind bg class, default violet
  emptyLabel?: string
}

const DEFAULT_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-cyan-500",
]

export function BreakdownChart({
  title,
  rows,
  barColor,
  emptyLabel = "Tidak ada data untuk periode ini",
}: BreakdownChartProps) {
  const sorted = [...(rows ?? [])]
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const total = sorted.reduce((s, r) => s + r.total, 0)
  const max = sorted[0]?.total ?? 1

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {sorted.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {formatCurrency(total)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{emptyLabel}</p>
        ) : (
          <div className="space-y-3.5">
            {sorted.map((row, i) => {
              const widthPct = (row.total / max) * 100
              const sharePct = ((row.total / total) * 100).toFixed(1)
              const color = barColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]

              return (
                <TooltipProvider key={row.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-default">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-foreground truncate max-w-[55%]" title={row.name}>
                            {row.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground">{sharePct}%</span>
                            <span className="text-xs font-medium">{formatCurrency(row.total)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", color)}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <span className="font-medium">{row.name}</span>
                      <br />
                      {formatCurrency(row.total)} · {sharePct}% dari total
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatCurrency(val: number) {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`
  if (val >= 1_000_000)     return `Rp ${(val / 1_000_000).toFixed(1)}jt`
  return `Rp ${val.toLocaleString("id-ID")}`
}