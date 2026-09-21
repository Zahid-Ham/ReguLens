import React, { useState, useRef, useEffect } from 'react'
import { FileText, ChevronDown, Check, BookOpen } from 'lucide-react'

export default function NLPExplorerHeader({
  documents = [],
  selectedDocument = null,
  onSelectDocument = () => {},
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-2">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl sm:text-[34px] font-serif font-bold text-[#112117] tracking-tight">
          NLP Explorer
        </h1>
        <p className="text-[14px] text-[#55675C] mt-1">
          Explore how ReguLens processes and understands regulatory documents using advanced NLP.
        </p>
      </div>

      {/* Top-Right Document Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 bg-white border border-[#DCE8DC] hover:border-[#B8D1BA] rounded-xl px-4 py-2.5 shadow-2xs transition-all text-left group cursor-pointer"
        >
          {/* File Icon */}
          <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] text-[#2563EB] flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          {/* Document metadata display */}
          <div className="min-w-0 pr-2">
            <span className="text-[13px] font-bold text-[#112117] group-hover:text-[#1E4333] truncate block leading-tight">
              {selectedDocument?.filename || selectedDocument?.title || 'Select Regulation...'}
            </span>
            <span className="text-[11px] text-[#55675C] block mt-0.5 truncate">
              {selectedDocument?.regulator || 'RBI'} • {selectedDocument?.uploaded_date || selectedDocument?.effective_date || 'Catalog'}
            </span>
          </div>

          <ChevronDown className={`w-4 h-4 text-[#55675C] transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#DCE8DC] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
            <div className="px-3.5 py-2 border-b border-[#F0F4EE] text-[11px] font-semibold uppercase tracking-wider text-[#6C7E72]">
              Select Regulatory Document
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#F6F8F5]">
              {documents.map((doc) => {
                const isSelected = selectedDocument?.document_id === doc.document_id
                return (
                  <button
                    key={doc.document_id}
                    type="button"
                    onClick={() => {
                      onSelectDocument(doc)
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-[#F4F8F4] transition-colors ${
                      isSelected ? 'bg-[#EBF4EC]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`text-[12.5px] font-semibold block truncate ${isSelected ? 'text-[#132E22]' : 'text-[#112117]'}`}>
                        {doc.title}
                      </span>
                      <span className="text-[11px] text-[#55675C] block mt-0.5">
                        {doc.regulator} • {doc.document_type} • {doc.clause_count} clauses
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#1E4333] flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
