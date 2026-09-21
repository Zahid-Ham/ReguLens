import React, { useState } from 'react'
import { FileText, Copy, Check, ExternalLink } from 'lucide-react'

export default function ClauseTextCard({
  clauseText = '',
  provisionId = '',
  clauseId = '',
  pageNumber = 1,
  onViewInDocument = () => {},
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!clauseText) return
    navigator.clipboard.writeText(clauseText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayBadge = provisionId ? `Clause ${provisionId}` : `Clause ${clauseId}`

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs relative flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1E4333]" />
          <h3 className="text-[14.5px] font-bold text-[#112117]">
            Clause Text
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy clause text"
            className="p-1.5 text-[#55675C] hover:text-[#132E22] hover:bg-[#F2F6F1] rounded-lg transition-colors cursor-pointer text-[12px] flex items-center gap-1 font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="text-[#16A34A] text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onViewInDocument}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F9F5] hover:bg-[#EBF2EA] text-[#132E22] border border-[#DCE8DC] rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#55675C]" />
            <span>View in Document</span>
          </button>
        </div>
      </div>

      {/* Main Quote & Badge */}
      <div className="my-auto py-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EBF4EC] text-[#132E22] border border-[#D0E2D2]">
            {displayBadge}
          </span>
          {pageNumber && (
            <span className="text-[11px] font-mono text-[#86978C]">
              Page {pageNumber}
            </span>
          )}
        </div>

        <blockquote className="text-[14px] text-[#223328] font-serif leading-relaxed italic border-l-2 border-[#1E4333] pl-3.5 py-1">
          &ldquo;{clauseText}&rdquo;
        </blockquote>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#F0F4EE] flex items-center justify-between text-[11px] text-[#86978C]">
        <span>Original Regulatory Formulation</span>
        <span>Exact Verbatim Extract</span>
      </div>
    </div>
  )
}
