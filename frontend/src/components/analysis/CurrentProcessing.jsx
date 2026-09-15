import React from 'react'
import { FileText } from 'lucide-react'

export default function CurrentProcessing({
  documentTitle = 'RBI PSL Guidelines 2025.pdf',
  documentIndex = 2,
  totalDocuments = 2,
  clauseProgress = 'Processing clause 24 of 312',
  progressPercent = 7,
}) {
  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2C634D] ring-4 ring-[#E4F0E3] animate-pulse" />
          <h4 className="text-[13.5px] font-semibold text-[#112117] tracking-tight">
            Currently Processing
          </h4>
        </div>
        <span className="text-[11.5px] font-medium text-[#5E7063] bg-[#F2F6F1] px-2.5 py-0.5 rounded-md">
          Document {documentIndex} of {totalDocuments}
        </span>
      </div>

      {/* Document Meta Row */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-9 h-9 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13.5px] font-semibold text-[#112117] truncate leading-tight">
            {documentTitle}
          </span>
          <span className="text-[11.5px] text-[#55675C] mt-0.5">
            {clauseProgress}
          </span>
        </div>
      </div>

      {/* Progress Bar with Percentage */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-[#EDF4ED] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#132E22] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-[#55675C] w-7 text-right">
          {progressPercent}%
        </span>
      </div>
    </div>
  )
}
