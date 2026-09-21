import React, { useState } from 'react'
import { Code, Copy, Check, X } from 'lucide-react'

export function JSONOutputCard({ onOpenModal = () => {} }) {
  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-2">
        <Code className="w-4 h-4 text-[#1E4333]" />
        <h3 className="text-[14px] font-bold text-[#112117]">
          JSON Output
        </h3>
      </div>

      <p className="text-[12px] text-[#55675C] mb-4">
        View the structured NLP output for this clause.
      </p>

      <button
        type="button"
        onClick={onOpenModal}
        className="w-full py-2.5 px-4 bg-white hover:bg-[#F2F6F1] text-[#132E22] border border-[#DCE8DC] hover:border-[#B8D1BA] rounded-xl text-[12.5px] font-semibold transition-all duration-150 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
      >
        <span>View JSON</span>
      </button>
    </div>
  )
}

export default function JSONViewerModal({
  isOpen = false,
  onClose = () => {},
  rawJson = {},
  clauseId = '',
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const jsonString = JSON.stringify(rawJson, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B150F]/50 backdrop-blur-xs">
      <div className="bg-white border border-[#DCE8DC] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2EAE0] flex items-center justify-between bg-[#FAFBF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EBF4EC] text-[#132E22] flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#112117]">
                Clause NLP JSON Output
              </h3>
              <span className="text-[11px] text-[#55675C] font-mono">
                Clause: {clauseId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2F6F1] text-[#132E22] border border-[#DCE8DC] rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#55675C]" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#55675C] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal JSON Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] bg-[#0D1612]">
          <pre className="text-[12px] font-mono text-[#A7F3D0] leading-relaxed whitespace-pre-wrap">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  )
}
