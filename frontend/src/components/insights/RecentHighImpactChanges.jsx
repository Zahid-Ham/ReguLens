import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function RecentHighImpactChanges({ recentChanges = [] }) {
  const getBadgeStyle = (mat) => {
    const clean = String(mat).toUpperCase()
    if (clean === 'HIGH') {
      return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
    }
    if (clean === 'MEDIUM') {
      return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
    }
    return 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
  }

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#112117]">
            Recent High-Impact Changes
          </h3>
          <p className="text-[12px] text-[#55675C] mt-0.5">
            Key regulatory modifications across recent analyses
          </p>
        </div>
        <Link
          to="/analysis/history"
          className="text-[12px] font-semibold text-[#1E4333] hover:text-[#132E22] flex items-center gap-1 group flex-shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Changes List */}
      <div className="divide-y divide-[#F0F4EE] my-auto">
        {recentChanges.map((item, idx) => {
          const mat = item.materiality || 'HIGH'
          return (
            <Link
              key={item.id || idx}
              to={`/analysis/results?id=${item.analysis_id}&tab=changes`}
              className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-[#FAFBF9] rounded-lg transition-colors px-1 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Severity Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wider border flex-shrink-0 ${getBadgeStyle(
                    mat
                  )}`}
                >
                  {mat}
                </span>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[12px] font-semibold text-[#112117] group-hover:text-[#1E4333] transition-colors truncate block leading-snug"
                    title={item.description}
                  >
                    {item.description}
                  </span>
                  <span className="text-[10.5px] text-[#55675C] truncate block mt-0.5" title={item.analysis_title}>
                    {item.analysis_title}
                  </span>
                </div>
              </div>

              {/* Date */}
              <span className="text-[10.5px] font-medium text-[#86978C] flex-shrink-0 font-mono">
                {item.date}
              </span>
            </Link>
          )
        })}

        {recentChanges.length === 0 && (
          <div className="py-6 text-center text-[12px] text-[#86978C]">
            No recent regulatory changes available.
          </div>
        )}
      </div>
    </div>
  )
}
