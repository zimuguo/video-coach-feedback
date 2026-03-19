import React from 'react'
import { useAppStore } from '../store/useAppStore'

const BAR_AREA_H = 120 // px, fixed height of the bar area

const CHART1_LABELS = ['C', 'R', 'O', 'W', 'D']
const CHART2_LABELS = ['EVA', 'EXP', 'ALT', 'RP', 'NF']

interface BarChartProps {
  bars: { count: number }[]
  labels: string[]
}

function BarChart({ bars, labels }: BarChartProps) {
  const maxCount = Math.max(...bars.map((b) => b.count), 1)

  return (
    <div className="flex flex-col gap-1">
      {/* Bars */}
      <div className="flex gap-1.5">
        {bars.map((bar, i) => {
          const barH = Math.round((bar.count / maxCount) * BAR_AREA_H)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Count */}
              <span className="text-xs text-slate-300 leading-none">{bar.count}</span>
              {/* Bar area */}
              <div className="w-full flex flex-col justify-end" style={{ height: `${BAR_AREA_H}px` }}>
                <div
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${barH}px` }}
                />
              </div>
              {/* Label */}
              <span className="text-xs text-slate-300 font-mono">{labels[i]}</span>
            </div>
          )
        })}
      </div>
      {/* Baseline */}
      <div className="border-b border-slate-600" />
    </div>
  )
}

export default function SummaryTable() {
  const { summary } = useAppStore()

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-4">
      <BarChart bars={summary.barChart1} labels={CHART1_LABELS} />
      {(summary.barChart1Comment) ? (
        <p className="text-xs text-slate-300 whitespace-pre-wrap">{summary.barChart1Comment}</p>
      ) : (
        <p className="text-xs text-slate-600 italic">No comments for Chart 1.</p>
      )}
      <BarChart bars={summary.barChart2} labels={CHART2_LABELS} />
      {(summary.barChart2Comment) ? (
        <p className="text-xs text-slate-300 whitespace-pre-wrap">{summary.barChart2Comment}</p>
      ) : (
        <p className="text-xs text-slate-600 italic">No comments for Chart 2.</p>
      )}
    </div>
  )
}
