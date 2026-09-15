import React from 'react'
import { motion } from 'framer-motion'
import { Search, FileText, CheckCircle2 } from 'lucide-react'

export default function ImpactBand() {
  const benefits = [
    {
      id: 'faster',
      icon: Search,
      title: 'Faster Analysis',
      subtitle: 'Reduce manual\nreview time',
    },
    {
      id: 'clearer',
      icon: FileText,
      title: 'Clearer Insights',
      subtitle: 'Explainable and\ndomain-specific',
    },
    {
      id: 'readiness',
      icon: CheckCircle2,
      title: 'Greater Readiness',
      subtitle: 'Stay ahead of\nregulatory change',
    },
  ]

  return (
    <section id="about" className="w-full bg-[#EDF4ED] border-y border-[#DCE6DB] py-14 sm:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Statement Quote */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <span className="font-editorial text-4xl sm:text-5xl text-[#2C634D] leading-none select-none">
                &ldquo;
              </span>
              <h3 className="font-editorial italic text-2xl sm:text-3xl md:text-[32px] text-[#112117] leading-[1.18] font-normal tracking-tight">
                ReguLens transforms how we understand regulatory change.
              </h3>
            </div>
            <div className="flex items-center gap-2 pl-6 mt-1">
              <span className="w-4 h-[1px] bg-[#2C634D]" />
              <span className="text-[10px] font-bold tracking-widest text-[#2C634D] uppercase">
                ReguLens
              </span>
            </div>
          </div>

          {/* Right Column: 3 Core Benefits */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:pl-6 lg:border-l lg:border-[#D6E2D5]">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon

              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.1, ease: 'easeOut' }}
                  className="flex flex-col items-center sm:items-start text-center sm:text-left group cursor-default"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E2D4] text-[#1E3B2D] flex items-center justify-center mb-3 shadow-xs group-hover:border-[#2C634D] group-hover:bg-[#F2FAF5] transition-all duration-200">
                    <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                  </div>

                  {/* Title */}
                  <h4 className="text-sm sm:text-[14.5px] font-bold text-[#112117] tracking-tight mb-1 group-hover:text-[#1B382B] transition-colors">
                    {benefit.title}
                  </h4>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-[12px] text-[#55665C] leading-snug whitespace-pre-line">
                    {benefit.subtitle}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
