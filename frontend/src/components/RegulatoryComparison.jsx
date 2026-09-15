import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ArrowRight, BarChart2 } from 'lucide-react'

export default function RegulatoryComparison() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none pt-2 pb-8 sm:pb-10">
      {/* Soft Ambient Sage/Mint Glow Aura */}
      <div className="absolute inset-0 -m-6 pointer-events-none flex items-center justify-center">
        <div className="w-[110%] h-[110%] rounded-full bg-gradient-to-br from-[#E2F2E7]/80 via-[#EDF7F1]/50 to-transparent blur-3xl opacity-75" />
      </div>

      {/* Subtle Circular Alignment Guide Arc (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0 opacity-40"
        viewBox="0 0 540 320"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M 100 140 C 190 30, 350 30, 440 140"
          stroke="#2E624A"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 100 180 C 190 290, 350 290, 440 180"
          stroke="#2E624A"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Main Container: Flex layout with balanced sizing */}
      <div className="relative z-10 w-full max-w-[560px] flex items-center justify-between gap-2.5 sm:gap-3.5">
        {/* Left Document Card: 2020 */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-[155px] sm:min-w-[190px] bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8DF] shadow-[0_4px_20px_-4px_rgba(27,56,43,0.06)] relative"
        >
          {/* Card Header */}
          <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0F7F2] text-[#2C634D] border border-[#E2EFE6] flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B70] leading-none mb-0.5">
                RBI
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-[#46564C] leading-tight truncate">
                PSL Guidelines
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-[#112117] tracking-tight leading-tight mt-0.5">
                2020
              </h3>
            </div>
          </div>

          {/* Skeleton Document Lines */}
          <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
            <div className="h-1 sm:h-1.5 bg-[#EDF1EB] rounded-full w-full" />
            <div className="h-1 sm:h-1.5 bg-[#EDF1EB] rounded-full w-[90%]" />
            <div className="h-1 sm:h-1.5 bg-[#EDF1EB] rounded-full w-[75%]" />
          </div>

          {/* Clause Snippet Box */}
          <div className="bg-[#FAFBF9] rounded-xl p-2.5 sm:p-3 border border-[#EAEFE8]">
            <span className="inline-block text-[11px] sm:text-xs font-bold text-[#14261C] mb-1">
              6.2
            </span>
            <p className="text-[10.5px] sm:text-[11.5px] text-[#415046] leading-relaxed">
              Banks{' '}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] font-semibold border border-[#BAE6FD] mx-0.5 text-[10px] sm:text-[11px]">
                may
              </span>{' '}
              extend credit facilities to ...
            </p>
          </div>
        </motion.div>

        {/* Center Floating Comparison Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-[105px] sm:w-[124px] flex-shrink-0 flex flex-col items-center justify-center z-20"
        >
          <div className="bg-white rounded-2xl px-2.5 sm:px-3 py-3.5 border border-[#DCE4D8] shadow-[0_8px_24px_-4px_rgba(27,56,43,0.12)] flex flex-col items-center text-center w-full">
            {/* Top Label */}
            <span className="text-[9px] sm:text-[9.5px] font-semibold text-[#6B7B70] leading-tight mb-1.5 text-center">
              Regulatory Change Detected
            </span>

            {/* Direction Arrow Button */}
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#132E22] mb-1.5 border border-[#CDEED7] shadow-xs">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold text-[#112117] leading-tight mb-1.5 whitespace-nowrap">
              Modality Changed
            </span>

            {/* Change Tag */}
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#EBF7EF] text-[#166534] font-bold text-[9.5px] sm:text-[10px] tracking-tight border border-[#C5ECD2] mb-2 whitespace-nowrap">
              may &rarr; shall
            </span>

            {/* Analytics Mini Icon */}
            <div className="text-[#2C634D] mb-0.5">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>

            <span className="text-[9px] sm:text-[9.5px] font-bold text-[#112117] leading-tight whitespace-nowrap">
              Higher Obligation
            </span>
          </div>
        </motion.div>

        {/* Right Document Card: 2025 */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-[155px] sm:min-w-[190px] bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8DF] shadow-[0_4px_20px_-4px_rgba(27,56,43,0.06)] relative"
        >
          {/* Card Header */}
          <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0F7F2] text-[#2C634D] border border-[#E2EFE6] flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B70] leading-none mb-0.5">
                RBI
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-[#46564C] leading-tight truncate">
                PSL Guidelines
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-[#112117] tracking-tight leading-tight mt-0.5">
                2025
              </h3>
            </div>
          </div>

          {/* Skeleton Document Lines */}
          <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
            <div className="h-1 sm:h-1.5 bg-[#EDF1EB] rounded-full w-full" />
            <div className="h-1 sm:h-1.5 bg-[#EDF1EB] rounded-full w-[90%]" />
            <div className="h-1 sm:h-1.5 bg-[#EDF1EB] rounded-full w-[80%]" />
          </div>

          {/* Clause Snippet Box */}
          <div className="bg-[#FAFBF9] rounded-xl p-2.5 sm:p-3 border border-[#EAEFE8]">
            <span className="inline-block text-[11px] sm:text-xs font-bold text-[#14261C] mb-1">
              6.2
            </span>
            <p className="text-[10.5px] sm:text-[11.5px] text-[#415046] leading-relaxed">
              Banks{' '}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] font-bold border border-[#BBF7D0] mx-0.5 text-[10px] sm:text-[11px]">
                shall
              </span>{' '}
              extend credit facilities to ...
            </p>
          </div>

          {/* Floating Key Change Identified Callout Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-8 -right-2 sm:-right-4 bg-white rounded-xl p-3 border border-[#D5E0D0] shadow-[0_10px_28px_-4px_rgba(27,56,43,0.14)] z-30 w-[175px] sm:w-[195px]"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse flex-shrink-0" />
              <span className="text-[10.5px] sm:text-[11px] font-bold text-[#112117] truncate">
                Key Change Identified
              </span>
            </div>
            <p className="text-[10px] sm:text-[10.5px] text-[#55665C] leading-snug mb-1.5">
              Regulatory modality changed from &lsquo;may&rsquo; to &lsquo;shall&rsquo;.
            </p>
            <a
              href="#view-explanation"
              className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold text-[#132E22] hover:text-[#285C45] group"
            >
              <span>View Explanation</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
