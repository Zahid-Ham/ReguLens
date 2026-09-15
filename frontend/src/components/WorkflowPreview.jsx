import React from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  AlignLeft,
  Link,
  BarChart2,
  ClipboardCheck,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'

export default function WorkflowPreview() {
  const steps = [
    {
      id: 'extract',
      name: 'Extract Text',
      description: 'Convert regulatory documents to structured text',
      icon: FileText,
    },
    {
      id: 'process',
      name: 'Process with NLP',
      description: 'Tokenize, analyze and understand legal content',
      icon: AlignLeft,
    },
    {
      id: 'align',
      name: 'Align Versions',
      description: 'Match provisions across regulatory updates',
      icon: Link,
    },
    {
      id: 'detect',
      name: 'Detect Changes',
      description: 'Identify and classify meaningful changes',
      icon: BarChart2,
    },
    {
      id: 'assess',
      name: 'Assess Materiality',
      description: 'Evaluate regulatory impact',
      icon: ClipboardCheck,
    },
    {
      id: 'insights',
      name: 'Generate Insights',
      description: 'Get clear, explainable compliance intelligence',
      icon: Lightbulb,
    },
  ]

  return (
    <section className="w-full border-t border-[#EAEFE8] bg-[#FAFBF9] pt-12 pb-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 sm:mb-12">
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#112117] font-normal tracking-tight">
            How ReguLens Works
          </h2>

          <a
            href="#full-workflow"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#132E22] hover:text-[#285C45] transition-colors group"
          >
            <span>See the full workflow</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* 6-Node Horizontal Pipeline Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLast = idx === steps.length - 1

            return (
              <div key={step.id} className="relative flex flex-col items-center text-center group">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.5 + idx * 0.08,
                    ease: 'easeOut',
                  }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Circle Icon Container */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white border border-[#DEE6DB] shadow-sm flex items-center justify-center text-[#1E3B2D] group-hover:border-[#2C634D] group-hover:bg-[#F4FAF6] group-hover:shadow transition-all duration-200 mb-3.5">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.6} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-[13px] font-bold text-[#112117] mb-1 leading-snug">
                    {step.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] sm:text-[11.5px] text-[#55665C] leading-relaxed max-w-[150px]">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow Connector (Desktop) */}
                {!isLast && (
                  <div className="hidden lg:flex absolute top-7 -right-3 text-[#B8C8BC] items-center pointer-events-none">
                    <span className="text-xs font-light">&rarr;</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Tagline Ribbon */}
        <div className="mt-14 sm:mt-16 flex items-center justify-center gap-3 text-[10.5px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#75867B] uppercase">
          <div className="h-[1px] w-12 sm:w-20 bg-[#D8E2D6]" />
          <span>Transparent &nbsp;·&nbsp; Explainable &nbsp;·&nbsp; Domain-Specific &nbsp;·&nbsp; Built for Impact</span>
          <div className="h-[1px] w-12 sm:w-20 bg-[#D8E2D6]" />
        </div>
      </div>
    </section>
  )
}
