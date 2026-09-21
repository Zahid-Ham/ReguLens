import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function ClauseClassificationCard({ classification = {} }) {
  const getModalityBadge = (mod) => {
    const clean = (mod || '').toUpperCase()
    if (clean === 'MANDATORY') {
      return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]'
    }
    if (clean === 'DISCRETIONARY' || clean === 'PERMISSION') {
      return 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]'
    }
    if (clean === 'PROHIBITIVE' || clean === 'PROHIBITION') {
      return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
    }
    return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
  }

  const getMaterialityBadge = (mat) => {
    const clean = (mat || '').toUpperCase()
    if (clean === 'HIGH') {
      return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
    }
    if (clean === 'MEDIUM') {
      return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
    }
    return 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
  }

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#F0F4EE]">
        <CheckCircle2 className="w-4 h-4 text-[#1E4333]" />
        <h3 className="text-[14px] font-bold text-[#112117]">
          Clause Classification
        </h3>
      </div>

      {/* Attributes */}
      <div className="space-y-2.5 text-[12.5px]">
        {/* Clause Type */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#6C7E72] font-medium">Clause Type</span>
          <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-extrabold uppercase tracking-wider bg-[#EDF8F1] text-[#16A34A] border border-[#BBF7D0]">
            {classification.clause_type || 'OBLIGATION'}
          </span>
        </div>

        {/* Regulatory Function */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#6C7E72] font-medium">Regulatory Function</span>
          <span className="text-[#112117] font-semibold text-right truncate">
            {classification.regulatory_function || 'Customer Due Diligence'}
          </span>
        </div>

        {/* Topic */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#6C7E72] font-medium">Topic</span>
          <span className="text-[#112117] font-semibold text-right truncate">
            {classification.topic || 'Periodic Review'}
          </span>
        </div>

        {/* Sub-topic */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#6C7E72] font-medium">Sub-topic</span>
          <span className="text-[#112117] font-semibold text-right truncate">
            {classification.sub_topic || 'High-Risk Customers'}
          </span>
        </div>

        {/* Modality */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#6C7E72] font-medium">Modality</span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-extrabold uppercase tracking-wider border ${getModalityBadge(
              classification.modality
            )}`}
          >
            {classification.modality || 'MANDATORY'}
          </span>
        </div>

        {/* Materiality */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#6C7E72] font-medium">Materiality</span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-extrabold uppercase tracking-wider border ${getMaterialityBadge(
              classification.materiality
            )}`}
          >
            {classification.materiality || 'HIGH'}
          </span>
        </div>
      </div>
    </div>
  )
}
