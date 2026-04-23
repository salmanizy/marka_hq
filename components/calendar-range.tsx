"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface CalendarRangeProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
}

export function CalendarRange({ dateRange, onDateRangeChange }: CalendarRangeProps) {
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  })

  const selected = dateRange ?? internalRange

  const handleSelect = (range: DateRange | undefined) => {
    setInternalRange(range)
    onDateRangeChange?.(range)
  }

  return (
    <Card className="mx-auto w-fit p-0">
      <CardContent className="p-0">
        <Calendar
          mode="range"
          defaultMonth={selected?.from}
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </CardContent>
    </Card>
  )
}
