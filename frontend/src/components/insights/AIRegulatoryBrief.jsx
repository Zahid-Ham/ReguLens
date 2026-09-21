import React from 'react'
import { Link } from 'react-router-dom'
import { Info, FileText, ArrowRight, Sparkles } from 'lucide-react'

export default function AIRegulatoryBrief({
  aiBrief = {},
  onRefresh = () => {},
  refreshing = false,
}) {
  const summary =
    aiBrief.summary_text ||
    'Across completed analyses, we observe an increasing regulatory focus on customer due diligence, reporting timelines, and digital verification requirements.'
  const disclaimer =
    aiBrief.disclaimer ||
    'These insights are AI-generated and should be used for guidance only. Deterministic analysis results remain the source of truth.'

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-[14px] font-bold text-[#112117] flex items-center gap-1.5 leading-snug">
          <Sparkles className="w-4 h-4 text-[#1E4333] flex-shrink-0" />
          <span>AI Regulatory Intelligence Brief</span>
        </h3>

        {/* Advisory Tag */}
        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wider uppercase bg-[#EBF3FC] text-[#2563EB] border border-[#BFDBFE] flex-shrink-0 mt-0.5">
          ADVISORY INSIGHTS
        </span>
      </div>

      {/* Main Text Content */}
      <div className="my-auto space-y-2.5 py-1">
        <p className="text-[12.5px] text-[#33463B] leading-relaxed font-sans">
          {summary}
        </p>

        {aiBrief.key_observations && aiBrief.key_observations.length > 0 && (
          <div className="space-y-1 pt-0.5">
            {aiBrief.key_observations.slice(0, 3).map((obs, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-[#4A5D51]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E4333] mt-1.5 flex-shrink-0" />
                <span className="leading-snug">{obs}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advisory Callout Box */}
      <div className="mt-3 pt-3 border-t border-[#F0F4EE] space-y-2.5">
        <div className="bg-[#F4F9F4] border border-[#DCEDDC] rounded-xl p-2.5 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-[#3D5A46] leading-snug font-sans">
            {disclaimer}
          </p>
        </div>

        {/* Action Button */}
        <Link
          to="/analysis/history"
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 bg-white hover:bg-[#F2F6F1] text-[#132E22] border border-[#DCE8DC] hover:border-[#B8D1BA] rounded-xl text-[12px] font-semibold transition-all duration-150 shadow-2xs group"
        >
          <FileText className="w-3.5 h-3.5 text-[#55675C] group-hover:text-[#132E22]" />
          <span>View Supporting Analyses</span>
          <ArrowRight className="w-3 h-3 text-[#55675C] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
