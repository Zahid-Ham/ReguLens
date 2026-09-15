import React, { useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileText, CheckCircle2 } from 'lucide-react'

export default function CurrentClause({
  documentRole = 'current',
  documentTitle = 'Current Regulation',
  documentIndex = 2,
  clauseNumber = 'Clause 1.1',
  clauseIndex = 1,
  totalClauses = 89,
  text = '',
  highlightedToken = 'shall',
  isCompleted = false,
  selectedDocRole = 'current',
  onSelectDocRole,
  onPreviousClause,
  onNextClause,
  onSelectClauseIndex,
  previousCount = 77,
  currentCount = 89,
}) {
  // Keyboard navigation support for post-completion explorer
  useEffect(() => {
    if (!isCompleted) return

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (onPreviousClause) onPreviousClause()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (onNextClause) onNextClause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCompleted, onPreviousClause, onNextClause])

  // Render clause text with highlighted token chip
  const renderHighlightedText = () => {
    if (!text) return 'Waiting for clause text...'
    if (!highlightedToken) return text

    const parts = text.split(new RegExp(`(\\b${highlightedToken}\\b)`, 'gi'))

    return parts.map((part, i) => {
      if (part.toLowerCase() === highlightedToken.toLowerCase()) {
        return (
          <span
            key={i}
            className="inline-block px-1.5 py-0.5 mx-0.5 bg-[#D4EBD7] text-[#0E291C] font-semibold rounded border border-[#A4D4AB] shadow-2xs"
          >
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  const isPrevious = selectedDocRole === 'previous'

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs flex flex-col space-y-3.5 transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EAEFE8]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {!isCompleted && (
              <span className="w-2 h-2 rounded-full bg-[#2C634D] ring-4 ring-[#E4F0E3] animate-pulse" />
            )}
            <h4 className="text-[13.5px] font-semibold text-[#112117] tracking-tight">
              {isCompleted ? 'Clause Explorer' : 'Current Clause'}
            </h4>
          </div>

          <span className="text-[11px] font-medium text-[#4B5E51] bg-[#F0F5EF] px-2 py-0.5 rounded-md border border-[#DCE8DC]">
            {documentRole === 'previous' ? 'Previous Regulation' : 'Current Regulation'}
          </span>
        </div>

        {/* Post-Completion Document Switcher */}
        {isCompleted && onSelectDocRole && (
          <div className="flex items-center gap-1 bg-[#F2F6F1] p-0.5 rounded-xl border border-[#DFE9DE]">
            <button
              type="button"
              onClick={() => onSelectDocRole('previous')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedDocRole === 'previous'
                  ? 'bg-[#132E22] text-[#FAFBF9] shadow-2xs'
                  : 'text-[#4F6255] hover:text-[#112117] hover:bg-[#E7EFE6]'
              }`}
            >
              Previous ({previousCount})
            </button>
            <button
              type="button"
              onClick={() => onSelectDocRole('current')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedDocRole === 'current'
                  ? 'bg-[#132E22] text-[#FAFBF9] shadow-2xs'
                  : 'text-[#4F6255] hover:text-[#112117] hover:bg-[#E7EFE6]'
              }`}
            >
              Current ({currentCount})
            </button>
          </div>
        )}

        {/* Live Playback Badge (During Processing) */}
        {!isCompleted && (
          <span className="text-[11.5px] font-semibold text-[#2C634D] bg-[#EAF5EC] px-2.5 py-0.5 rounded-md border border-[#D5EADB]">
            Clause {clauseIndex} / {totalClauses}
          </span>
        )}
      </div>

      {/* Navigation Toolbar (Only when Complete) */}
      {isCompleted && (
        <div className="flex items-center justify-between gap-3 bg-[#FAFBF9] p-2.5 rounded-xl border border-[#E3ECE1]">
          {/* Previous Button */}
          <button
            type="button"
            onClick={onPreviousClause}
            disabled={clauseIndex <= 1}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              clauseIndex <= 1
                ? 'bg-[#F2F5F1] text-[#9EAEA1] border-[#E3ECE1] cursor-not-allowed opacity-60'
                : 'bg-white text-[#132E22] border-[#D0DED0] hover:bg-[#EDF4ED] hover:border-[#B8D0B8] shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Quick Dropdown / Jump Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#2C634D]">
              Clause {clauseIndex} of {totalClauses}
            </span>
            {totalClauses > 0 && onSelectClauseIndex && (
              <select
                value={clauseIndex}
                onChange={(e) => onSelectClauseIndex(Number(e.target.value))}
                aria-label="Select clause index"
                className="text-xs font-semibold text-[#132E22] bg-white border border-[#CCDCCD] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-[#2C634D] cursor-pointer"
              >
                {Array.from({ length: totalClauses }, (_, i) => i + 1).map((idx) => (
                  <option key={idx} value={idx}>
                    Clause {idx}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={onNextClause}
            disabled={clauseIndex >= totalClauses}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              clauseIndex >= totalClauses
                ? 'bg-[#F2F5F1] text-[#9EAEA1] border-[#E3ECE1] cursor-not-allowed opacity-60'
                : 'bg-white text-[#132E22] border-[#D0DED0] hover:bg-[#EDF4ED] hover:border-[#B8D0B8] shadow-2xs'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Clause Provision ID & Document Title Meta */}
      <div className="flex items-center justify-between text-xs text-[#526458]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#112117]">
            {clauseNumber || `Clause ${clauseIndex}`}
          </span>
          <span className="text-[#8D9E92]">•</span>
          <span className="truncate max-w-[240px] sm:max-w-[340px]">
            {documentTitle}
          </span>
        </div>
        {isCompleted && (
          <span className="text-[10.5px] text-[#6E8074] hidden sm:inline-block">
            Use ← / → keys to navigate
          </span>
        )}
      </div>

      {/* Clause Text Card with Smooth Subtle Transition */}
      <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E4ECE2] text-[13.5px] text-[#243329] leading-relaxed font-sans min-h-[72px] transition-all duration-200">
        &ldquo;{renderHighlightedText()}&rdquo;
      </div>
    </div>
  )
}

