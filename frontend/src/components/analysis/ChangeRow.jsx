import React, { useState } from 'react'
import { ChevronRight, ChevronDown, MoreVertical, FileText, Sparkles, ArrowRight } from 'lucide-react'

export default function ChangeRow({ record, onViewClause }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (!record) return null

  // Change Type styling
  const getChangeTypeBadge = (type) => {
    switch (type) {
      case 'MODIFIED':
        return 'bg-[#FDF0F0] text-[#B91C1C] border-[#FBD6D6]'
      case 'ADDED':
      case 'ADDED_CANDIDATE':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]'
      case 'REMOVED':
      case 'REMOVED_CANDIDATE':
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
      case 'WORDING_ONLY':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
      case 'ADMINISTRATIVE_CHANGE':
        return 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]'
      case 'UNCHANGED':
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
      default:
        return 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]'
    }
  }

  // Materiality badge styling
  const getMaterialityBadge = (materiality) => {
    switch (materiality) {
      case 'HIGH':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
      case 'LOW':
        return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
      case 'NONE':
        return 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
      default:
        return 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
    }
  }

  return (
    <>
      <tr className="border-b border-[#EAEFE8] hover:bg-[#FAFBF9] transition-colors group">
        {/* Expansion Toggle & Provision */}
        <td className="py-3 px-4 align-top">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-[#718276] hover:text-[#112117] hover:bg-[#EEF3EC] transition-colors focus:outline-none cursor-pointer flex-shrink-0"
              aria-label="Expand clause comparison"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="font-semibold text-xs text-[#112117] font-mono break-all">
              {record.provision}
            </span>
          </div>
        </td>

        {/* Title / Description */}
        <td className="py-3 px-4 align-top">
          <div className="flex flex-col min-w-0">
            <span className="text-[12.5px] font-semibold text-[#112117] leading-tight break-words">
              {record.title}
            </span>
            <span className="text-[11px] text-[#55675C] mt-0.5 leading-snug break-words line-clamp-2">
              {record.description}
            </span>
          </div>
        </td>

        {/* Change Type */}
        <td className="py-3 px-4 align-top">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${getChangeTypeBadge(
              record.changeType
            )}`}
          >
            {record.changeTypeLabel}
          </span>
        </td>

        {/* Key Change (Stacked / Wrapping below if long) */}
        <td className="py-3 px-4 align-top">
          {record.shiftOld && record.shiftNew ? (
            <div className="flex flex-col gap-1 min-w-0 max-w-full">
              <div className="flex items-center gap-1 flex-wrap text-[11px] font-mono leading-tight">
                <span className="bg-[#FDF2F2] text-[#991B1B] px-1.5 py-0.5 rounded border border-[#FCDADA] break-words">
                  {record.shiftOld}
                </span>
                <span className="text-[#88998D] text-[10px] font-bold">&rarr;</span>
                <span className="bg-[#EDF6EF] text-[#1B4332] px-1.5 py-0.5 rounded border border-[#D0E5D5] font-semibold break-words">
                  {record.shiftNew}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-[#1E3025] font-mono bg-[#FAFBF9] px-2 py-0.5 rounded-md border border-[#E4ECE2] inline-block max-w-full break-words leading-tight">
              {record.keyChange}
            </span>
          )}
        </td>

        {/* Materiality */}
        <td className="py-3 px-4 align-top">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${getMaterialityBadge(
              record.materiality
            )}`}
          >
            {record.materiality ? record.materiality.charAt(0) + record.materiality.slice(1).toLowerCase() : 'Low'}
          </span>
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right align-top">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onViewClause(record.id)}
              className="px-2.5 py-1 bg-white hover:bg-[#F0F5EF] text-[#132E22] hover:text-[#0E2319] border border-[#CAD8C9] rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            >
              View
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-md text-[#728477] hover:text-[#112117] hover:bg-[#EEF3EC] transition-colors focus:outline-none"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#DCE5DB] rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onViewClause(record.id)
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#2A3C30] hover:bg-[#F2F6F1] text-left cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Full Clause
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setIsExpanded(!isExpanded)
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#2A3C30] hover:bg-[#F2F6F1] text-left cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2C634D]" />
                    Compare In-Line
                  </button>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>

      {/* Expanded Comparative Text Section */}
      {isExpanded && (
        <tr className="bg-[#FAFBF9]/80 border-b border-[#EAEFE8]">
          <td colSpan={6} className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#E0E8DE] shadow-2xs mb-3">
              {/* Old Version Text */}
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#64766A] uppercase tracking-wider">
                    2020 Version
                  </span>
                  <span className="text-[10.5px] font-mono text-[#829388]">Old Provision</span>
                </div>
                <div className="p-3 bg-[#FAFBF9] rounded-lg border border-[#E8EFE7] text-xs text-[#334438] leading-relaxed break-words">
                  {record.oldText}
                </div>
              </div>

              {/* New Version Text */}
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#132E22] uppercase tracking-wider">
                    2025 Revised Version
                  </span>
                  <span className="text-[10.5px] font-mono text-[#2C634D]">New Provision</span>
                </div>
                <div className="p-3 bg-[#F4F9F4] rounded-lg border border-[#D5EADB] text-xs text-[#112117] leading-relaxed font-medium break-words">
                  {record.newText}
                </div>
              </div>
            </div>

            {/* Explanation & NLP Attribution */}
            <div className="flex items-start gap-2.5 px-1 text-xs text-[#45574B] leading-relaxed break-words">
              <span className="font-semibold text-[#132E22] flex-shrink-0">NLP Analysis:</span>
              <span className="break-words">{record.explanation}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
