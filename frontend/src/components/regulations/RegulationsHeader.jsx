import React from 'react'
import { Plus, Upload, RefreshCw } from 'lucide-react'

export default function RegulationsHeader({ onUploadClick, onRefresh, isRefreshing = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAEFE8]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#112117] tracking-tight">
          Regulations Library
        </h1>
        <p className="text-xs sm:text-sm text-[#55675C] mt-1">
          Browse and manage regulatory documents from available regulatory sources.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center p-2 rounded-lg border border-[#E0E8DE] bg-white text-[#55675C] hover:text-[#112117] hover:bg-[#F4F7F3] transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh documents"
            aria-label="Refresh documents"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#132E22]' : ''}`} />
          </button>
        )}

        <button
          type="button"
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#132E22] hover:bg-[#1E4333] active:bg-[#0B1E15] text-[#FAFBF9] text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#132E22] focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>
    </div>
  )
}
