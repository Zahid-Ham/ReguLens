import React from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  AlignLeft,
  Link2,
  BarChart3,
  ClipboardCheck,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'

export default function HowItWorksSection() {
  const stages = [
    {
      number: '01',
      title: 'Extract Text',
      description: 'Convert regulatory documents to structured text.',
      icon: FileText,
    },
    {
      number: '02',
      title: 'Process with NLP',
      description: 'Tokenize, lemmatize, identify entities and classify clauses.',
      icon: AlignLeft,
    },
    {
      number: '03',
      title: 'Align Versions',
      description: 'Match provisions across different regulatory versions.',
      icon: Link2,
    },
    {
      number: '04',
      title: 'Detect Changes',
      description: 'Identify and classify meaningful changes in requirements.',
      icon: BarChart3,
    },
    {
      number: '05',
      title: 'Assess Materiality',
      description: 'Evaluate the significance and potential impact of changes.',
      icon: ClipboardCheck,
    },
    {
      number: '06',
      title: 'Generate Insights',
      description: 'Deliver explainable, domain-specific intelligence.',
      icon: Lightbulb,
    },
  ]

  return (
    <section id="how-it-works" className="w-full bg-[#FAFBF9] pt-16 sm:pt-20 pb-16 sm:pb-20 border-t border-[#EAEFE8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Header Block: 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-14 sm:mb-16">
          {/* Left: Eyebrow + Main Title */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-[1.5px] bg-[#2C634D]" />
              <span className="text-[11px] font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
                The Process
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] text-[#112117] font-normal tracking-tight mb-3">
              How ReguLens Works
            </h2>
            <p className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-md">
              From complex regulatory documents to clear, explainable insights — powered by NLP.
            </p>
          </div>

          {/* Center: Descriptive Paragraph */}
          <div className="lg:col-span-4 flex items-center pt-2 lg:pt-8">
            <p className="text-sm sm:text-[14.5px] text-[#55665C] leading-relaxed">
              ReguLens combines Natural Language Processing, semantic analysis and domain
              understanding to detect and explain meaningful regulatory changes.
            </p>
          </div>

          {/* Right: Editorial Quote Box */}
          <div className="lg:col-span-3 flex items-center pt-2 lg:pt-8 lg:border-l lg:border-[#E0E7DD] lg:pl-6">
            <div className="flex flex-col">
              <p className="font-editorial italic text-base sm:text-[17px] text-[#2C4033] leading-snug mb-2">
                &ldquo;Turning regulatory complexity into usable intelligence.&rdquo;
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-[1px] bg-[#2C634D]" />
                <span className="text-[10px] font-bold tracking-widest text-[#2C634D] uppercase">
                  ReguLens
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Stage Workflow Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-3 relative items-stretch">
          {stages.map((stage, idx) => {
            const Icon = stage.icon
            const isLast = idx === stages.length - 1

            return (
              <div key={stage.number} className="relative flex flex-col group">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -3 }}
                  className="h-full bg-white rounded-2xl p-5 sm:p-4.5 border border-[#E2E8DF] shadow-[0_2px_12px_-2px_rgba(27,56,43,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(27,56,43,0.08)] hover:border-[#2C634D]/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon Container */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F0F7F2] border border-[#DEEADE] text-[#24543F] flex items-center justify-center mb-4 group-hover:bg-[#E7F3EB] transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    {/* Stage Number */}
                    <span className="text-[11px] font-mono font-semibold text-[#8B9C90] block mb-1">
                      {stage.number}
                    </span>

                    {/* Stage Title */}
                    <h3 className="text-sm sm:text-[14.5px] font-bold text-[#112117] tracking-tight mb-2 leading-snug">
                      {stage.title}
                    </h3>

                    {/* Stage Description */}
                    <p className="text-xs sm:text-[11.5px] text-[#55665C] leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow Divider (Desktop Only) */}
                {!isLast && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-[#A8BAAC] items-center pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Section Bottom Tagline Divider */}
        <div className="mt-16 sm:mt-20 flex items-center justify-center gap-3 sm:gap-4 text-[10.5px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#75867B] uppercase select-none">
          <div className="h-[1px] w-12 sm:w-24 bg-[#D8E2D6]" />
          <span>Transparent &nbsp;·&nbsp; Explainable &nbsp;·&nbsp; Domain-Specific &nbsp;·&nbsp; Built for Impact</span>
          <div className="h-[1px] w-12 sm:w-24 bg-[#D8E2D6]" />
        </div>
      </div>
    </section>
  )
}
