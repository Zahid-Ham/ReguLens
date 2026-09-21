import React from 'react'
import {
  FileText,
  BookOpen,
  AlertTriangle,
  Link2,
  ShieldCheck,
  Target,
  ArrowUpRight,
} from 'lucide-react'

export default function InsightsMetricCards({ kpis = {} }) {
  const cards = [
    {
      id: 'total_analyses',
      label: 'Total Analyses',
      value: kpis.total_analyses ?? 0,
      delta: kpis.total_analyses_delta || '+0% vs. previous period',
      icon: FileText,
      iconBg: 'bg-[#EBF3FC]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: 'regulatory_changes',
      label: 'Regulatory Changes',
      value: kpis.regulatory_changes ?? 0,
      delta: kpis.regulatory_changes_delta || '+0% vs. previous period',
      icon: BookOpen,
      iconBg: 'bg-[#EDF8F1]',
      iconColor: 'text-[#16A34A]',
    },
    {
      id: 'potential_gaps',
      label: 'Potential Gaps',
      value: kpis.potential_gaps ?? 0,
      delta: kpis.potential_gaps_delta || '+0% vs. previous period',
      icon: AlertTriangle,
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-[#DC2626]',
    },
    {
      id: 'substantive_changes',
      label: 'Substantive Changes',
      value: kpis.substantive_changes ?? 0,
      delta: kpis.substantive_changes_delta || '+0% vs. previous period',
      icon: Link2,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#3B82F6]',
    },
    {
      id: 'policies_mapped',
      label: 'Policies Mapped',
      value: kpis.policies_mapped ?? 0,
      delta: kpis.policies_mapped_delta || '+0% vs. previous period',
      icon: ShieldCheck,
      iconBg: 'bg-[#EDF8F1]',
      iconColor: 'text-[#16A34A]',
    },
    {
      id: 'policy_coverage',
      label: 'Policy Coverage',
      value: `${kpis.policy_coverage_pct ?? 0}%`,
      delta: kpis.policy_coverage_delta || '+0% vs. previous period',
      icon: Target,
      iconBg: 'bg-[#EDF8F1]',
      iconColor: 'text-[#16A34A]',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.id}
            className="bg-white border border-[#E2EAE0] hover:border-[#CBDBC8] rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 shadow-2xs hover:shadow-xs group"
          >
            {/* Top row: Icon and value */}
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold font-sans text-[#112117] tracking-tight">
                {c.value}
              </span>
            </div>

            {/* Middle: Label */}
            <div className="mt-3">
              <span className="text-[12.5px] font-semibold text-[#4A5D51] block leading-snug truncate">
                {c.label}
              </span>
            </div>

            {/* Bottom: Delta indicator */}
            <div className="mt-2 pt-2 border-t border-[#F0F4EE] flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
              <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{c.delta}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
