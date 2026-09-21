import React from 'react'

export default function RegulatorCoverage({ coverage = {} }) {
  const total = coverage.total_analyses || 0
  const items = coverage.items || []

  // SVG calculations
  const size = 130
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0
  const segments = items.map((item) => {
    const pct = total > 0 ? (item.analyses_count / total) * 100 : 0
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
    accumulatedPercent += pct
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    }
  })

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-bold text-[#112117]">
          Analysis Coverage by Regulator
        </h3>
        <p className="text-[12px] text-[#55675C] mt-0.5">
          Distribution of analyses across regulatory authorities
        </p>
      </div>

      {/* Donut & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 my-auto py-2">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F0F4EE"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {total > 0 &&
              segments.map((seg, idx) => (
                <circle
                  key={seg.regulator || idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-300"
                />
              ))}
          </svg>

          {/* Center Hole Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-xl font-extrabold font-sans text-[#112117] leading-none">
              {total}
            </span>
            <span className="text-[9.5px] font-medium text-[#55675C] mt-0.5">
              Analyses
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2 text-[12px]">
          {items.map((item) => (
            <div key={item.regulator} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-2xs flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#324438] font-medium">
                  {item.regulator}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="font-bold text-[#112117] font-mono text-[12px]">
                  {item.analyses_count}
                </span>
                <span className="text-[#86978C] text-[11px] font-mono w-10 text-right">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="pt-2 border-t border-[#F0F4EE] text-[10.5px] text-[#6C7E72] leading-tight">
        {coverage.note || 'Current corpus is primarily focused on RBI master directions.'}
      </div>
    </div>
  )
}
