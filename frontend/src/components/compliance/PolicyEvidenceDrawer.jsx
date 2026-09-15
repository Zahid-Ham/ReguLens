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
  HelpCircle,
  Layers,
  Loader2,
} from 'lucide-react'

export function PolicyEvidenceDrawer({
  mappingRecord,
  isOpen,
  onClose,
  onExplainRecord,
  isExplaining,
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !mappingRecord) return null

  const {
    mapping_id,
    regulatory_evidence,
    policy_evidence,
    compliance_status,
    severity,
    gap_type,
    gap_details,
    gap_description,
    mismatches = [],
    parameter_mismatches = [],
    ai_explanation,
    ai_recommendation,
  } = mappingRecord

  const diffList = mismatches.length > 0 ? mismatches : parameter_mismatches
  const gapText = gap_details || gap_description

  const isCompliant = compliance_status === 'COMPLIANT'
  const isPartial = compliance_status === 'PARTIAL_MATCH'
  const isNonCompliant = compliance_status === 'NON_COMPLIANT'
  const isNoMatch = compliance_status === 'NO_MATCH_FOUND'

  const handleCopy = () => {
    const summaryText = `[ReguLens Compliance Evidence]
Regulatory Mandate: ${regulatory_evidence?.provision_id || 'N/A'} (Doc: ${regulatory_evidence?.document_id || 'N/A'}, Clause: ${regulatory_evidence?.clause_id || 'N/A'})
Text: "${regulatory_evidence?.clause_text || 'N/A'}"

Company Policy: ${policy_evidence?.section_id || 'N/A'} - ${policy_evidence?.section_title || 'N/A'} (Doc: ${policy_evidence?.document_id || 'N/A'})
Text: "${policy_evidence?.clause_text || 'N/A'}"

Status: ${compliance_status} | Severity: ${severity} | Gap Type: ${gap_type || 'None'}
Gap Description: ${gapText || 'None'}
${ai_explanation ? `\nAdvisory Explanation: ${ai_explanation}` : ''}
${ai_recommendation ? `\nRemediation Guidance: ${ai_recommendation}` : ''}`

    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div className="relative w-full max-w-2xl bg-white border-l border-[#E0E8DE] shadow-2xl h-full flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E2EBE0] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#112117]">Compliance Evidence Record</h3>
                <span className="text-[10px] font-mono font-semibold text-[#55675C] bg-[#FAFBF9] px-2 py-0.5 rounded border border-[#E0E8DE]">
                  {mapping_id}
                </span>
              </div>
              <p className="text-xs text-[#55675C] mt-0.5">
                Exact regulatory requirement mapped against internal company policy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#55675C] hover:text-[#112117] hover:bg-[#FAFBF9] border border-transparent hover:border-[#E0E8DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1 bg-white">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 shadow-2xs ${
              isCompliant
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : isNonCompliant
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : isPartial
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-slate-100 border-slate-200 text-slate-900'
            }`}
          >
            <div className="mt-0.5">
              {isCompliant && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isNonCompliant && <AlertOctagon className="w-5 h-5 text-rose-600" />}
              {isPartial && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {isNoMatch && <HelpCircle className="w-5 h-5 text-slate-600" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  {isCompliant && 'Fully Compliant Determination'}
                  {isNonCompliant && 'Potential Compliance Gap — Action Required'}
                  {isPartial && 'Partial Alignment — Scope / Specificity Gap'}
                  {isNoMatch && 'Unmapped Regulatory Mandate'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white border border-current shadow-2xs">
                  {severity} RISK
                </span>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                {gapText ||
                  (isCompliant
                    ? 'All extracted parameters and semantic constraints match between the regulation and policy.'
                    : 'Discrepancy detected during deterministic rule evaluation.')}
              </p>
            </div>
          </div>

          {/* Side-by-Side Evidence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Regulatory Requirement Card */}
            <div className="p-4 rounded-xl bg-[#FAFBF9] border border-blue-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <FileText className="w-4 h-4" />
                  <span>Regulatory Requirement</span>
                </div>
                {regulatory_evidence?.provision_id && (
                  <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {regulatory_evidence.provision_id}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[#55675C] font-mono space-y-0.5">
                <div>Document: {regulatory_evidence?.document_id || 'Current Regulation'}</div>
                <div>Clause ID: {regulatory_evidence?.clause_id || 'N/A'}</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#E2EBE0] text-xs text-[#112117] leading-relaxed font-serif shadow-2xs">
                "{regulatory_evidence?.clause_text}"
              </div>
            </div>

            {/* Company Policy Card */}
            <div className="p-4 rounded-xl bg-[#FAFBF9] border border-emerald-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Layers className="w-4 h-4" />
                  <span>Company Policy</span>
                </div>
                {policy_evidence?.section_id && (
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {policy_evidence.section_id}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[#55675C] font-mono space-y-0.5">
                <div>Document: {policy_evidence?.document_id || 'Internal Policy'}</div>
                <div>Title: {policy_evidence?.section_title || 'N/A'}</div>
              </div>

              {policy_evidence?.clause_text ? (
                <div className="p-3 rounded-lg bg-white border border-[#E2EBE0] text-xs text-[#112117] leading-relaxed font-serif shadow-2xs">
                  "{policy_evidence.clause_text}"
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-white border border-dashed border-[#CAD8C9] text-center text-xs text-[#88998C] italic">
                  No corresponding clause exists in the uploaded company policy.
                </div>
              )}
            </div>
          </div>

          {/* Parameter Comparison Table */}
          {diffList && diffList.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#112117] uppercase tracking-wider">
                Parameter Discrepancy Breakdown
              </h4>
              <div className="rounded-xl border border-[#E0E8DE] bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E0E8DE] bg-[#FAFBF9] text-[11px] font-semibold text-[#55675C] uppercase">
                      <th className="py-2.5 px-3">Dimension</th>
                      <th className="py-2.5 px-3">Regulatory Mandate</th>
                      <th className="py-2.5 px-3">Company Policy</th>
                      <th className="py-2.5 px-3">Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EBE0]">
                    {diffList.map((m, i) => (
                      <tr key={i} className="hover:bg-[#FAFBF9]">
                        <td className="py-2.5 px-3 font-bold text-rose-700">{m.dimension}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-700 bg-blue-50/50">
                          {m.regulatory_value || 'None'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-amber-700 bg-amber-50/50">
                          {m.policy_value || 'None'}
                        </td>
                        <td className="py-2.5 px-3 text-[#55675C]">{m.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Advisory Guidance */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-blue-50/60 border border-blue-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-[#112117]">AI Advisory Guidance</h4>
                <span className="text-[10px] text-blue-700 font-bold px-2 py-0.2 rounded-full bg-blue-100 border border-blue-200">
                  Groq Advisory Layer
                </span>
              </div>

              {!ai_explanation && onExplainRecord && (
                <button
                  onClick={() => onExplainRecord(mapping_id)}
                  disabled={isExplaining}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 transition-all shadow-2xs disabled:opacity-50"
                >
                  {isExplaining ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Explain with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {ai_explanation ? (
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-lg bg-white border border-blue-200/80 text-xs text-[#112117] leading-relaxed shadow-2xs">
                  <span className="font-bold text-blue-800 block mb-1">Advisory Explanation:</span>
                  {ai_explanation}
                </div>

                {ai_recommendation && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed shadow-2xs">
                    <span className="font-bold text-emerald-800 block mb-1">
                      Remediation Suggestion:
                    </span>
                    {ai_recommendation}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#55675C] italic">
                Deterministic findings are verified above. Click "Explain with AI" for synthesized remediation steps.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E2EBE0] p-4 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#112117] bg-[#FAFBF9] border border-[#E0E8DE] hover:bg-[#F4F7F4] shadow-2xs active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied Evidence!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#55675C]" />
                <span>Copy Evidence Summary</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  )
}
