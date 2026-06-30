"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type MetricCardProps = {
  title: string
  value: string
  subtitle?: string
  change?: number
  changeLabel?: string
  status?: "good" | "warning" | "danger" | "neutral"
  tooltip?: string
  className?: string
}

const STATUS_BORDER: Record<string, string> = {
  good:    "border-l-4 border-l-emerald-500",
  warning: "border-l-4 border-l-amber-500",
  danger:  "border-l-4 border-l-red-500",
  neutral: "border-l-4 border-l-border",
}

const CHANGE_BADGE: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  negative: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  neutral:  "bg-muted text-muted-foreground border-border",
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = "vs periode lalu",
  status = "neutral",
  tooltip,
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const changeVariant = isPositive ? "positive" : isNegative ? "negative" : "neutral"

  const card = (
    <Card className={cn("shadow-sm", STATUS_BORDER[status], className)}>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
        )}

        {change !== undefined && (
          <div className="mt-3">
            <Badge
              variant="outline"
              className={cn("gap-1 text-xs font-medium", CHANGE_BADGE[changeVariant])}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
              {isPositive ? "+" : ""}{change.toFixed(1)}% {changeLabel}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (!tooltip) return card

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}