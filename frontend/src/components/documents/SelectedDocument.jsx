import React, { useState } from 'react'
import { FileText, CheckCircle2, MoreVertical, Trash2, ExternalLink, Download } from 'lucide-react'

export default function SelectedDocument({ document, onRemove, label = 'Selected Document' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (!document) return null

  // Prioritize distinct filename for uploaded files, title for library files
  const displayName = document.filename || document.title || document.name || 'Regulatory Document'
  const displaySub = `${document.size || 'PDF'} · ${document.type || 'PDF'}${
    document.clausesCount ? ` · ${document.clausesCount} Clauses` : ''
  }`

  return (
    <div className="relative mt-3 p-3.5 bg-white border border-[#DCE5DB] rounded-xl flex items-center justify-between shadow-2xs group hover:border-[#CAD8C9] transition-all">
      {/* Left: Red File Icon + Filename & Size */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {/* PDF / Document Icon Badge */}
        <div className="w-9 h-9 rounded-lg bg-[#FDF2F2] border border-[#FAD8D8] flex items-center justify-center flex-shrink-0 text-[#C93B3B]">
          <FileText className="w-5 h-5" />
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col min-w-0">
          <span className="text-[13.5px] font-semibold text-[#112117] truncate leading-tight" title={displayName}>
            {displayName}
          </span>
          <span className="text-[11.5px] text-[#5A6D61] mt-0.5 font-medium">
            {displaySub}
          </span>
        </div>
      </div>


      {/* Right: Verified Green Checkmark + Action Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#2C634D] flex items-center justify-center" title="Document loaded and verified for NLP extraction">
          <CheckCircle2 className="w-4 h-4 text-[#2C634D]" />
        </div>

        {/* More Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[#667A6D] hover:text-[#112117] hover:bg-[#F0F5EF] transition-colors focus:outline-none"
            aria-label="Document options"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#DCE5DB] rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  if (onRemove) onRemove()
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-[12.5px] text-[#C93B3B] hover:bg-[#FDF2F2] transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
