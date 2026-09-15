import React from 'react'
import { motion } from 'framer-motion'
import PrimaryButton from '../components/PrimaryButton'
import RegulatoryComparison from '../components/RegulatoryComparison'
import ValueHighlights from '../components/ValueHighlights'
import rbiFacadeImage from '../assets/rbi_facade.jpg'

export default function HeroSection() {
  return (
    <section id="product" className="relative w-full pt-8 sm:pt-12 md:pt-14 pb-14 sm:pb-18 overflow-hidden scroll-mt-20">
      {/* Background Architectural Artwork Layer - Softly Faded in Right Background */}
      <div className="absolute right-0 bottom-0 w-full lg:w-[52%] h-[80%] pointer-events-none select-none z-0 opacity-70 overflow-hidden">
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
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline, Body, CTAs & Value Highlights */}
          <div className="lg:col-span-6 flex flex-col pt-2 lg:pt-4">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2.5 mb-5 sm:mb-6"
            >
              <span className="w-6 h-[1.5px] bg-[#2C634D]" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
                Regulatory Intelligence for a Complex World
              </span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-[58px] xl:text-[62px] leading-[1.06] text-[#112117] tracking-[-0.025em] font-normal mb-6"
            >
              From Regulatory
              <br />
              <span className="font-normal">Text to Real Insights</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-base sm:text-lg text-[#46564C] leading-relaxed max-w-xl mb-8"
            >
              ReguLens uses Natural Language Processing to analyze, compare and explain
              regulatory changes — so you can focus on what truly matters.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4 mb-4"
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

            {/* Value Highlights (3 Pillars with circular icons) */}
            <ValueHighlights />
          </div>

          {/* Right Column: Product Illustration & RBI Context */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative w-full">
            {/* Editorial Quote Above Building */}
            <div className="w-full flex justify-end mb-1 pr-4 sm:pr-8 hidden sm:flex">
              <div className="text-right">
                <span className="font-editorial italic text-xs sm:text-sm text-[#4E5E54] tracking-tight block">
                  Stronger Regulations
                </span>
                <span className="font-editorial italic text-xs sm:text-sm text-[#4E5E54] tracking-tight block">
                  A More Inclusive India
                </span>
              </div>
            </div>

            {/* Product Illustration Container */}
            <div className="w-full flex items-center justify-center">
              <RegulatoryComparison />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
