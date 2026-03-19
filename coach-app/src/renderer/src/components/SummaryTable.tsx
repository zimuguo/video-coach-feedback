import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { BarItem, SummaryData } from '../types'

const BAR_AREA_H = 120 // px, fixed height of the bar area

interface BarChartProps {
  title: string
  bars: BarItem[]
  mode: 'edit' | 'view'
  onUpdate?: (index: number, field: 'label' | 'count', value: string | number) => void
  onBlur?: () => void
}

function BarChart({ title, bars, mode, onUpdate, onBlur }: BarChartProps) {
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
              {/* Count */}
              {mode === 'edit' ? (
                <input
                  type="number"
                  min={0}
                  value={bar.count || ''}
                  onChange={(e) =>
                    onUpdate?.(i, 'count', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  onBlur={onBlur}
                  placeholder="0"
                  className="w-full text-center text-xs bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <span className="text-xs text-slate-300 leading-none">{bar.count}</span>
              )}
              {/* Bar area */}
              <div className="w-full flex flex-col justify-end" style={{ height: `${BAR_AREA_H}px` }}>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-150"
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
            {mode === 'edit' ? (
              <input
                type="text"
                value={bar.label}
                onChange={(e) => onUpdate?.(i, 'label', e.target.value)}
                onBlur={onBlur}
                placeholder={`Label ${i + 1}`}
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <span className="text-xs text-slate-300 leading-snug">
                {bar.label || <span className="text-slate-600 italic">—</span>}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  mode: 'edit' | 'view'
}

export default function SummaryTable({ mode }: Props) {
  const { summary, updateBarItem, summaryPath, getSummaryFile } = useAppStore()

  const handleBlur = async () => {
    if (summaryPath) {
      const data = getSummaryFile()
      await window.electronAPI.saveSummary(summaryPath, data)
    }
  }

  const makeUpdater = (chart: keyof SummaryData) =>
    (index: number, field: 'label' | 'count', value: string | number) =>
      updateBarItem(chart, index, field, value)

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-6">
      {mode === 'edit' && (
        <p className="text-xs text-slate-400">
          Enter label names and counts for each bar. Changes are saved automatically.
        </p>
      )}
      <BarChart
        title="Chart 1"
        bars={summary.barChart1}
        mode={mode}
        onUpdate={makeUpdater('barChart1')}
        onBlur={handleBlur}
      />
      <BarChart
        title="Chart 2"
        bars={summary.barChart2}
        mode={mode}
        onUpdate={makeUpdater('barChart2')}
        onBlur={handleBlur}
      />
    </div>
  )
}
