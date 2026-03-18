import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { SUMMARY_LABELS, SummaryData } from '../types'

export default function SummaryTable() {
  const { summary } = useAppStore()
  const fields = Object.keys(SUMMARY_LABELS) as (keyof SummaryData)[]

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-4">
      {fields.map((field) => (
        <div key={field}>
          <label className="block text-xs font-semibold text-slate-300 mb-1 leading-tight">
            {SUMMARY_LABELS[field]}
          </label>
          <div className="bg-slate-800 rounded p-3 text-sm text-slate-300 min-h-[4rem] whitespace-pre-wrap leading-relaxed">
            {summary[field] || (
              <span className="text-slate-600 italic">No feedback provided</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
