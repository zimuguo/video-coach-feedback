import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { SummaryData } from '../types'

const BAR_AREA_H = 120 // px, fixed height of the bar area

const CHART1_LABELS = ['C', 'R', 'O', 'W', 'D']
const CHART2_LABELS = ['EVA', 'EXP', 'ALT', 'RP', 'NF']

interface BarChartProps {
  bars: { count: number }[]
  labels: string[]
  onUpdate?: (index: number, value: number) => void
  onBlur?: () => void
}

function BarChart({ bars, labels, onUpdate, onBlur }: BarChartProps) {
  const maxCount = Math.max(...bars.map((b) => b.count), 1)

  return (
    <div className="flex flex-col gap-1">
      {/* Bars */}
      <div className="flex gap-1.5">
        {bars.map((bar, i) => {
          const barH = Math.round((bar.count / maxCount) * BAR_AREA_H)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Count input */}
              <input
                type="number"
                min={0}
                value={bar.count || ''}
                onChange={(e) => onUpdate?.(i, Math.max(0, parseInt(e.target.value) || 0))}
                onBlur={onBlur}
                placeholder="0"
                className="w-full text-center text-xs bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
              {/* Bar area */}
              <div className="w-full flex flex-col justify-end" style={{ height: `${BAR_AREA_H}px` }}>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-150"
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

interface Props {
  mode: 'edit' | 'view'
}

export default function SummaryTable({ mode }: Props) {
  const { summary, updateBarItem, updateChartComment, summaryPath, getSummaryFile } = useAppStore()

  const handleBlur = async () => {
    if (summaryPath) {
      const data = getSummaryFile()
      await window.electronAPI.saveSummary(summaryPath, data)
    }
  }

  const makeUpdater = (chart: keyof SummaryData) =>
    (index: number, value: number) =>
      updateBarItem(chart, index, 'count', value)

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-4">
      {mode === 'edit' && (
        <p className="text-xs text-slate-400">
          Enter counts for each bar. Changes are saved automatically.
        </p>
      )}
      <BarChart
        bars={summary.barChart1}
        labels={CHART1_LABELS}
        onUpdate={makeUpdater('barChart1')}
        onBlur={handleBlur}
      />
      <textarea
        value={summary.barChart1Comment ?? ''}
        onChange={(e) => updateChartComment('barChart1Comment', e.target.value)}
        onBlur={handleBlur}
        placeholder="Add comments for Chart 1..."
        rows={3}
        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
      />
      <BarChart
        bars={summary.barChart2}
        labels={CHART2_LABELS}
        onUpdate={makeUpdater('barChart2')}
        onBlur={handleBlur}
      />
      <textarea
        value={summary.barChart2Comment ?? ''}
        onChange={(e) => updateChartComment('barChart2Comment', e.target.value)}
        onBlur={handleBlur}
        placeholder="Add comments for Chart 2..."
        rows={3}
        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
      />
    </div>
  )
}
