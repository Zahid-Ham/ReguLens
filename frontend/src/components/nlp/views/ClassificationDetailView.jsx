import React from 'react'
import ClauseClassificationCard from '../ClauseClassificationCard'
import { ShieldAlert, BookOpen, Layers } from 'lucide-react'

export default function ClassificationDetailView({ clauseDetail = null }) {
  if (!clauseDetail) return null

  const cls = clauseDetail.classification || {}

  const classes = [
    { label: 'OBLIGATION', desc: 'Mandatory active requirement or directive.' },
    { label: 'PROHIBITION', desc: 'Strict prohibition or forbidden practice.' },
    { label: 'PERMISSION', desc: 'Discretionary allowance or conditional privilege.' },
    { label: 'EXCEPTION', desc: 'Exemption or carve-out from general requirement.' },
    { label: 'DEFINITION', desc: 'Defines terminology, formula, or legal term.' },
    { label: 'PROCEDURE', desc: 'Step-by-step operational workflow.' },
    { label: 'REPORTING', desc: 'Statutory filing, submission, or return.' },
    { label: 'PENALTY', desc: 'Enforcement consequence or statutory fine.' },
    { label: 'REFERENCE', desc: 'Citation to another circular, act, or section.' },
    { label: 'INFORMATION', desc: 'Background context or introductory context.' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-5 space-y-4">
        <ClauseClassificationCard classification={cls} />
      </div>

      <div className="lg:col-span-7 space-y-4">
        {/* Rationale & Source Details */}
        <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs space-y-3">
          <h4 className="text-[14.5px] font-bold text-[#112117] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1E4333]" />
            Classification Methodology & Rationale
          </h4>

          <div className="p-3.5 bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl text-[12.5px] space-y-2">
            <div>
              <span className="text-[#6C7E72] block text-[11px] font-semibold uppercase">Linguistic Rationale</span>
              <p className="text-[#112117] font-medium mt-0.5 leading-snug">
                {cls.rationale || 'Classified based on deontic verb and syntactic structure.'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F0F4EE] flex justify-between">
              <span className="text-[#6C7E72]">Classification Source:</span>
              <span className="font-semibold text-[#1E4333]">{cls.classification_source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6C7E72]">Confidence Score:</span>
              <span className="font-bold text-[#112117]">{Math.round((cls.confidence || 0.95) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* 10-Class Taxonomy Reference */}
        <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
          <h4 className="text-[14px] font-bold text-[#112117] mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1E4333]" />
            ReguLens 10-Class Regulatory Function Taxonomy
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
            {classes.map((c) => {
              const isActive = (cls.clause_type || '').toUpperCase() === c.label
              return (
                <div
                  key={c.label}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#EDF8F1] border-[#86EFAC] text-[#132E22]'
                      : 'bg-[#FAFBF9] border-[#EAEFE8] text-[#55675C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-[11.5px]">{c.label}</span>
                    {isActive && (
                      <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#16A34A] text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-tight">{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
