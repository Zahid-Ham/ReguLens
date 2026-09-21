import React from 'react'
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react'
import rbiFacade from '../../assets/rbi_facade.jpg'

export default function InsightsHeader({
  timeRange = '12m',
  onTimeRangeChange = () => {},
  onRefresh = () => {},
  loading = false,
}) {
  const timeRangeLabels = {
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '180d': 'Last 6 months',
    '12m': 'Last 12 months',
    'all': 'All Time',
  }

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl sm:text-[34px] font-serif font-bold text-[#112117] tracking-tight">
          Insights
        </h1>
        <p className="text-[14px] text-[#55675C] mt-1">
          Global regulatory intelligence and compliance insights across your analyses.
        </p>
      </div>

      {/* Right controls: Quote banner & Time Filter */}
      <div className="flex flex-wrap items-center gap-3 self-stretch xl:self-auto">
        {/* Quote Banner */}
        <div className="hidden md:flex items-center justify-between gap-4 px-4 py-2.5 bg-[#F2F6F1] border border-[#DCE8DC] rounded-xl relative overflow-hidden max-w-sm">
          <div className="z-10">
            <p className="text-[12px] italic text-[#132E22] font-serif font-medium leading-snug">
              &ldquo;Data turns regulatory complexity into strategic clarity.&rdquo;
            </p>
            <span className="text-[10px] font-bold tracking-wider text-[#4A5D51] uppercase mt-0.5 block">
              — REGULENS
            </span>
          </div>

          <div className="relative w-24 h-11 flex-shrink-0 rounded-lg overflow-hidden border border-[#D0E0D0]">
            <img
              src={rbiFacade}
              alt="RBI Regulatory Architecture"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#132E22]/70 via-transparent to-transparent flex items-end p-1">
              <span className="text-[8px] font-semibold text-white tracking-tighter leading-tight">
                Monitor. Stay Ahead.
              </span>
            </div>
          </div>
        </div>

        {/* Time-Range Selector Dropdown */}
        <div className="relative inline-block">
          <div className="flex items-center gap-2 bg-white border border-[#DCE8DC] hover:border-[#B8D1BA] rounded-xl px-3.5 py-2 text-[13px] font-medium text-[#132E22] shadow-2xs transition-colors">
            <Calendar className="w-4 h-4 text-[#55675C]" />
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="bg-transparent border-none outline-none appearance-none pr-5 text-[#132E22] font-semibold cursor-pointer"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="180d">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#55675C] absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh insights intelligence"
          className="p-2 text-[#55675C] hover:text-[#132E22] hover:bg-[#EDF4ED] border border-[#DCE8DC] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#132E22]' : ''}`} />
        </button>
      </div>
    </div>
  )
}
