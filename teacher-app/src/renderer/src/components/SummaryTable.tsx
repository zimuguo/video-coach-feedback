import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { BarItem } from '../types'

const BAR_AREA_H = 120 // px, fixed height of the bar area

interface BarChartProps {
  title: string
  bars: BarItem[]
}

function BarChart({ title, bars }: BarChartProps) {
  const maxCount = Math.max(...bars.map((b) => b.count), 1)

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-slate-300">{title}</h3>

      {/* Bars */}
      <div className="flex gap-1.5">
        {bars.map((bar, i) => {
          const barH = Math.round((bar.count / maxCount) * BAR_AREA_H)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Count on top */}
              <span className="text-xs text-slate-300 leading-none">{bar.count}</span>
              {/* Bar area */}
              <div className="w-full flex flex-col justify-end" style={{ height: `${BAR_AREA_H}px` }}>
                <div
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${barH}px` }}
                />
              </div>
              {/* Index number */}
              <span className="text-xs text-slate-500 font-mono">{i + 1}</span>
            </div>
          )
        })}
      </div>

      {/* Baseline */}
      <div className="border-b border-slate-600" />

      {/* Numbered legend — full label per row */}
      <div className="flex flex-col gap-1.5">
        {bars.map((bar, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs text-slate-500 font-mono shrink-0 w-4 pt-0.5">{i + 1}.</span>
            <span className="text-xs text-slate-300 leading-snug">
              {bar.label || <span className="text-slate-600 italic">—</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SummaryTable() {
  const { summary } = useAppStore()

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-6">
      <BarChart title="Chart 1" bars={summary.barChart1} />
      <BarChart title="Chart 2" bars={summary.barChart2} />
    </div>
  )
}
