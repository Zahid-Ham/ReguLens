import React from 'react'
import { motion } from 'framer-motion'
import PrimaryButton from '../../components/PrimaryButton'
import rbiFacadeImage from '../../assets/rbi_facade.jpg'

export default function FinalCTA() {
  return (
    <section id="get-started" className="relative w-full bg-[#FAFBF9] py-16 sm:py-20 lg:py-24 border-t border-[#EAEFE8] overflow-hidden">
      {/* Background Architectural Artwork Layer */}
      <div className="absolute right-0 bottom-0 w-full lg:w-[50%] h-[85%] pointer-events-none select-none z-0 opacity-70 overflow-hidden">
        <img
          src={rbiFacadeImage}
          alt="Reserve Bank of India Architectural Facade"
          className="w-full h-full object-cover object-left-bottom mix-blend-multiply opacity-65"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,0.4) 100%), linear-gradient(to top, rgba(0,0,0,0.9) 45%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,0.4) 100%), linear-gradient(to top, rgba(0,0,0,0.9) 45%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Body & CTAs */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2.5 mb-4"
            >
              <span className="w-5 h-[1.5px] bg-[#2C634D]" />
              <span className="text-[11px] font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
                Get Started
              </span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-3xl sm:text-4xl lg:text-[50px] xl:text-[54px] leading-[1.08] text-[#112117] font-normal tracking-tight mb-5"
            >
              Turn Regulatory
              <br />
              Complexity into
              <br />
              <span className="font-normal">Actionable Insights</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-lg mb-8"
            >
              Join ReguLens and experience a clearer, smarter way to understand regulatory change.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4"
            >
              <PrimaryButton
                variant="primary"
                icon="arrow"
                to="/analysis/new"
                className="py-3.5 px-6.5 text-sm"
              >
                Get Started
              </PrimaryButton>

              <PrimaryButton
                variant="secondary"
                icon="play"
                href="#watch-demo"
                className="py-3.5 px-6.5 text-sm"
              >
                Watch Demo
              </PrimaryButton>
            </motion.div>
          </div>

          {/* Right Column: Refined Regulatory Document Visual */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-end justify-center relative">
            {/* Editorial Quote Above Visual */}
            <div className="w-full flex justify-end mb-2 pr-6 hidden sm:flex">
              <div className="text-right">
                <span className="font-editorial italic text-xs sm:text-sm text-[#4E5E54] tracking-tight block">
                  From regulations
                </span>
                <span className="font-editorial italic text-xs sm:text-sm text-[#4E5E54] tracking-tight block">
                  to real impact.
                </span>
                <span className="w-4 h-[1px] bg-[#2C634D] inline-block mt-0.5" />
              </div>
            </div>

            {/* Overlapping Document Pair Container */}
            <div className="relative w-full max-w-[480px] h-[280px] sm:h-[310px] flex items-center justify-center">
              {/* Soft Ambient Sage Glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full bg-gradient-to-br from-[#E2F2E7]/80 to-transparent blur-2xl opacity-70" />
              </div>

              {/* 2020 Document (Behind / Left) */}
              <motion.div
                initial={{ opacity: 0, x: -20, rotate: -3 }}
                whileInView={{ opacity: 1, x: 0, rotate: -2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute left-4 sm:left-8 top-6 w-[200px] sm:w-[220px] bg-white/95 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-[#E0E7DD] shadow-[0_4px_20px_-4px_rgba(27,56,43,0.06)] z-10"
              >
                {/* Document Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-[#F0F7F2] border border-[#DEE6DC] flex items-center justify-center text-[#2C634D] text-[10px] font-bold">
                    §
                  </div>
                  <div>
                    <p className="text-[9.5px] font-bold uppercase text-[#6B7B70] leading-none">
                      RBI PSL Guidelines
                    </p>
                    <h4 className="text-sm font-bold text-[#112117] leading-tight mt-0.5">
                      2020
                    </h4>
                  </div>
                </div>

                {/* Skeleton Lines */}
                <div className="space-y-1.5 mb-4">
                  <div className="h-1 bg-[#EDF1EB] rounded-full w-full" />
                  <div className="h-1 bg-[#EDF1EB] rounded-full w-[85%]" />
                  <div className="h-1 bg-[#EDF1EB] rounded-full w-[70%]" />
                </div>

                <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#EAEFE8] text-[10px] text-[#55665C]">
                  Clause 6.2 &mdash; Baseline
                </div>
              </motion.div>

              {/* 2025 Document (Front / Right) */}
              <motion.div
                initial={{ opacity: 0, x: 20, rotate: 2 }}
                whileInView={{ opacity: 1, x: 0, rotate: 2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="absolute right-4 sm:right-8 top-12 w-[210px] sm:w-[230px] bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4D8] shadow-[0_12px_32px_-6px_rgba(27,56,43,0.12)] z-20"
              >
                {/* Document Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-[#E8F8EE] border border-[#C5ECD2] flex items-center justify-center text-[#15803D] text-[10px] font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-[9.5px] font-bold uppercase text-[#6B7B70] leading-none">
                      RBI PSL Guidelines
                    </p>
                    <h4 className="text-sm font-bold text-[#112117] leading-tight mt-0.5">
                      2025
                    </h4>
                  </div>
                </div>

                {/* Skeleton Lines */}
                <div className="space-y-1.5 mb-4">
                  <div className="h-1.5 bg-[#EDF1EB] rounded-full w-full" />
                  <div className="h-1.5 bg-[#EDF1EB] rounded-full w-[90%]" />
                  <div className="h-1.5 bg-[#EDF1EB] rounded-full w-[80%]" />
                </div>

                <div className="p-2 rounded-lg bg-[#F0FAF4] border border-[#CDEED7] text-[10px] text-[#166534] font-semibold flex items-center justify-between">
                  <span>Clause 6.2 &mdash; Updated</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
