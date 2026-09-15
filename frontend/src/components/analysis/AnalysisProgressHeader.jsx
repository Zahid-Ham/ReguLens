import React from 'react'
import { Square, Loader2 } from 'lucide-react'

export default function AnalysisProgressHeader({
  progress = 42,
  currentDocName = 'RBI PSL Guidelines (2025)',
  elapsedTime = '00:01:24',
  estimatedTime = '00:03:20',
  onCancel,
}) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Left: Animated Circular Progress Ring + Status Copy */}
      <div className="flex items-center gap-5">
        {/* Circular Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            {/* Background Track */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#EDF4ED"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#132E22"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Centered Percentage */}
          <span className="absolute text-[15px] font-bold text-[#112117] tracking-tight">
            {progress}%
          </span>
        </div>

        {/* Status Texts */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-[17px] font-semibold text-[#112117] tracking-tight">
              Processing documents...
            </h3>
          </div>
          <p className="text-[12.5px] text-[#55675C] mt-0.5 font-medium">
            Analyzing {currentDocName}
          </p>
        </div>
      </div>

      {/* Right: Timing Information + Cancel Analysis Button */}
      <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-[#EAEFE8]">
        {/* Elapsed Time */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-medium text-[#65776B]">Elapsed Time</span>
          <span className="text-sm font-semibold text-[#112117] font-mono mt-0.5">
            {elapsedTime}
          </span>
        </div>

        <div className="hidden sm:block w-px h-8 bg-[#EAEFE8]" />

        {/* Estimated Time */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-medium text-[#65776B]">Estimated Time</span>
          <span className="text-sm font-semibold text-[#112117] font-mono mt-0.5">
            {estimatedTime}
          </span>
        </div>

        {/* Cancel Analysis Button */}
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAFBF9] text-[#243329] hover:text-[#C93B3B] border border-[#CCD7CB] hover:border-[#F2BEBE] rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer focus:outline-none"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Cancel Analysis</span>
        </button>
      </div>
    </div>
  )
}
