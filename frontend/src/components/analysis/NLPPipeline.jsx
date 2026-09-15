import React from 'react'
import { CheckCircle2, Loader2, Check } from 'lucide-react'

export const STANDARD_NLP_STAGES = [
  { id: 'doc_proc', title: 'Document Processing', description: 'Extract and clean text from source regulatory PDFs' },
  { id: 'clause_seg', title: 'Clause Segmentation', description: 'Split regulatory articles into discrete atomic clauses' },
  { id: 'tokenization', title: 'Tokenization', description: 'Transform raw clause strings into token sequences' },
  { id: 'lemmatization', title: 'Lemmatization', description: 'Normalize inflected words to dictionary lemmas' },
  { id: 'pos_tagging', title: 'POS Tagging', description: 'Syntactic part-of-speech disambiguation' },
  { id: 'dependency_analysis', title: 'Dependency Analysis', description: 'Extract syntactic grammatical dependency trees' },
  { id: 'domain_ner', title: 'Domain NER', description: 'Extract banking, monetary, and regulatory entities' },
  { id: 'clause_classification', title: 'Clause Classification', description: 'Classify clauses into regulatory function categories' },
  { id: 'requirement_extraction', title: 'Requirement Extraction', description: 'Extract subjects, modals, actions, and deadlines' },
  { id: 'semantic_comparison', title: 'Semantic Comparison', description: 'Align corresponding clauses across versions' },
  { id: 'change_detection', title: 'Change Detection', description: 'Detect substantive, wording, and structural changes' },
  { id: 'materiality_assessment', title: 'Materiality Assessment', description: 'Evaluate regulatory impact and legal shift severity' },
]

export default function NLPPipeline({ stages = [], stageStatuses = {}, currentStageIndex = 11 }) {
  // If API stages are provided, map them
  const displayStages = stages.length > 0
    ? stages.map((s, idx) => {
        const std = STANDARD_NLP_STAGES[idx] || {}
        return {
          id: `stage_${idx}`,
          title: s.name || std.title || `Stage ${idx + 1}`,
          description: std.description || 'Precomputed NLP pipeline execution',
          status: (s.status || 'completed').toUpperCase(),
        }
      })
    : STANDARD_NLP_STAGES.map((std, idx) => ({
        ...std,
        status: idx <= currentStageIndex ? 'COMPLETED' : 'PENDING',
      }))

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-full">
      {/* Title */}
      <h3 className="text-base font-semibold text-[#112117] tracking-tight">
        NLP Pipeline
      </h3>
      <p className="text-[12px] text-[#55675C] mt-0.5 mb-5 leading-relaxed">
        Processing your documents through verified NLP pipeline stages.
      </p>

      {/* Vertical Stepper List */}
      <div className="relative flex-1 space-y-1">
        {displayStages.map((stage, idx) => {
          const isCompleted = stage.status === 'COMPLETED' || stage.status === 'COMPLETE'
          const isActive = stage.status === 'ACTIVE' || stage.status === 'IN_PROGRESS'
          const isPending = stage.status === 'PENDING'

          return (
            <div key={stage.id} className="relative">
              {/* Vertical Connector Line (between steps) */}
              {idx < displayStages.length - 1 && (
                <div
                  className={`absolute left-[13px] top-[26px] w-[1.5px] h-[calc(100%-8px)] transition-colors duration-300 ${
                    isCompleted ? 'bg-[#2C634D]' : 'bg-[#E3EBE1]'
                  }`}
                />
              )}

              {/* Stage Card / Row */}
              <div
                className={`relative flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EBF5EE] border border-[#B8D7BE] shadow-2xs'
                    : 'hover:bg-[#FAFBF9]'
                }`}
              >
                {/* Left: Icon & Stage Details */}
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  {/* Status Indicator Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[#132E22] text-[#FAFBF9] flex items-center justify-center shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full bg-[#132E22] text-white flex items-center justify-center ring-4 ring-[#D4E8D7] shadow-2xs">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#D2DDD1] bg-white" />
                    )}
                  </div>

                  {/* Stage Name & Summary */}
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-[12.5px] leading-tight truncate font-semibold ${
                        isActive
                          ? 'text-[#132E22]'
                          : isCompleted
                          ? 'text-[#192A20]'
                          : 'text-[#55675C]'
                      }`}
                    >
                      {stage.title}
                    </span>
                    <span className="text-[11px] text-[#63756A] leading-tight mt-0.5 truncate">
                      {stage.description}
                    </span>
                  </div>
                </div>

                {/* Right: Stage Status Text */}
                <div className="flex-shrink-0 text-right pl-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2C634D]">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#D9ECD9] text-[10.5px] font-semibold text-[#132E22]">
                      <Loader2 className="w-3 h-3 animate-spin text-[#132E22]" />
                      Processing...
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#8D9E92]">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
