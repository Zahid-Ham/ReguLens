import React from 'react'
import { FileText, CheckCircle2, SlidersHorizontal, Lightbulb, Check } from 'lucide-react'

export default function AnalysisSummary({
  previousDocTitle = 'RBI PSL Guidelines 2020.pdf',
  currentDocTitle = 'RBI PSL Guidelines 2025.pdf',
  previousClausesCount = 312,
  currentClauseIndex = 24,
  currentClausesCount = 312,
  hasPolicy = false,
  policyDocTitle = 'ABC Bank - PSL Policy 2024.pdf',
}) {
  const configItems = [
    'Full document analysis',
    'Clause classification',
    'Requirement extraction',
    'Semantic comparison',
    'Materiality assessment',
  ]

  if (hasPolicy) {
    configItems.push('Policy matching enabled')
  }

  return (
    <div className="flex flex-col space-y-5">
      {/* 1. Analysis Summary Card */}
      <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs">
        <h4 className="text-[13.5px] font-semibold text-[#112117] tracking-tight mb-4">
          Analysis Summary
        </h4>

        <div className="space-y-3.5">
          {/* Document 1: Processed */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0]">
            <div className="w-8 h-8 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-[#112117] truncate leading-tight">
                {previousDocTitle}
              </span>
              <span className="text-[11.5px] text-[#2C634D] font-medium flex items-center gap-1 mt-0.5">
                <span>✓</span> Processed ({previousClausesCount} clauses)
              </span>
            </div>
          </div>

          {/* Document 2: In Progress */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0]">
            <div className="w-8 h-8 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-[#112117] truncate leading-tight">
                {currentDocTitle}
              </span>
              <span className="text-[11.5px] text-[#55675C] font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#2C634D] animate-pulse" />
                Processing... ({currentClauseIndex}/{currentClausesCount} clauses)
              </span>
            </div>
          </div>

          {/* Policy Document (If selected) */}
          {hasPolicy && (
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0]">
              <div className="w-8 h-8 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-[#112117] truncate leading-tight">
                  {policyDocTitle}
                </span>
                <span className="text-[11.5px] text-[#718277] font-medium mt-0.5">
                  Pending policy gap alignment
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Analysis Configuration Card */}
      <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs">
        <h4 className="text-[13.5px] font-semibold text-[#112117] tracking-tight mb-3">
          Analysis Configuration
        </h4>

        <div className="space-y-2">
          {configItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-[#334438]">
              <div className="w-4 h-4 rounded-full bg-[#EBF3EC] text-[#132E22] flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Educational Callout Card: Did you know? */}
      <div className="bg-[#EDF4ED]/90 border border-[#D8E6D8] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-[#DEECE0] text-[#132E22] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-[#1E4333]" />
        </div>
        <div className="flex flex-col">
          <h5 className="text-[13px] font-semibold text-[#112117] leading-tight mb-1">
            Did you know?
          </h5>
          <p className="text-[11.5px] text-[#485B4E] leading-relaxed">
            ReguLens uses domain-specific NLP models trained on legal and regulatory
            language to achieve higher accuracy in clause classification and requirement
            extraction.
          </p>
        </div>
      </div>
    </div>
  )
}
