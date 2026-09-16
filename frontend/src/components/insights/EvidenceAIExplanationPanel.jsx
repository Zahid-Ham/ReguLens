import React, { useState } from 'react'
import {
  X,
  FileText,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Shield,
  Lightbulb,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

export function EvidenceAIExplanationPanel({
  evidence,
  onClose,
  onOpenDocument,
}) {
  const [copiedSection, setCopiedSection] = useState(null)

  if (!evidence) return null

  const {
    title,
    severity = 'HIGH',
    subtitle,
    difference_summary,
    regulatory_evidence = {},
    policy_evidence = {},
    compliance_status = 'NON_COMPLIANT',
    gap_type,
    parameter_mismatches = [],
    ai_explanation,
    ai_recommendation,
  } = evidence

  const handleCopyText = (text, sectionKey) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedSection(sectionKey)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const isHigh = severity === 'HIGH'
  const isCompliant = compliance_status === 'COMPLIANT'

  // Default parameters if parameter_mismatches is empty
  const paramList =
    parameter_mismatches && parameter_mismatches.length > 0
      ? parameter_mismatches
      : [
          {
            dimension: 'Review Frequency',
            regulatory_value: '12 months',
            policy_value: '24 months',
            explanation: 'Policy Less Strict',
          },
        ]

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#F0F4EE]">
        <h3 className="text-xs font-bold text-[#112117] tracking-tight">
          Evidence & AI Explanation
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#55675C] hover:text-[#112117] hover:bg-[#FAFBF9] cursor-pointer"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Item Card Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-[#112117] leading-snug">
              {title || `Provision ${regulatory_evidence?.provision_id || '3.2'}`}
            </h4>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
              isHigh
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {severity}
          </span>
        </div>

        <p className="text-[11px] text-[#55675C] pl-7">
          {difference_summary || subtitle || 'Regulation requires 12 months vs policy 24 months'}
        </p>
      </div>

      {/* 1. Regulatory Evidence Card */}
      <div className="bg-[#FAFBF9] border border-blue-200/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
            <FileText className="w-3.5 h-3.5" />
            <span>Regulatory Evidence</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div>
            <span className="font-bold text-[#112117] block">
              {regulatory_evidence?.document_title || 'Current Regulation (2025)'}
            </span>
            <span className="text-[#55675C] font-mono text-[10px]">
              Clause {regulatory_evidence?.clause_id || '3.2.1'} | Provision {regulatory_evidence?.provision_id || '3.2'}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              handleCopyText(regulatory_evidence?.clause_text, 'reg')
            }
            className="p-1 rounded text-[#55675C] hover:text-[#112117] hover:bg-white border border-transparent hover:border-[#E0E8DE] cursor-pointer"
            title="Copy regulatory snippet"
          >
            {copiedSection === 'reg' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-[#E2EBE0] text-xs text-[#112117] leading-relaxed font-serif italic">
          "{regulatory_evidence?.clause_text || 'High-risk customers shall be reviewed at least once every 12 months to ensure ongoing due diligence and risk assessment.'}"
        </div>

        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={() =>
              onOpenDocument &&
              onOpenDocument(regulatory_evidence?.clause_id || 'psl-2025-001')
            }
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open in Document</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Company Policy Evidence Card */}
      <div className="bg-[#FAFBF9] border border-emerald-200/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <FileText className="w-3.5 h-3.5" />
            <span>Company Policy Evidence</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div>
            <span className="font-bold text-[#112117] block">
              {policy_evidence?.document_title || 'Aarohan Finance CDD Policy'}
            </span>
            <span className="text-[#55675C] font-mono text-[10px]">
              {policy_evidence?.section_id || 'Section 4.1'} | Clause {policy_evidence?.clause_id || '4.1.2'}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              handleCopyText(policy_evidence?.clause_text, 'pol')
            }
            className="p-1 rounded text-[#55675C] hover:text-[#112117] hover:bg-white border border-transparent hover:border-[#E0E8DE] cursor-pointer"
            title="Copy policy snippet"
          >
            {copiedSection === 'pol' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {policy_evidence?.clause_text ? (
          <div className="p-2.5 rounded-lg bg-white border border-[#E2EBE0] text-xs text-[#112117] leading-relaxed font-serif italic">
            "{policy_evidence.clause_text}"
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-white border border-dashed border-[#CAD8C9] text-center text-xs text-[#88998C] italic">
            No matching company policy clause found.
          </div>
        )}

        {policy_evidence?.clause_text && (
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() =>
                onOpenDocument &&
                onOpenDocument(policy_evidence?.clause_id || 'pol-001')
              }
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open in Document</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Parameter Comparison Table */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#112117]">
          <span>Parameter Comparison</span>
        </div>

        <div className="rounded-xl border border-[#E0E8DE] bg-white overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E0E8DE] bg-[#FAFBF9] text-[10px] font-bold text-[#55675C] uppercase">
                <th className="py-2 px-2.5">Parameter</th>
                <th className="py-2 px-2.5">Regulatory Requirement</th>
                <th className="py-2 px-2.5">Company Policy</th>
                <th className="py-2 px-2.5">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EBE0]">
              {paramList.map((p, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-2.5 font-semibold text-[#112117]">
                    {p.dimension || 'Review Frequency'}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-blue-700">
                    {p.regulatory_value || '12 months'}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-amber-700">
                    {p.policy_value || '24 months'}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {p.explanation || 'Policy Less Strict'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AI Explanation (Advisory) Card */}
      <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Explanation (Advisory)</span>
        </div>

        <p className="text-xs text-[#2E1A47] leading-relaxed">
          {ai_explanation ||
            'The regulation requires high-risk customers to be reviewed at least once every 12 months, whereas the company policy sets a 24-month review cycle. This creates a potential compliance gap as the policy is less frequent than the regulatory requirement, which may result in inadequate monitoring of high-risk customers.'}
        </p>
      </div>

      {/* 5. Recommended Actions (Advisory) Card */}
      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Recommended Actions (Advisory)</span>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-[#452B0E]">
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            1
          </span>
          <p className="leading-relaxed font-medium">
            {ai_recommendation ||
              'Update Policy Section 4.1.2 to align with the 12-month review requirement for high-risk customers.'}
          </p>
        </div>
      </div>
    </div>
  )
}
