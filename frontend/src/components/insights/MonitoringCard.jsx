import React from 'react'
import { Lightbulb, Bell, Clock } from 'lucide-react'

export default function MonitoringCard() {
  return (
    <div className="bg-[#FAFDF9] border border-[#D5E5D5] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Decorative background bell illustration */}
      <div className="absolute right-4 bottom-3 w-16 h-16 rounded-full bg-[#EBF6EC] flex items-center justify-center opacity-60 pointer-events-none transition-transform group-hover:scale-105">
        <Bell className="w-8 h-8 text-[#1E4333]" />
      </div>

      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#E6F4E8] flex items-center justify-center text-[#1E4333] flex-shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-[15px] font-bold text-[#112117]">
            Stay Ahead of Regulatory Changes
          </h3>
        </div>

        {/* Description */}
        <p className="text-[12.5px] text-[#4A5D51] leading-relaxed max-w-xs mt-2">
          Set up automated monitoring for new regulatory updates, circulars, and receive proactive compliance notifications.
        </p>
      </div>

      {/* Action / Coming soon badge */}
      <div className="mt-4 pt-3 z-10">
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#55675C] border border-[#CFE0CF] rounded-xl text-[12px] font-semibold cursor-not-allowed opacity-90 shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5 text-[#55675C]" />
          <span>Coming Soon</span>
        </button>
      </div>
    </div>
  )
}
