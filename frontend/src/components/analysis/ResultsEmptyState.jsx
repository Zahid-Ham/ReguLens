import React from 'react'
import { SearchX, RotateCcw } from 'lucide-react'

export default function ResultsEmptyState({ onReset }) {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-[#EDF4ED] text-[#132E22] flex items-center justify-center mb-4">
        <SearchX className="w-6 h-6 text-[#2C634D]" />
      </div>
      <h4 className="text-base font-semibold text-[#112117] mb-1">
        No changes found
      </h4>
      <p className="text-xs text-[#55675C] max-w-sm mb-5 leading-relaxed">
        Try adjusting your filters or search query to find matching regulatory provisions.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#132E22] hover:bg-[#1E4333] text-[#FAFBF9] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Clear Filters
      </button>
    </div>
  )
}
