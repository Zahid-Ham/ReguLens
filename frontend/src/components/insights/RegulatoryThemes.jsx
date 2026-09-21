import React from 'react'

export default function RegulatoryThemes({ themes = [] }) {
  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div>
        <h3 className="text-[15px] font-bold text-[#112117]">
          Regulatory Themes (NLP Analysis)
        </h3>
        <p className="text-[12px] text-[#55675C] mt-0.5">
          Most common regulatory concepts across all analyses
        </p>
      </div>

      {/* Themes List */}
      <div className="space-y-3 my-auto py-2">
        {themes.map((item, idx) => (
          <div key={item.theme || idx} className="space-y-1">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-[#223328] truncate">
                {item.theme}
              </span>
              <span className="font-bold font-mono text-[#112117]">
                {item.count}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-[#F0F4EE] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1E4333] transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(10, item.percentage || 15))}%`,
                }}
              />
            </div>
          </div>
        ))}

        {themes.length === 0 && (
          <div className="py-6 text-center text-[12px] text-[#86978C]">
            No NLP concepts extracted yet.
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-2 border-t border-[#F0F4EE] text-[11px] text-[#55675C] flex items-center justify-between">
        <span>Extracted from provisions & deontic functions</span>
        <span className="font-medium text-[#1E4333]">NLP Entity Extraction</span>
      </div>
    </div>
  )
}
