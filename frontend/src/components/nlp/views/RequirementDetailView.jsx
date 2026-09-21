import React from 'react'
import { ArrowDown, CheckCircle, Database } from 'lucide-react'

export default function RequirementDetailView({ clauseDetail = null }) {
  if (!clauseDetail) return null

  const req = clauseDetail.requirement || {}
  const text = clauseDetail.clause_text || ''

  const fields = [
    { label: 'SUBJECT', value: req.subject, desc: 'Regulated entity or target class' },
    { label: 'MODALITY', value: req.modality, desc: 'Deontic auxiliary (shall / must / may)' },
    { label: 'ACTION', value: req.action, desc: 'Primary operative verb' },
    { label: 'FREQUENCY', value: req.frequency, desc: 'Recurrence timeframe or interval' },
    { label: 'DEADLINE', value: req.deadline, desc: 'Submission date or filing constraint' },
    { label: 'DURATION', value: req.duration, desc: 'Retention or operational period' },
    { label: 'THRESHOLD', value: req.threshold, desc: 'Monetary limit or percentage target' },
    { label: 'PURPOSE', value: req.purpose, desc: 'Regulatory compliance objective' },
    { label: 'OBJECT', value: req.object, desc: 'Direct object affected by action' },
    { label: 'CONDITION', value: req.condition, desc: 'Trigger prerequisite or condition' },
    { label: 'RECIPIENT', value: req.recipient, desc: 'Supervisory body receiving filing' },
  ].filter((f) => f.value && String(f.value).trim() && String(f.value).toLowerCase() !== 'nan')

  return (
    <div className="space-y-6">
      {/* Transformation Visual Banner */}
      <div className="bg-white border border-[#E2EAE0] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-[#1E4333]" />
          <h3 className="text-[15px] font-bold text-[#112117]">
            NLP Pipeline: Unstructured Text to Structured Requirement
          </h3>
        </div>

        {/* Unstructured Source Clause */}
        <div className="p-4 bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C7E72] block mb-1">
            Unstructured Regulatory Text
          </span>
          <p className="text-[14px] text-[#223328] font-serif italic leading-relaxed">
            &ldquo;{text}&rdquo;
          </p>
        </div>

        <div className="flex items-center justify-center my-2">
          <div className="w-8 h-8 rounded-full bg-[#EBF4EC] text-[#132E22] flex items-center justify-center shadow-2xs">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Structured Grid */}
        <div className="pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C7E72] block mb-3">
            Extracted Structured Attributes
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {fields.map((f) => (
              <div
                key={f.label}
                className="p-3.5 rounded-xl bg-white border border-[#DCE8DC] hover:border-[#B8D1BA] transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10.5px] font-bold tracking-wider font-mono text-[#1E4333] uppercase">
                    {f.label}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <span className="text-[13px] font-bold text-[#112117] block leading-snug">
                  {f.value}
                </span>
                <span className="text-[10.5px] text-[#6C7E72] block mt-1">
                  {f.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
