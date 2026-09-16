import React from 'react'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertOctagon,
} from 'lucide-react'

export function PolicyMetricCards({ summary, hasPolicy }) {
  if (!hasPolicy || !summary) return null

  const total = summary.total_regulatory_requirements || 0
  const mapped = summary.mapped_to_policy ?? summary.mapped_to_company_policy ?? 0
  const gaps = summary.policy_gaps || 0
  const partial = summary.partial_matches || 0
  const noMatch = summary.no_match_found || 0
  const coveragePct = summary.coverage_percentage ?? (total > 0 ? Math.round((mapped / total) * 100) : 0)

  const cards = [
    {
      id: 'total',
      label: 'Total Regulatory Requirements',
      value: total,
      badge: null,
      subtext: 'Enforceable clauses identified for alignment',
      icon: FileText,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      valueColor: 'text-[#112117]',
    },
    {
      id: 'mapped',
      label: 'Mapped to Company Policy',
      value: mapped,
      badge: `${coveragePct}% coverage`,
      badgeColor: coveragePct >= 80 ? 'emerald' : 'amber',
      subtext: 'Clauses with matched policy provisions',
      icon: CheckCircle2,
      iconBg: 'bg-[#EDF4ED] text-[#132E22]',
      valueColor: 'text-[#132E22]',
    },
    {
      id: 'gaps',
      label: 'Policy Gaps',
      value: gaps,
      badge: gaps > 0 ? 'Requires Action' : 'All Clear',
      badgeColor: gaps > 0 ? 'rose' : 'emerald',
      subtext: 'Non-compliant parameter or constraint differences',
      icon: AlertOctagon,
      iconBg: 'bg-[#FDF2F2] text-[#DC2626]',
      valueColor: 'text-[#DC2626]',
    },
    {
      id: 'partial',
      label: 'Partial Matches',
      value: partial,
      badge: partial > 0 ? 'Review Needed' : null,
      badgeColor: 'amber',
      subtext: 'Ambiguous wording or broader policy scope',
      icon: AlertTriangle,
      iconBg: 'bg-[#FEF9EE] text-[#D97706]',
      valueColor: 'text-[#D97706]',
    },
    {
      id: 'nomatch',
      label: 'No Match Found',
      value: noMatch,
      badge: noMatch > 0 ? 'Uncovered' : null,
      badgeColor: 'slate',
      subtext: 'Regulatory mandates missing in company policy',
      icon: HelpCircle,
      iconBg: 'bg-[#F1F5F9] text-[#64748B]',
      valueColor: 'text-[#475569]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.id}
            className="bg-white border border-[#E0E8DE] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs hover:border-[#CAD8C9] transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[12px] font-semibold text-[#112117] leading-tight min-h-[32px]">{c.label}</span>
              <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-2xl sm:text-[26px] font-bold tracking-tight ${c.valueColor}`}>
                {c.value}
              </span>
              {c.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    c.badgeColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : c.badgeColor === 'rose'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : c.badgeColor === 'amber'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {c.badge}
                </span>
              )}
            </div>

            <p className="text-[11.5px] text-[#55675C] leading-snug line-clamp-2">{c.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
