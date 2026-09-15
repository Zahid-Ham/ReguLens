import React from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  AlignLeft,
  GitCompare,
  Search,
  BarChart2,
  FileCheck2,
  ChevronRight,
} from 'lucide-react'

export default function NLPWorkflow() {
  const steps = [
    {
      id: 'extract',
      name: 'Extract Text',
      icon: FileText,
    },
    {
      id: 'process',
      name: 'Process with NLP',
      icon: AlignLeft,
    },
    {
      id: 'align',
      name: 'Align Versions',
      icon: GitCompare,
    },
    {
      id: 'detect',
      name: 'Detect Changes',
      icon: Search,
    },
    {
      id: 'assess',
      name: 'Assess Materiality',
      icon: BarChart2,
    },
    {
      id: 'insights',
      name: 'Generate Insights',
      icon: FileCheck2,
    },
  ]

  return (
    <div className="w-full mt-10 sm:mt-12 flex flex-col items-center">
      {/* Horizontal Flow Container */}
      <div className="w-full max-w-4xl overflow-x-auto pb-3 pt-1 px-2 no-scrollbar">
        <div className="flex items-center justify-between min-w-[580px] gap-1 sm:gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLast = idx === steps.length - 1

            return (
              <React.Fragment key={step.id}>
                {/* Stage Node */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.5 + idx * 0.08,
                    ease: 'easeOut',
                  }}
                  className="flex flex-col items-center text-center group cursor-default"
                >
                  {/* Icon Circle */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DEE6DB] shadow-sm flex items-center justify-center text-[#4B5E52] group-hover:border-[#2C634D] group-hover:text-[#1B382B] group-hover:bg-[#F4FAF6] transition-all duration-200">
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>

                  {/* Label */}
                  <span className="mt-2 text-[10.5px] sm:text-[11px] font-medium text-[#46544C] group-hover:text-[#182C21] transition-colors leading-tight whitespace-nowrap">
                    {step.name}
                  </span>
                </motion.div>

                {/* Subtle Arrow Divider */}
                {!isLast && (
                  <div className="text-[#B2C2B5] px-0.5 mb-5 flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Editorial Domain Subtitle */}
      <div className="mt-4 flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#7A8C80] uppercase">
        <div className="h-[1px] w-8 sm:w-12 bg-[#D5DDD3]" />
        <span>Transparent &nbsp;·&nbsp; Explainable &nbsp;·&nbsp; Domain-Specific</span>
        <div className="h-[1px] w-8 sm:w-12 bg-[#D5DDD3]" />
      </div>
    </div>
  )
}
