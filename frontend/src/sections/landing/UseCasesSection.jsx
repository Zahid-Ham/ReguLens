import React from 'react'
import { motion } from 'framer-motion'
import { Landmark, ShieldCheck, FileText, Users, ArrowRight } from 'lucide-react'

export default function UseCasesSection() {
  const useCases = [
    {
      id: 'banks',
      icon: Landmark,
      title: 'Banks & Financial\nInstitutions',
      description: 'Stay ahead of regulatory changes, assess compliance impact and align internal policies.',
      linkText: 'Learn More',
      href: '#use-cases-banks',
    },
    {
      id: 'compliance',
      icon: ShieldCheck,
      title: 'Compliance Teams',
      description: 'Identify, analyze and track regulatory changes with explainable insights.',
      linkText: 'Learn More',
      href: '#use-cases-compliance',
    },
    {
      id: 'researchers',
      icon: FileText,
      title: 'Policy Researchers',
      description: 'Explore structured regulatory data for research, analysis and policy development.',
      linkText: 'Learn More',
      href: '#use-cases-researchers',
    },
    {
      id: 'educators',
      icon: Users,
      title: 'Educators & Students',
      description: 'Learn from real regulatory content with transparent, interpretable NLP.',
      linkText: 'Learn More',
      href: '#use-cases-educators',
    },
  ]

  return (
    <section id="use-cases" className="w-full bg-[#FAFBF9] pt-16 sm:pt-20 pb-16 sm:pb-20 border-t border-[#EAEFE8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Block: 3-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-14 sm:mb-16">
          {/* Left: Eyebrow + Main Title */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-[1.5px] bg-[#2C634D]" />
              <span className="text-[11px] font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
                Real-World Impact
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] text-[#112117] font-normal tracking-tight mb-3">
              Built for Real
              <br />
              Use Cases
            </h2>
            <p className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-md">
              ReguLens helps diverse stakeholders navigate regulatory changes with clarity, speed and confidence.
            </p>
          </div>

          {/* Center: Descriptive Paragraph */}
          <div className="lg:col-span-4 flex items-center pt-2 lg:pt-8">
            <p className="text-sm sm:text-[14.5px] text-[#55665C] leading-relaxed">
              From compliance teams to policy researchers, ReguLens adapts to real-world needs across
              the regulatory ecosystem.
            </p>
          </div>

          {/* Right: Editorial Quote Box */}
          <div className="lg:col-span-3 flex items-center pt-2 lg:pt-8 lg:border-l lg:border-[#E0E7DD] lg:pl-6">
            <div className="flex flex-col">
              <p className="font-editorial italic text-base sm:text-[17px] text-[#2C4033] leading-snug mb-2">
                &ldquo;Different roles. A common advantage &mdash; clarity.&rdquo;
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

        {/* 4 Use Case Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5 items-stretch">
          {useCases.map((card, idx) => {
            const Icon = card.icon

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3 }}
                className="h-full bg-white rounded-2xl p-6 sm:p-6 border border-[#E2E8DF] shadow-[0_2px_12px_-2px_rgba(27,56,43,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(27,56,43,0.08)] hover:border-[#2C634D]/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-full bg-[#F0F7F2] border border-[#DEEADE] text-[#24543F] flex items-center justify-center mb-5 group-hover:bg-[#E7F3EB] group-hover:border-[#2C634D]/30 transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#112117] tracking-tight mb-2.5 leading-snug whitespace-pre-line">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[12.5px] text-[#55665C] leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Learn More Action Link */}
                <a
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#132E22] hover:text-[#285C45] transition-colors group-hover:underline"
                >
                  <span>{card.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
