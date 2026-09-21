import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function RegulatoryChangesTrend({
  trendData = [],
  granularity = 'monthly',
  onGranularityChange = () => {},
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Colors matching design system & reference
  const colors = {
    substantive: '#1E4333',
    administrative: '#3B82F6',
    wording_only: '#F59E0B',
    added_candidate: '#C084FC',
    removed_candidate: '#FB7185',
  }

  const maxVal = Math.max(
    ...trendData.map((d) => d.total || (d.substantive + d.administrative + d.wording_only + d.added_candidate + d.removed_candidate)),
    40
  )

  const formatAxisVal = (val) => {
    if (val >= 10000) return `${(val / 1000).toFixed(0)}k`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return `${val}`
  }

  // Scale height to 150px max bar height
  const chartHeight = 150

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-[15px] font-bold text-[#112117]">
            Regulatory Changes Trend
          </h3>
          <p className="text-[12px] text-[#55675C] mt-0.5">
            Number of regulatory changes detected over time
          </p>
        </div>

        {/* Granularity Selector */}
        <div className="relative inline-block">
          <div className="flex items-center gap-1.5 bg-[#F2F6F1] hover:bg-[#EAEFE8] border border-[#DCE8DC] rounded-lg px-2.5 py-1 text-[12px] font-medium text-[#132E22] transition-colors cursor-pointer">
            <select
              value={granularity}
              onChange={(e) => onGranularityChange(e.target.value)}
              className="bg-transparent border-none outline-none appearance-none pr-4 text-[#132E22] font-semibold cursor-pointer text-[12px]"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#55675C] absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative mt-2 my-auto">
        {/* Y Axis Guides */}
        <div className="flex flex-col justify-between absolute left-0 top-0 bottom-6 text-[10px] text-[#86978C] font-mono select-none pointer-events-none w-8 text-right pr-1">
          <span>{formatAxisVal(maxVal)}</span>
          <span>{formatAxisVal(Math.round(maxVal * 0.75))}</span>
          <span>{formatAxisVal(Math.round(maxVal * 0.5))}</span>
          <span>{formatAxisVal(Math.round(maxVal * 0.25))}</span>
          <span>0</span>
        </div>

        {/* Bars Container */}
        <div className="ml-10 mr-2 flex items-end justify-between gap-1.5 sm:gap-2 h-[150px] border-b border-[#E2EAE0] pb-1">
          {trendData.map((d, idx) => {
            const sH = (d.substantive / maxVal) * chartHeight
            const aH = (d.administrative / maxVal) * chartHeight
            const wH = (d.wording_only / maxVal) * chartHeight
            const addH = (d.added_candidate / maxVal) * chartHeight
            const remH = (d.removed_candidate / maxVal) * chartHeight

            return (
              <div
                key={d.period || idx}
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
              >
                {/* Tooltip */}
                {hoveredPoint === d && (
                  <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-[#112117] text-white text-[11px] rounded-lg p-2 shadow-lg z-20 whitespace-nowrap pointer-events-none border border-[#3E5346]">
                    <div className="font-bold border-b border-[#2C4234] pb-1 mb-1">{d.period} ({d.total || (d.substantive + d.administrative + d.wording_only + d.added_candidate + d.removed_candidate)} Total)</div>
                    <div className="text-[10px] space-y-0.5">
                      <div>Substantive: <span className="font-semibold">{d.substantive}</span></div>
                      <div>Administrative: <span className="font-semibold">{d.administrative}</span></div>
                      <div>Wording Only: <span className="font-semibold">{d.wording_only}</span></div>
                      <div>Added (Candidate): <span className="font-semibold">{d.added_candidate}</span></div>
                      <div>Removed (Candidate): <span className="font-semibold">{d.removed_candidate}</span></div>
                    </div>
                  </div>
                )}

                {/* Stacked Bar */}
                <div className="w-full max-w-[20px] flex flex-col-reverse rounded-t-sm overflow-hidden transition-all duration-150 group-hover:brightness-110">
                  {sH > 0 && <div style={{ height: `${sH}px`, backgroundColor: colors.substantive }} />}
                  {aH > 0 && <div style={{ height: `${aH}px`, backgroundColor: colors.administrative }} />}
                  {wH > 0 && <div style={{ height: `${wH}px`, backgroundColor: colors.wording_only }} />}
                  {addH > 0 && <div style={{ height: `${addH}px`, backgroundColor: colors.added_candidate }} />}
                  {remH > 0 && <div style={{ height: `${remH}px`, backgroundColor: colors.removed_candidate }} />}
                </div>

                {/* X Axis Label */}
                <span className="text-[10.5px] font-medium text-[#55675C] mt-2 truncate w-full text-center">
                  {d.period}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Categorized Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-[#F0F4EE] text-[10.5px] font-medium text-[#4A5D51]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-2xs bg-[#1E4333]" />
          <span>Substantive</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-2xs bg-[#3B82F6]" />
          <span>Administrative</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-2xs bg-[#F59E0B]" />
          <span>Wording Only</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-2xs bg-[#C084FC]" />
          <span>Added (Candidate)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-2xs bg-[#FB7185]" />
          <span>Removed (Candidate)</span>
        </div>
      </div>
    </div>
  )
}
