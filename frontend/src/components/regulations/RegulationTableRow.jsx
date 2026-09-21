import React, { useState, useRef, useEffect } from 'react'
import { FileText, Eye, Download, MoreVertical, Play, Network, Copy, Check } from 'lucide-react'

export default function RegulationTableRow({
  doc,
  isSelected = false,
  onSelect,
  onView,
  onDownload,
  onUseInNewAnalysis,
  onInspectInNLP,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleCopyId = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(doc.document_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setMenuOpen(false)
  }

  // Category badge style generator
  const getCategoryBadgeClass = (category) => {
    const catLower = (category || '').toLowerCase()
    if (catLower.includes('priority sector') || catLower.includes('psl')) {
      return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
    }
    if (catLower.includes('kyc') || catLower.includes('aml')) {
      return 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]'
    }
    if (catLower.includes('risk')) {
      return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
    }
    if (catLower.includes('governance')) {
      return 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]'
    }
    if (catLower.includes('payment') || catLower.includes('digital')) {
      return 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]'
    }
    if (catLower.includes('it') || catLower.includes('cyber')) {
      return 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]'
    }
    return 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]'
  }

  const getStatusBadge = (status) => {
    const st = (status || 'Processed').toLowerCase()
    if (st === 'processed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
          Processed
        </span>
      )
    }
    if (st === 'processing') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] animate-pulse">
          Processing
        </span>
      )
    }
    if (st === 'failed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
          Failed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
        Pending
      </span>
    )
  }

  const isPdf = (doc.filename || '').toLowerCase().endsWith('.pdf')

  return (
    <tr
      onClick={() => onSelect(doc)}
      className={`group cursor-pointer border-b border-[#F0F4EF] hover:bg-[#F7FAF6] transition-colors ${
        isSelected ? 'bg-[#EEF6EC] border-l-4 border-l-[#132E22]' : ''
      }`}
    >
      {/* Document Name & Subtitle */}
      <td className="py-3 px-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* File Icon */}
          <div
            className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5 ${
              isPdf
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-sky-50 text-sky-600 border border-sky-200'
            }`}
          >
            {isPdf ? 'PDF' : 'DOC'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-[#112117] group-hover:text-[#132E22] line-clamp-1">
              {doc.title || doc.filename}
            </div>
            <div className="text-[11px] text-[#718277] mt-0.5 line-clamp-1">
              {doc.title_candidate || doc.description || doc.filename}
            </div>
          </div>
        </div>
      </td>

      {/* Regulator */}
      <td className="py-3 px-3 whitespace-nowrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]">
          {doc.regulator_code || 'RBI'}
        </span>
      </td>

      {/* Category */}
      <td className="py-3 px-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getCategoryBadgeClass(
            doc.category
          )}`}
        >
          {doc.category || 'Regulatory Guidance'}
        </span>
      </td>

      {/* Version / Year */}
      <td className="py-3 px-3 whitespace-nowrap text-xs text-[#48594F] font-mono">
        {doc.version_year || '—'}
      </td>

      {/* Effective Date */}
      <td className="py-3 px-3 whitespace-nowrap text-xs text-[#55675C]">
        {doc.effective_date || '—'}
      </td>

      {/* Status */}
      <td className="py-3 px-3 whitespace-nowrap">
        {getStatusBadge(doc.status)}
      </td>

      {/* Actions */}
      <td className="py-3 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          {/* View in Drawer / Details */}
          <button
            type="button"
            onClick={() => onView(doc)}
            className="p-1.5 rounded-md text-[#718277] hover:text-[#112117] hover:bg-[#EAEFE8] transition-colors"
            title="Inspect document details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={() => onDownload(doc)}
            className="p-1.5 rounded-md text-[#718277] hover:text-[#112117] hover:bg-[#EAEFE8] transition-colors"
            title="Download document PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* More options dropdown */}
          <div className="relative inline-block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[#718277] hover:text-[#112117] hover:bg-[#EAEFE8] transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E0E8DE] rounded-lg shadow-lg z-30 py-1 text-left text-xs text-[#19221C]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onUseInNewAnalysis(doc)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F4F7F3] text-left text-[#132E22] font-medium"
                >
                  <Play className="w-3.5 h-3.5 text-[#132E22]" />
                  <span>Use in New Analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onInspectInNLP(doc)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F4F7F3] text-left"
                >
                  <Network className="w-3.5 h-3.5 text-[#55675C]" />
                  <span>Inspect in NLP Explorer</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyId}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F4F7F3] text-left border-t border-[#F0F4EF]"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#55675C]" />
                  )}
                  <span>{copied ? 'Copied ID!' : 'Copy Document ID'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}
