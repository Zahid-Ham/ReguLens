import React from 'react'
import { FileText, Clock, Settings, ArrowRight, Sparkles } from 'lucide-react'
import ChangeDistribution from './ChangeDistribution'

export default function AnalysisDetails({
  metadata,
  chartData = [],
  totalChanges = 63,
  onViewDetailedAnalysis,
  onViewConfig,
}) {
  const prevDoc = metadata?.previousDocument || {
    title: 'rbi_psl_2020_official.pdf',
    clausesProcessed: 60,
  }

  const currDoc = metadata?.currentDocument || {
    title: 'rbi_a8d0f9a98495.pdf',
    clausesProcessed: 348,
  }

  const timestamp = metadata?.timestamp || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const scope = metadata?.configuration?.scope || 'Full document analysis'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left: Document Metadata & Analysis Run Details (6 cols on lg) */}
      <div className="lg:col-span-6 bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-[14px] font-semibold text-[#112117] tracking-tight mb-3.5">
            Analysis Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
            {/* Document 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0]">
              <div className="w-8 h-8 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-[#112117] truncate leading-tight">
                  {prevDoc.title}
                </span>
                <span className="text-[11.5px] text-[#55675C] mt-0.5">
                  {prevDoc.clausesProcessed} clauses processed
                </span>
              </div>
            </div>

            {/* Document 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFBF9] border border-[#E2EBE0]">
              <div className="w-8 h-8 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-[#112117] truncate leading-tight">
                  {currDoc.title}
                </span>
                <span className="text-[11.5px] text-[#55675C] mt-0.5">
                  {currDoc.clausesProcessed} clauses processed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps & Configuration Bottom Bar */}
        <div className="pt-3 border-t border-[#EEF3EC] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#4E6053]">
            <div className="w-6 h-6 rounded-md bg-[#F2F6F1] text-[#2C634D] flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#112117]">Analysis completed</span>
              <span className="text-[11px] text-[#697B70]">{timestamp}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#4E6053] sm:border-l sm:border-[#EEF3EC] sm:pl-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#F2F6F1] text-[#2C634D] flex items-center justify-center flex-shrink-0">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#112117]">Configuration</span>
                <span className="text-[11px] text-[#697B70]">{scope}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onViewConfig}
              className="text-xs font-semibold text-[#2C634D] hover:underline cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      </div>

      {/* Right: Change Distribution Donut Chart & Detailed Analysis Action (6 cols on lg) */}
      <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
        {/* Distribution Chart */}
        <ChangeDistribution chartData={chartData} totalChanges={totalChanges} />

        {/* Action Box */}
        <div className="bg-white border border-[#E0E8DE] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <h5 className="text-[13px] font-semibold text-[#112117]">
              Explore Clause-Level Intelligence
            </h5>
            <p className="text-[11.5px] text-[#55675C]">
              Inspect token attribution, dependency trees, and modality changes.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewDetailedAnalysis}
            className="py-2.5 px-4 bg-[#132E22] hover:bg-[#1E4333] text-[#FAFBF9] rounded-xl font-semibold text-xs sm:text-[12.5px] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap group active:scale-[0.99]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A2C7B1]" />
            <span>View Detailed Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
