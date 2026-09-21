import React from 'react'
import { FileCode } from 'lucide-react'

export default function ExtractedRequirementCard({ requirement = {} }) {
  const fields = [
    { label: 'Action', value: requirement.action || 'Review' },
    { label: 'Subject', value: requirement.subject || 'High-risk customers' },
    { label: 'Frequency', value: requirement.frequency || 'At least once every 12 months' },
    { label: 'Purpose', value: requirement.purpose || 'Ongoing due diligence and risk assessment' },
    { label: 'Deadline', value: requirement.deadline },
    { label: 'Duration', value: requirement.duration },
    { label: 'Threshold', value: requirement.threshold },
  ].filter((f) => f.value && String(f.value).trim() && String(f.value).toLowerCase() !== 'nan')

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#F0F4EE]">
        <FileCode className="w-4 h-4 text-[#2563EB]" />
        <h3 className="text-[14px] font-bold text-[#112117]">
          Extracted Requirement
        </h3>
      </div>

      {/* Attributes */}
      <div className="space-y-2.5 text-[12.5px]">
        {fields.map((f) => (
          <div key={f.label} className="flex items-start justify-between gap-3">
            <span className="text-[#6C7E72] font-medium flex-shrink-0">
              {f.label}
            </span>
            <span className="text-[#112117] font-semibold text-right max-w-[200px] leading-snug">
              {f.value}
            </span>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="py-2 text-center text-[#86978C] text-[12px]">
            No structured requirement extracted.
          </div>
        )}
      </div>
    </div>
  )
}
