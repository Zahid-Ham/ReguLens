import React from 'react'
import { FileText, AlertTriangle, Plus, Minus, Equal, Info } from 'lucide-react'

export default function ResultsSummary({ summary, totalBaseline, isFiltered = false }) {
  if (!summary) return null

  const cards = [
    {
      id: 'total',
      count: summary.total ?? 0,
      label: isFiltered ? 'Filtered Records' : 'Total Comparison Records',
      description: isFiltered
        ? `Matching ${summary.total ?? 0} of ${totalBaseline ?? summary.total ?? 0} provisions`
        : 'Provisions analyzed across both versions',
      icon: FileText,
      iconBg: 'bg-[#EDF4ED] text-[#132E22]',
      percentage: isFiltered && totalBaseline ? `${Math.round(((summary.total ?? 0) / totalBaseline) * 100)}% of total` : null,
      textColor: 'text-[#112117]',
    },
    {
      id: 'substantive',
      count: summary.substantive ?? 0,
      label: 'Substantive Changes',
      description: 'Material changes in requirements',
      icon: AlertTriangle,
      iconBg: 'bg-[#FDF2F2] text-[#DC2626]',
      percentage: `${summary.substantivePct ?? 0}%`,
      textColor: 'text-[#DC2626]',
    },
    {
      id: 'wording',
      count: summary.wordingOnly ?? 0,
      label: 'Wording-only Changes',
      description: 'Non-material text updates',
      icon: FileText,
      iconBg: 'bg-[#FEF9EE] text-[#D97706]',
      percentage: `${summary.wordingOnlyPct ?? 0}%`,
      textColor: 'text-[#D97706]',
    },
    {
      id: 'added',
      count: summary.added ?? 0,
      label: 'Added Candidates',
      candidateBadge: true,
      description: 'Potential new requirements',
      icon: Plus,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      percentage: `${summary.addedPct ?? 0}%`,
      textColor: 'text-[#2563EB]',
    },
    {
      id: 'removed',
      count: summary.removed ?? 0,
      label: 'Removed Candidates',
      candidateBadge: true,
      description: 'Provisions not mapped in updated version',
      icon: Minus,
      iconBg: 'bg-[#F1F5F9] text-[#64748B]',
      percentage: `${summary.removedPct ?? 0}%`,
      textColor: 'text-[#64748B]',
    },
    {
      id: 'unchanged',
      count: summary.unchanged ?? 0,
      label: 'Unchanged',
      description: 'Identical across both versions',
      icon: Equal,
      iconBg: 'bg-[#F8FAFC] text-[#94A3B8]',
      percentage: `${summary.unchangedPct ?? 0}%`,
      textColor: 'text-[#334155]',
    },
  ]

  return (
    <div className="flex flex-col space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.id}
              className="bg-white border border-[#E0E8DE] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs hover:border-[#CAD8C9] transition-all group"
            >
              {/* Top Row: Icon + Count */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-2xl sm:text-[26px] font-bold tracking-tight ${card.textColor}`}>
                  {card.count}
                </span>
              </div>

              {/* Middle: Label & Candidate Tag */}
              <div className="flex flex-col mt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[12.5px] font-semibold ${card.textColor} leading-snug`}>
                    {card.label}
                  </span>
                </div>
                <span className="text-[11px] text-[#55675C] mt-1 leading-snug">
                  {card.description}
                </span>
              </div>

              {/* Bottom: Percentage Indicator */}
              {card.percentage && (
                <div className="mt-2.5 pt-2 border-t border-[#F0F4EF] flex items-center justify-end">
                  <span className={`text-[11px] font-bold ${card.textColor}`}>
                    {card.percentage}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Subtle Transparency / Methodology Note */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FAFBF9] border border-[#E5ECE3] rounded-xl text-[11.5px] text-[#55675C]">
        <Info className="w-3.5 h-3.5 text-[#2C634D] flex-shrink-0" />
        <span>
          <strong className="font-semibold text-[#112117]">Methodology Note:</strong> Added and removed provisions are identified as <em>candidates</em> via semantic alignment thresholds and require regulatory expert review.
        </span>
      </div>
    </div>
  )
}
