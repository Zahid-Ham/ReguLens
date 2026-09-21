import React from 'react'
import { AlertCircle, RefreshCw, BookOpen } from 'lucide-react'

export default function RegulationEmptyState({
  title = 'No documents found',
  description = 'Try adjusting your search query or filter options to locate regulatory directives.',
  isError = false,
  onRetry,
}) {
  return (
    <div className="bg-white border border-[#EAEFE8] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
          isError ? 'bg-rose-50 text-rose-600' : 'bg-[#EDF4ED] text-[#132E22]'
        }`}
      >
        {isError ? <AlertCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#112117] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#55675C] mb-5 leading-relaxed">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      )}
    </div>
  )
}
