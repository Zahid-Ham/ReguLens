import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function ChangeDistribution({ chartData = [], totalChanges = 63 }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#112117] text-white p-2.5 rounded-xl shadow-lg text-xs font-sans">
          <p className="font-semibold">{data.name}</p>
          <p className="text-[#A2C7B1]">
            {data.value} provisions ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs flex flex-col">
      <h4 className="text-[13.5px] font-semibold text-[#112117] tracking-tight mb-3">
        Change Type Distribution
      </h4>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart with Center Text */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[#112117] leading-none">
              {totalChanges}
            </span>
            <span className="text-[10px] text-[#617467] font-medium mt-0.5">
              changes
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 w-full">
          {chartData.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs text-[#2A3B30] py-0.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11.5px] font-medium text-[#46574C] truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-[11.5px] font-semibold text-[#112117] ml-2 flex-shrink-0">
                {item.value} <span className="text-[#6C7E72] font-normal">({item.percentage}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
