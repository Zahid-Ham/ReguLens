import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PolicyImpactAreas({ policyAreas = [] }) {
  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#112117]">
            Frequently Affected Policy Areas
          </h3>
          <p className="text-[12px] text-[#55675C] mt-0.5">
            Internal policy areas most commonly impacted
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

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-[#6C7E72] uppercase tracking-wider pb-2 border-b border-[#F0F4EE]">
        <div className="col-span-7">Policy Area</div>
        <div className="col-span-5 text-right">Analyses Affected</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F6F8F5] my-auto">
        {policyAreas.map((item, idx) => (
          <div
            key={item.policy_area || idx}
            className="grid grid-cols-12 gap-2 items-center py-2.5 hover:bg-[#FAFBF9] rounded-lg transition-colors px-1"
          >
            {/* Policy Area Name */}
            <div className="col-span-7 truncate">
              <span className="text-[13px] font-medium text-[#112117] truncate block" title={item.policy_area}>
                {item.policy_area}
              </span>
            </div>

            {/* Analyses Affected (with green bar + count) */}
            <div className="col-span-5 flex items-center justify-end gap-2.5">
              <div className="w-20 h-2 rounded-full bg-[#F0F4EE] overflow-hidden hidden sm:block">
                <div
                  className="h-full rounded-full bg-[#1E4333] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(15, item.percentage || 25))}%`,
                  }}
                />
              </div>
              <span className="text-[13px] font-bold font-mono text-[#112117] w-5 text-right">
                {item.analyses_affected}
              </span>
            </div>
          </div>
        ))}

        {policyAreas.length === 0 && (
          <div className="py-6 text-center text-[12px] text-[#86978C]">
            No policy areas analyzed yet.
          </div>
        )}
      </div>
    </div>
  )
}
