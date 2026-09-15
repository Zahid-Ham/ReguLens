import React from 'react'
import { motion } from 'framer-motion'
import { FileSearch, ShieldCheck, Users } from 'lucide-react'

export default function ValueHighlights() {
  const items = [
    {
      icon: FileSearch,
      title: 'NLP-Powered',
      subtitle: 'Regulatory Analysis',
    },
    {
      icon: ShieldCheck,
      title: 'Explainable',
      subtitle: 'Change Detection',
    },
    {
      icon: Users,
      title: 'Built for',
      subtitle: 'Compliance Teams',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-10 max-w-lg">
      {items.map((item, idx) => {
        const Icon = item.icon

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 + idx * 0.1, ease: 'easeOut' }}
            className="flex flex-col items-start"
          >
            {/* Circular Icon Container */}
            <div className="w-11 h-11 rounded-full bg-white border border-[#E0E7DE] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#1E3B2D] mb-3">
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>

            {/* Typography */}
            <h4 className="text-sm sm:text-[15px] font-bold text-[#112117] tracking-tight">
              {item.title}
            </h4>
            <p className="text-xs sm:text-[13px] text-[#55665C] font-normal leading-snug mt-0.5">
              {item.subtitle}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
