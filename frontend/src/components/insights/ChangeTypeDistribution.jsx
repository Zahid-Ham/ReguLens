import React from 'react'

export default function ChangeTypeDistribution({ distribution = {} }) {
  const total = distribution.total_changes || 0
  const items = distribution.items || []

  // Calculate SVG stroke-dasharray segments for donut
  const size = 120
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0
  const segments = items.map((item) => {
    const pct = total > 0 ? (item.count / total) * 100 : 0
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
    accumulatedPercent += pct
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    }
  })

  // Format large total cleanly if > 9999
  const displayTotal = total > 9999 ? `${(total / 1000).toFixed(1)}k` : total

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-bold text-[#112117]">
          Change Type Distribution
        </h3>
        <p className="text-[12px] text-[#55675C] mt-0.5">
          Breakdown of detected regulatory changes
        </p>
      </div>

      {/* Donut & Legend Content */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto py-3">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F0F4EE"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Segments */}
            {total > 0 &&
              segments.map((seg, idx) => (
                <circle
                  key={seg.type || idx}
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
              {displayTotal}
            </span>
            <span className="text-[10px] font-medium text-[#55675C] mt-0.5">
              Total Changes
            </span>
          </div>
        </div>

        {/* Legend with full category names, counts, and percentages */}
        <div className="flex-1 w-full space-y-2 text-[12px]">
          {items.map((item) => (
            <div key={item.type} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-2xs flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#324438] font-medium whitespace-nowrap text-[12px]">
                  {item.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[12px]">
                <span className="font-bold text-[#112117]">
                  {item.count > 9999 ? `${(item.count / 1000).toFixed(1)}k` : item.count}
                </span>
                <span className="text-[#86978C] text-[11px]">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
