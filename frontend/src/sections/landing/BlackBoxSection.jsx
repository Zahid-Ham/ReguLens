import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import PrimaryButton from '../../components/PrimaryButton'
import ClauseAnalysisPreview from '../../components/ClauseAnalysisPreview'

export default function BlackBoxSection() {
  return (
    <section className="w-full bg-[#F3F7F3] border-t border-[#E2EBE2] py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Editorial Messaging & CTAs */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2.5 mb-4"
            >
              <span className="w-5 h-[1.5px] bg-[#2C634D]" />
              <span className="text-[11px] font-bold tracking-[0.14em] text-[#3B4E41] uppercase">
                Beyond a Black Box
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] text-[#112117] font-normal tracking-tight mb-5"
            >
              See the NLP Pipeline
              <br />
              <span className="font-normal">in Action</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-md mb-8"
            >
              ReguLens doesn’t just show you the final result — it shows you how it gets
              there. Explore each NLP step, from tokenization to change detection, with clear,
              interpretable outputs.
            </motion.p>

            {/* CTAs */}
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
                href="#explore-pipeline"
                className="py-3.5 px-6 text-sm"
              >
                Explore the Pipeline
              </PrimaryButton>

              <a
                href="#learn-more"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#132E22] hover:text-[#285C45] px-4 py-3 transition-colors group"
              >
                <span>Learn More</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Clause Analysis Product Visual & Floating Quote */}
          <div className="lg:col-span-7 flex flex-col relative">
            {/* Editorial Floating Quote on Top Right */}
            <div className="w-full flex justify-end mb-2 pr-2 hidden sm:flex">
              <div className="text-right">
                <span className="font-editorial italic text-xs sm:text-[13px] text-[#4E5E54] tracking-tight block">
                  &ldquo;Interpretable at every step.&rdquo;
                </span>
                <span className="w-4 h-[1px] bg-[#2C634D] inline-block mt-0.5" />
              </div>
            </div>

            {/* Product Interface Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ClauseAnalysisPreview />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
