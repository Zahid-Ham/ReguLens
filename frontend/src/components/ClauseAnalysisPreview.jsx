import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Tag,
  Search,
  GitCompare,
  FileCheck,
} from 'lucide-react'

export default function ClauseAnalysisPreview() {
  const [activeStage, setActiveStage] = useState('tokenization')
  const [activeViewMode, setActiveViewMode] = useState('tokens') // 'tokens' | 'lemmas'
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0)

  const stages = [
    { id: 'raw', name: 'Raw Text', icon: CheckCircle2 },
    { id: 'tokenization', name: 'Tokenization', icon: Layers },
    { id: 'pos', name: 'POS Tagging', icon: Tag },
    { id: 'ner', name: 'Named Entity Recognition', icon: Search },
    { id: 'classification', name: 'Clause Classification', icon: FileCheck },
    { id: 'extraction', name: 'Obligation Extraction', icon: Sparkles },
    { id: 'changes', name: 'Change Detection', icon: GitCompare },
  ]

  const tokensData = [
    { token: 'Banks', lemma: 'bank', pos: 'NOUN', entity: 'REGULATED_ENTITY', entityColor: 'bg-sky-100 text-sky-800 border-sky-200' },
    { token: 'may', lemma: 'may', pos: 'AUX', entity: 'MODALITY', entityColor: 'bg-amber-100 text-amber-800 border-amber-200' },
    { token: 'extend', lemma: 'extend', pos: 'VERB', entity: 'ACTION', entityColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { token: 'credit', lemma: 'credit', pos: 'NOUN', entity: 'INSTRUMENT', entityColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    { token: 'facilities', lemma: 'facility', pos: 'NOUN', entity: 'INSTRUMENT', entityColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    { token: 'to', lemma: 'to', pos: 'ADP', entity: '—', entityColor: '' },
    { token: 'small', lemma: 'small', pos: 'ADJ', entity: 'BENEFICIARY', entityColor: 'bg-teal-100 text-teal-800 border-teal-200' },
    { token: 'and', lemma: 'and', pos: 'CCONJ', entity: '—', entityColor: '' },
    { token: 'marginal', lemma: 'marginal', pos: 'ADJ', entity: 'BENEFICIARY', entityColor: 'bg-teal-100 text-teal-800 border-teal-200' },
    { token: 'farmers', lemma: 'farmer', pos: 'NOUN', entity: 'BENEFICIARY', entityColor: 'bg-teal-100 text-teal-800 border-teal-200' },
    { token: '...', lemma: '...', pos: 'PUNCT', entity: '—', entityColor: '' },
  ]

  const rawClause = 'Banks may extend credit facilities to small and marginal farmers under Priority Sector Lending guidelines.'

  return (
    <div className="w-full bg-white rounded-2xl border border-[#D8E2D5] shadow-[0_12px_36px_-6px_rgba(27,56,43,0.08)] overflow-hidden">
      {/* Top Window Header */}
      <div className="px-5 py-4 border-b border-[#E6EDE3] flex items-center justify-between bg-[#FCFDFC]">
        <div className="flex flex-col">
          <h3 className="text-sm sm:text-[15px] font-bold text-[#112117] leading-tight">
            Clause Analysis
          </h3>
          <span className="text-[11px] text-[#63756A] font-normal">
            RBI PSL Guidelines 2020
          </span>
        </div>

        {/* Clause Navigator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#182C21] bg-[#F0F5EE] px-2.5 py-1 rounded-lg border border-[#DEE6DC]">
            Clause 6.2
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-[#EEF3EC] text-[#55665C] transition-colors"
              aria-label="Previous Clause"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-[#EEF3EC] text-[#55665C] transition-colors"
              aria-label="Next Clause"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Body Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
        {/* Left Sidebar: NLP Stepper / Stage Navigation */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[#E6EDE3] bg-[#FAFBF9] p-3 sm:p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
          {stages.map((stage) => {
            const isActive = activeStage === stage.id

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#EBF5EE] text-[#132E22] font-semibold border border-[#CDE5D5] shadow-xs'
                    : 'text-[#586A5F] hover:bg-[#F2F6F0] hover:text-[#112117] font-medium'
                }`}
              >
                {/* Stage Bullet Indicator */}
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                    isActive
                      ? 'bg-[#1B382B] text-white'
                      : 'border border-[#B5C7BB] text-[#718578]'
                  }`}
                >
                  {isActive ? '●' : '✓'}
                </div>

                <span className="text-xs sm:text-[12.5px] whitespace-nowrap">
                  {stage.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right Content Area: Active Stage Viewer */}
        <div className="md:col-span-8 p-4 sm:p-6 flex flex-col justify-between bg-white">
          <AnimatePresence mode="wait">
            {activeStage === 'tokenization' && (
              <motion.div
                key="tokenization"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  {/* Stage Heading & View Toggle */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-sm sm:text-[15px] font-bold text-[#112117]">
                        Tokenization
                      </h4>
                      <p className="text-xs text-[#586A5F] leading-snug">
                        Split the text into meaningful tokens for analysis.
                      </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1.5 text-[11px] bg-[#F2F6F0] p-1 rounded-lg border border-[#E0E7DE] flex-shrink-0">
                      <span className="text-[#65756C] pl-1 font-medium hidden sm:inline">
                        View:
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveViewMode('tokens')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          activeViewMode === 'tokens'
                            ? 'bg-[#132E22] text-white shadow-xs'
                            : 'text-[#48594F] hover:text-[#112117]'
                        }`}
                      >
                        Tokens
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveViewMode('lemmas')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          activeViewMode === 'lemmas'
                            ? 'bg-[#132E22] text-white shadow-xs'
                            : 'text-[#48594F] hover:text-[#112117]'
                        }`}
                      >
                        Lemmas
                      </button>
                    </div>
                  </div>

                  {/* Raw Sentence Reference */}
                  <div className="bg-[#FAFBF9] rounded-xl p-3 border border-[#E6EDE3] text-xs text-[#415147] leading-relaxed mb-4">
                    {rawClause}
                  </div>

                  {/* Token Chips Array */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                    {tokensData.map((item, idx) => {
                      const isSelected = selectedTokenIndex === idx
                      const displayWord = activeViewMode === 'lemmas' ? item.lemma : item.token

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedTokenIndex(idx)}
                          className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-[#163A29] text-white font-bold shadow-xs scale-105'
                              : 'bg-[#DCFCE7]/60 text-[#166534] border border-[#BBF7D0] hover:bg-[#DCFCE7] font-medium'
                          }`}
                        >
                          {displayWord}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Token Details Table */}
                <div>
                  <h5 className="text-xs font-bold text-[#112117] mb-2">
                    Token Details
                  </h5>
                  <div className="overflow-hidden rounded-xl border border-[#E2E8DF] text-xs">
                    <div className="grid grid-cols-4 bg-[#F2F6F0] px-3 py-2 font-bold text-[#3B4D41] text-[11px] uppercase tracking-wider">
                      <div>Token</div>
                      <div>Lemma</div>
                      <div>POS Tag</div>
                      <div>Entity Type</div>
                    </div>
                    <div className="grid grid-cols-4 px-3 py-2.5 bg-white items-center text-[#182C21] font-mono text-[11.5px]">
                      <div className="font-semibold text-[#112117]">
                        {tokensData[selectedTokenIndex]?.token}
                      </div>
                      <div className="text-[#4E5E54]">
                        {tokensData[selectedTokenIndex]?.lemma}
                      </div>
                      <div className="text-[#2C634D] font-bold">
                        {tokensData[selectedTokenIndex]?.pos}
                      </div>
                      <div>
                        {tokensData[selectedTokenIndex]?.entity !== '—' ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${tokensData[selectedTokenIndex]?.entityColor}`}
                          >
                            {tokensData[selectedTokenIndex]?.entity}
                          </span>
                        ) : (
                          <span className="text-[#8FA094]">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStage === 'raw' && (
              <motion.div
                key="raw"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#112117] mb-1">Raw Regulatory Text</h4>
                  <p className="text-xs text-[#586A5F] mb-4">Original text as extracted from the official RBI PDF gazette.</p>
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E5EDE2] text-xs text-[#2A3C31] leading-relaxed font-mono">
                    &ldquo;6.2 Priority Sector Lending — Banks may extend credit facilities to small and marginal farmers, micro enterprises, and education sectors subject to annual targets.&rdquo;
                  </div>
                </div>
                <div className="text-[11px] text-[#63756A] pt-4 border-t border-[#EDF2EB]">
                  Source: RBI Master Directions on PSL (2020 Edition)
                </div>
              </motion.div>
            )}

            {activeStage === 'pos' && (
              <motion.div
                key="pos"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#112117] mb-1">Part-of-Speech & Dependency</h4>
                  <p className="text-xs text-[#586A5F] mb-4">Grammatical role tagging using fine-tuned legal POS analysis.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E5EDE2]">
                      <span className="text-[10px] text-[#63756A] uppercase font-bold block">Subject (nsubj)</span>
                      <span className="font-semibold text-[#112117]">Banks &rarr; NOUN</span>
                    </div>
                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E5EDE2]">
                      <span className="text-[10px] text-[#63756A] uppercase font-bold block">Modality (aux)</span>
                      <span className="font-semibold text-[#B45309]">may &rarr; AUX (Permissive)</span>
                    </div>
                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E5EDE2]">
                      <span className="text-[10px] text-[#63756A] uppercase font-bold block">Root Verb (root)</span>
                      <span className="font-semibold text-[#166534]">extend &rarr; VERB</span>
                    </div>
                    <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E5EDE2]">
                      <span className="text-[10px] text-[#63756A] uppercase font-bold block">Direct Object (dobj)</span>
                      <span className="font-semibold text-[#112117]">credit facilities &rarr; NOUN</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#63756A] pt-3 border-t border-[#EDF2EB]">
                  Syntactic dependency tree verified for clause 6.2.
                </div>
              </motion.div>
            )}

            {activeStage === 'ner' && (
              <motion.div
                key="ner"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#112117] mb-1">Domain Named Entity Recognition</h4>
                  <p className="text-xs text-[#586A5F] mb-4">Identification of financial entities, instruments, and regulators.</p>
                  <div className="p-3.5 bg-[#FAFBF9] rounded-xl border border-[#E5EDE2] text-xs leading-loose mb-3">
                    <span className="bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.5 rounded border border-sky-200 mr-1">
                      Banks [REGULATED_ENTITY]
                    </span>{' '}
                    may extend{' '}
                    <span className="bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.5 rounded border border-purple-200 mx-1">
                      credit facilities [FINANCIAL_INSTRUMENT]
                    </span>{' '}
                    to{' '}
                    <span className="bg-teal-100 text-teal-800 font-semibold px-1.5 py-0.5 rounded border border-teal-200 ml-1">
                      small and marginal farmers [BENEFICIARY]
                    </span>
                    .
                  </div>
                </div>
                <div className="text-[11px] text-[#63756A] pt-3 border-t border-[#EDF2EB]">
                  3 regulatory domain entities detected with high confidence.
                </div>
              </motion.div>
            )}

            {activeStage === 'classification' && (
              <motion.div
                key="classification"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#112117] mb-1">Clause Classification</h4>
                  <p className="text-xs text-[#586A5F] mb-4">Regulatory-function classification based on legal semantics.</p>
                  <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E5EDE2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#63756A] uppercase font-bold block">Assigned Label</span>
                      <span className="text-base font-bold text-[#132E22]">PERMISSION / GUIDANCE</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#E5F7EC] text-[#15803D] font-bold text-xs border border-[#C5ECD2]">
                      Confidence: 0.94
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-[#63756A] pt-3 border-t border-[#EDF2EB]">
                  Function: Non-binding authority granted to regulated entities.
                </div>
              </motion.div>
            )}

            {activeStage === 'extraction' && (
              <motion.div
                key="extraction"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#112117] mb-1">Structured Requirement Schema</h4>
                  <p className="text-xs text-[#586A5F] mb-3">Normalized structured tuple representation.</p>
                  <div className="p-3 bg-[#132E22] text-[#D8EFE0] rounded-xl font-mono text-[11px] leading-relaxed">
                    {`{\n  "subject": "Banks",\n  "modality": "may",\n  "action": "extend",\n  "object": "credit facilities",\n  "target": "small and marginal farmers"\n}`}
                  </div>
                </div>
                <div className="text-[11px] text-[#63756A] pt-3 border-t border-[#EDF2EB]">
                  Structured extraction V3 standard schema.
                </div>
              </motion.div>
            )}

            {activeStage === 'changes' && (
              <motion.div
                key="changes"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#112117] mb-1">Semantic Change Detection</h4>
                  <p className="text-xs text-[#586A5F] mb-3">Old vs New version alignment and obligation shift.</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[#F0F7F2] rounded-lg border border-[#D5E6D8] flex items-center justify-between">
                      <span className="text-[#4E5E54]">2020: &lsquo;may extend&rsquo; &rarr; 2025: &lsquo;shall extend&rsquo;</span>
                      <span className="font-bold text-[#15803D] bg-white px-2 py-0.5 rounded border border-[#BDE3C7]">Higher Obligation</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#63756A] pt-3 border-t border-[#EDF2EB]">
                  Materiality: Substantive operational requirement modification.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
