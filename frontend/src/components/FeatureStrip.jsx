import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Scale, BarChart3, ShieldCheck } from 'lucide-react'

export default function FeatureStrip() {
  const features = [
    {
      id: 'upload',
      icon: FileText,
      title: 'Upload & Analyze',
      description: 'Extract and process regulatory documents',
    },
    {
      id: 'compare',
      icon: Scale,
      title: 'Compare Versions',
      description: 'Identify and classify meaningful changes',
    },
    {
      id: 'insights',
      icon: BarChart3,
      title: 'Explore Insights',
      description: 'Understand impact with explainable AI',
    },
    {
      id: 'ahead',
      icon: ShieldCheck,
      title: 'Stay Ahead',
      description: 'Make informed compliance decisions',
    },
  ]

  return (
    <section className="w-full border-t border-[#E5EAE2] bg-[#FAFBF9]/80 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.6 + idx * 0.08,
                  ease: 'easeOut',
                }}
                className="flex items-start gap-3.5 group cursor-default"
              >
                {/* SVG Vector Icon */}
                <div className="p-2.5 rounded-xl bg-white border border-[#E0E7DD] text-[#2C634D] shadow-sm group-hover:border-[#2C634D] group-hover:bg-[#F2FAF6] transition-all duration-200 flex-shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-[#14261C] tracking-tight group-hover:text-[#1B382B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#55645A] leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
