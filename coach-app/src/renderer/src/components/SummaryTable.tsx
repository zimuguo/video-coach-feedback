import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { SUMMARY_LABELS, SummaryData } from '../types'

interface Props {
  mode: 'edit' | 'view'
}

export default function SummaryTable({ mode }: Props) {
  const { summary, updateSummary, summaryPath, getSummaryFile } = useAppStore()

  const handleBlur = async (_field: keyof SummaryData) => {
    if (summaryPath) {
      const data = getSummaryFile()
      await window.electronAPI.saveSummary(summaryPath, data)
    }
  }

  const fields = Object.keys(SUMMARY_LABELS) as (keyof SummaryData)[]

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-4">
      {mode === 'edit' && (
        <p className="text-xs text-slate-400">
          Fill in your feedback below. Changes are saved automatically.
        </p>
      )}
      {fields.map((field) => (
        <div key={field}>
          <label className="block text-xs font-semibold text-slate-300 mb-1 leading-tight">
            {SUMMARY_LABELS[field]}
          </label>
          {mode === 'edit' ? (
            <textarea
              value={summary[field]}
              onChange={(e) => updateSummary(field, e.target.value)}
              onBlur={() => handleBlur(field)}
              placeholder="Enter your feedback here..."
              className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
          ) : (
            <div className="bg-slate-800 rounded p-2 text-sm text-slate-300 min-h-[4rem] whitespace-pre-wrap">
              {summary[field] || (
                <span className="text-slate-600 italic">No feedback entered</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
