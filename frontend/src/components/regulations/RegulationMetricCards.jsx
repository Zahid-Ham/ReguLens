import React from 'react'
import { FileText, Landmark, Layers, CheckCircle2, Clock } from 'lucide-react'

export default function RegulationMetricCards({ metrics, loading = false }) {
  const cards = [
    {
      id: 'total_documents',
      label: 'Total Documents',
      value: metrics?.total_documents ?? 0,
      sublabel: 'Across all regulators',
      icon: FileText,
      iconBg: 'bg-[#EFF6FF]',
      iconBorder: 'border-[#DBEAFE]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: 'regulatory_authorities',
      label: 'Regulatory Authorities',
      value: metrics?.regulatory_authorities_count ?? 0,
      sublabel: metrics?.regulatory_authorities?.length
        ? metrics.regulatory_authorities.slice(0, 3).join(', ') + (metrics.regulatory_authorities.length > 3 ? ', etc.' : '')
        : 'RBI, SEBI, IRDAI, etc.',
      icon: Landmark,
      iconBg: 'bg-[#ECFDF5]',
      iconBorder: 'border-[#D1FAE5]',
      iconColor: 'text-[#059669]',
    },
    {
      id: 'document_categories',
      label: 'Document Categories',
      value: metrics?.document_categories_count ?? 0,
      sublabel: 'PSL, KYC, AML, IT, etc.',
      icon: Layers,
      iconBg: 'bg-[#EEF2FF]',
      iconBorder: 'border-[#E0E7FF]',
      iconColor: 'text-[#4F46E5]',
    },
    {
      id: 'processed',
      label: 'Processed',
      value: metrics?.processed_count ?? 0,
      sublabel: 'Ready for analysis',
      icon: CheckCircle2,
      iconBg: 'bg-[#F0FDF4]',
      iconBorder: 'border-[#DCFCE7]',
      iconColor: 'text-[#16A34A]',
    },
    {
      id: 'processing',
      label: 'Processing',
      value: metrics?.processing_count ?? 0,
      sublabel: 'In progress',
      icon: Clock,
      iconBg: 'bg-[#FFFBEB]',
      iconBorder: 'border-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className="bg-white border border-[#EAEFE8] rounded-xl p-4 sm:p-4.5 flex items-start gap-3.5 shadow-xs hover:border-[#D6E0D3] transition-all"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${card.iconBg} ${card.iconBorder} ${card.iconColor}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-6 w-12 bg-slate-200 rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  <div className="h-2.5 w-16 bg-slate-100 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-[#112117] leading-none tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-xs font-semibold text-[#19221C] mt-1 truncate">
                    {card.label}
                  </div>
                  <div className="text-[11px] text-[#718277] mt-0.5 truncate">
                    {card.sublabel}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
