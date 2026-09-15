import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, ChevronDown, CheckCircle, Info, Sparkles, Binary } from 'lucide-react'

export default function AnalysisPipeline({ policyEnabled = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const steps = [
    {
      number: '1',
      title: 'Document Processing',
      description: 'Extract text from PDFs',
    },
    {
      number: '2',
      title: 'Clause Segmentation',
      description: 'Split into meaningful clauses',
    },
    {
      number: '3',
      title: 'NLP Analysis',
      description: 'Tokenization, POS, NER, classification',
    },
    {
      number: '4',
      title: 'Semantic Comparison',
      description: 'Identify and classify changes',
    },
    {
      number: '5',
      title: 'Materiality Assessment',
      description: 'Assess significance and impact',
    },
    {
      number: '6',
      title: 'Policy Matching',
      description: policyEnabled
        ? 'Compare with your company policy'
        : 'Compare with your company policy (optional)',
      isOptional: !policyEnabled,
    },
    {
      number: '7',
      title: 'Generate Insights',
      description: 'Clear, explainable results',
    },
  ]

  const detailedStages = [
    {
      num: '01',
      title: 'Document Processing',
      desc: 'Extract structured text from complex regulatory PDFs, removing headers and page noise.',
    },
    {
      num: '02',
      title: 'Clause Segmentation',
      desc: 'Split regulatory circulars into numbered legal sections, subsections, and proviso clauses.',
    },
    {
      num: '03',
      title: 'NLP Analysis',
      desc: 'Execute tokenization, spaCy lemmatization, POS tagging, dependency trees, and financial NER.',
    },
    {
      num: '04',
      title: 'Requirement Extraction',
      desc: 'Isolate Subject, Modality (shall/may), Action verb, Object entity, Deadlines, and Penalties.',
    },
    {
      num: '05',
      title: 'Semantic Comparison',
      desc: 'Align corresponding provisions across 2020 and 2025 regulatory versions using Sentence-BERT embeddings.',
    },
    {
      num: '06',
      title: 'Change Detection',
      desc: 'Classify semantic additions, deletions, obligation increases, threshold shifts, and wording modifications.',
    },
    {
      num: '07',
      title: 'Materiality Assessment',
      desc: 'Evaluate compliance risk level and operational impact of detected modifications.',
    },
    {
      num: '08',
      title: 'Policy Matching',
      desc: 'Assess internal organizational bank policies against newly extracted mandatory obligations.',
    },
    {
      num: '09',
      title: 'Generate Insights',
      desc: 'Deliver audit-ready, explainable regulatory intelligence with highlighted clause diffs.',
    },
  ]

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full">
      {/* Top Header */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="w-6 h-6 rounded-md bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0">
          <Settings className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-base font-semibold text-[#112117] tracking-tight">
          Analysis Pipeline
        </h3>
      </div>
      <p className="text-[12.5px] text-[#55675C] mb-6 leading-relaxed">
        Your documents will be processed using our NLP pipeline:
      </p>

      {/* 7 Stepper Pipeline Items */}
      <div className="space-y-4 flex-1">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-start gap-3.5 group">
            {/* Number Badge */}
            <div className="w-6 h-6 rounded-full border border-[#D5E1D4] bg-[#F7FAF7] group-hover:bg-[#EBF3EC] group-hover:border-[#132E22] text-[#132E22] flex items-center justify-center text-[11.5px] font-bold flex-shrink-0 transition-colors mt-0.5">
              {step.number}
            </div>

            {/* Step Content */}
            <div className="flex flex-col min-w-0">
              <span className="text-[13.5px] font-semibold text-[#112117] leading-tight group-hover:text-[#1E4333] transition-colors">
                {step.title}
              </span>
              <span className="text-[12px] text-[#5A6D61] leading-snug mt-0.5">
                {step.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Expandable Transparency Panel */}
      <div className="mt-6 pt-5 border-t border-[#EAEFE8]">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full flex items-center justify-between py-1 text-left group focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2C634D]" />
            <span className="text-[12.5px] font-semibold text-[#132E22] group-hover:underline">
              What happens during analysis?
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#63756A] transition-transform duration-200 ${
              detailsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {detailsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-2.5 overflow-hidden text-[11.5px] text-[#4A5C50] bg-[#FAFBF9] p-3.5 rounded-xl border border-[#E4ECE2]"
            >
              <p className="font-medium text-[#132E22] mb-2">
                Explainable Multi-Stage NLP Architecture:
              </p>
              {detailedStages.map((stage) => (
                <div key={stage.num} className="flex items-start gap-2">
                  <span className="font-bold text-[#2C634D] flex-shrink-0">
                    {stage.num}
                  </span>
                  <div>
                    <strong className="text-[#192A20]">{stage.title}:</strong>{' '}
                    <span>{stage.desc}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
