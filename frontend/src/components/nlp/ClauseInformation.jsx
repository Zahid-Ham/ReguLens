import React from 'react'
import { Info } from 'lucide-react'

export default function ClauseInformation({ metadata = {} }) {
  const fields = [
    { label: 'Document', value: metadata.document_title || metadata.document_id || 'CDD Regulation 2025' },
    { label: 'Clause ID', value: metadata.provision_id || metadata.clause_id || '3.2.1' },
    { label: 'Section', value: metadata.section || 'Customer Due Diligence' },
    { label: 'Page Number', value: metadata.page_number || 1 },
    { label: 'Regulator', value: metadata.regulator || 'RBI' },
    { label: 'Document Type', value: metadata.document_type || 'Master Direction' },
    { label: 'Effective Date', value: metadata.effective_date || 'Apr 1, 2025' },
    { label: 'Source', value: metadata.source || 'Official RBI Master Direction' },
  ]

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#F0F4EE]">
        <Info className="w-4 h-4 text-[#1E4333]" />
        <h3 className="text-[14px] font-bold text-[#112117]">
          Clause Information
        </h3>
      </div>

      {/* Field List */}
      <div className="space-y-2.5 text-[12.5px]">
        {fields.map((f) => (
          <div key={f.label} className="flex items-start justify-between gap-3">
            <span className="text-[#6C7E72] font-medium flex-shrink-0">
              {f.label}
            </span>
            <span className="text-[#112117] font-semibold text-right truncate">
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
