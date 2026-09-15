import React, { useState } from 'react'
import {
  Sparkles,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  Loader2,
} from 'lucide-react'

export function ComplianceInsightsPanel({
  summary,
  analysisId,
  onGenerateInsights,
  onViewEvidence,
  isLoadingInsights,
}) {
  if (!summary) return null

  const {
    executive_summary,
    top_gaps = [],
    top_recommendations = [],
    policy_recommendations = [],
    policy_gaps = 0,
    total_regulatory_requirements = 0,
  } = summary

  const recommendations = top_recommendations.length > 0 ? top_recommendations : policy_recommendations

  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (onGenerateInsights) {
      setGenerating(true)
      try {
        await onGenerateInsights()
      } finally {
        setGenerating(false)
      }
    }
  }

  const isBusy = isLoadingInsights || generating

  return (
    <div className="rounded-2xl border border-[#E0E8DE] bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2EBE0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#112117] tracking-tight">Compliance Insights AI</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Advisory Insights
              </span>
            </div>
            <p className="text-xs text-[#55675C] mt-0.5">
              Deterministic NLP remains source of truth · AI advisory synthesized from exact evidence
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Advisory AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{executive_summary ? 'Refresh Advisory Insights' : 'Generate Detailed Insights'}</span>
            </>
          )}
        </button>
      </div>

      {/* Executive Summary Card */}
      {executive_summary ? (
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Executive Compliance Summary</span>
          </div>
          <p className="text-xs text-[#334155] leading-relaxed">{executive_summary}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-dashed border-[#CAD8C9] text-center space-y-1">
          <p className="text-xs text-[#55675C]">
            {policy_gaps > 0
              ? `Deterministic NLP identified ${policy_gaps} potential compliance gaps across ${total_regulatory_requirements} enforceable regulatory mandates.`
              : 'Deterministic evaluation complete. Click above to generate LLM advisory summary.'}
          </p>
        </div>
      )}

      {/* Two Column Grid: Top Gaps & Policy Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Compliance Gaps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h4 className="text-[13px] font-bold text-[#112117]">Top Compliance Gaps</h4>
            </div>
            <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              {top_gaps.length} critical items
            </span>
          </div>

          <div className="space-y-2.5">
            {top_gaps.length > 0 ? (
              top_gaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-red-100 hover:border-red-300 shadow-2xs transition-all space-y-1.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#112117] line-clamp-1">
                        {gap.provision_id || `Gap #${idx + 1}`} — {gap.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        gap.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : gap.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {gap.severity} RISK
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[#55675C] leading-relaxed line-clamp-2">
                    {gap.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#55675C]">
                      Policy: <span className="text-[#112117] font-semibold font-mono">{gap.policy_section || 'Unmapped'}</span>
                    </span>
                    {onViewEvidence && gap.mapping_id && (
                      <button
                        onClick={() => onViewEvidence(gap.mapping_id)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold group-hover:underline"
                      >
                        <span>View Evidence</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0] text-center text-xs text-[#55675C]">
                No critical compliance gaps detected.
              </div>
            )}
          </div>
        </div>

        {/* Policy Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <h4 className="text-[13px] font-bold text-[#112117]">Policy Recommendations</h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {recommendations.length} action steps
            </span>
          </div>

          <div className="space-y-2.5">
            {recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#112117] line-clamp-1">
                        {rec.title || rec.recommendation || `Recommendation #${idx + 1}`}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        rec.priority === 'HIGH' || rec.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : rec.priority === 'MEDIUM' || rec.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {rec.priority || 'ACTION'}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[#334155] leading-relaxed">
                    {rec.action_summary || rec.recommendation}
                  </p>

                  {(rec.target_section || rec.policy_section) && (
                    <div className="text-[11px] text-[#55675C]">
                      Target Section:{' '}
                      <span className="font-semibold font-mono text-[#112117]">
                        {rec.target_section || rec.policy_section}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-5 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0] text-center text-xs text-[#55675C]">
                No remediation actions required.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
