import React from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, ArrowRight, PlusCircle } from 'lucide-react'

export default function InsightsEmptyState() {
  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto my-12 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#EDF4ED] text-[#132E22] flex items-center justify-center mx-auto mb-5 shadow-2xs">
        <Lightbulb className="w-7 h-7 text-[#1E4333]" />
      </div>
      
      <h2 className="text-2xl font-serif font-bold text-[#112117] mb-2 tracking-tight">
        No regulatory intelligence yet.
      </h2>
      
      <p className="text-[14px] text-[#55675C] mb-8 leading-relaxed max-w-md mx-auto">
        Run your first regulatory analysis to start building your global Insights workspace. Once analyses complete, trends, risk matrices, and advisory briefs will populate here automatically.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/analysis/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#132E22] hover:bg-[#1E4333] text-white text-[13px] font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/analysis/history"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F2F6F1] hover:bg-[#EAEFE8] text-[#132E22] text-[13px] font-semibold rounded-xl transition-colors border border-[#DCE8DC]"
        >
          <span>View Analysis History</span>
        </Link>
      </div>
    </div>
  )
}
