import React from 'react'
import { FileUp, ArrowRight, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PolicyEmptyState() {
  return (
    <div className="rounded-2xl border border-[#E0E8DE] bg-white p-8 sm:p-10 text-center space-y-4 max-w-2xl mx-auto my-6 shadow-xs">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
        <Layers className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[#112117]">No Company Policy Linked</h3>
        <p className="text-xs text-[#55675C] leading-relaxed max-w-md mx-auto">
          Upload an internal company policy PDF during analysis setup to automatically align regulatory changes against your organization's internal controls, detect parameter discrepancies, and generate remediation guidance.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/analysis/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
        >
          <FileUp className="w-4 h-4" />
          <span>Start New Analysis with Company Policy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
