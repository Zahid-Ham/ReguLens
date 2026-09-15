import React from 'react'
import { motion } from 'framer-motion'

export default function ValueProposition() {
  const items = [
    {
      title: 'NLP-Powered',
      subtitle: 'Regulatory Analysis',
    },
    {
      title: 'Explainable',
      subtitle: 'Change Detection',
    },
    {
      title: 'Built for',
      subtitle: 'Compliance Teams',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-[#E8ECE6] max-w-lg">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + idx * 0.1, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <h4 className="text-sm sm:text-base font-bold text-[#14261C] tracking-tight">
            {item.title}
          </h4>
          <p className="text-xs sm:text-[13px] text-[#55645A] font-normal leading-snug mt-0.5">
            {item.subtitle}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
