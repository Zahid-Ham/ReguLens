import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'

export function PolicyMappingTable({ mappings = [], summary, onViewEvidence }) {
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  // Counts for tabs
  const tabCounts = useMemo(() => {
    let all = mappings.length
    let compliant = 0
    let partial = 0
    let nonCompliant = 0
    let noPolicy = 0

    mappings.forEach((m) => {
      if (m.compliance_status === 'COMPLIANT') compliant++
      else if (m.compliance_status === 'PARTIAL_MATCH') partial++
      else if (m.compliance_status === 'NON_COMPLIANT') nonCompliant++
      else if (m.compliance_status === 'NO_MATCH_FOUND') noPolicy++
    })

    return { all, compliant, partial, nonCompliant, noPolicy }
  }, [mappings])

  // Filtered rows
  const filteredMappings = useMemo(() => {
    return mappings.filter((m) => {
      // Tab filter
      if (activeTab === 'COMPLIANT' && m.compliance_status !== 'COMPLIANT') return false
      if (activeTab === 'PARTIAL' && m.compliance_status !== 'PARTIAL_MATCH') return false
      if (activeTab === 'NON_COMPLIANT' && m.compliance_status !== 'NON_COMPLIANT') return false
      if (activeTab === 'NO_POLICY' && m.compliance_status !== 'NO_MATCH_FOUND') return false

      // Severity filter
      if (severityFilter !== 'ALL' && m.severity !== severityFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const regText = (m.regulatory_evidence?.clause_text || '').toLowerCase()
        const regProv = (m.regulatory_evidence?.provision_id || '').toLowerCase()
        const polText = (m.policy_evidence?.clause_text || '').toLowerCase()
        const polSec = (m.policy_evidence?.section_id || '').toLowerCase()
        const polTitle = (m.policy_evidence?.section_title || '').toLowerCase()
        const gapDesc = (m.gap_details || m.gap_description || '').toLowerCase()

        return (
          regText.includes(q) ||
          regProv.includes(q) ||
          polText.includes(q) ||
          polSec.includes(q) ||
          polTitle.includes(q) ||
          gapDesc.includes(q)
        )
      }

      return true
    })
  }, [mappings, activeTab, severityFilter, searchQuery])

  const tabs = [
    { id: 'ALL', label: 'All', count: tabCounts.all },
    { id: 'COMPLIANT', label: 'Compliant', count: tabCounts.compliant },
    { id: 'PARTIAL', label: 'Partial Match', count: tabCounts.partial },
    { id: 'NON_COMPLIANT', label: 'Non-Compliant', count: tabCounts.nonCompliant },
    { id: 'NO_POLICY', label: 'No Policy', count: tabCounts.noPolicy },
  ]

  return (
    <div className="rounded-2xl border border-[#E0E8DE] bg-white shadow-xs overflow-hidden space-y-0">
      {/* Top Controls: Tabs & Search */}
      <div className="p-4 sm:p-5 border-b border-[#E2EBE0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-[#FAFBF9] text-[#55675C] hover:text-[#112117] hover:bg-[#F4F7F4] border border-[#E0E8DE]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Severity Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#88998C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clauses, policy, gaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFBF9] border border-[#E0E8DE] focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#112117] placeholder:text-[#88998C] focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#FAFBF9] border border-[#E0E8DE] focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-[#112117] focus:outline-none transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
              <option value="NONE">None</option>
            </select>
            <Filter className="w-3 h-3 text-[#88998C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0E8DE] bg-[#FAFBF9] text-[11px] font-semibold text-[#55675C] uppercase tracking-wider">
              <th className="py-3 px-4 w-[30%]">Regulatory Requirement</th>
              <th className="py-3 px-4 w-[28%]">Matched Company Policy</th>
              <th className="py-3 px-4 w-[14%]">Compliance Status</th>
              <th className="py-3 px-4 w-[18%]">Gap Details</th>
              <th className="py-3 px-4 w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2EBE0]">
            {filteredMappings.length > 0 ? (
              filteredMappings.map((row) => {
                const isCompliant = row.compliance_status === 'COMPLIANT'
                const isPartial = row.compliance_status === 'PARTIAL_MATCH'
                const isNonCompliant = row.compliance_status === 'NON_COMPLIANT'
                const isNoMatch = row.compliance_status === 'NO_MATCH_FOUND'
                const mismatches = row.mismatches || row.parameter_mismatches || []
                const gapText = row.gap_details || row.gap_description

                return (
                  <tr
                    key={row.mapping_id}
                    className="hover:bg-[#FAFBF9]/80 transition-colors group"
                  >
                    {/* Column 1: Regulatory Requirement */}
                    <td className="py-3.5 px-4 align-top space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {row.regulatory_evidence?.provision_id && (
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            {row.regulatory_evidence.provision_id}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {row.regulatory_evidence?.obligation_type || 'Mandate'}
                        </span>
                      </div>
                      <p className="text-[#112117] leading-relaxed line-clamp-3">
                        {row.regulatory_evidence?.clause_text}
                      </p>
                    </td>

                    {/* Column 2: Matched Company Policy */}
                    <td className="py-3.5 px-4 align-top space-y-1.5">
                      {row.policy_evidence?.section_id ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {row.policy_evidence.section_id}
                            </span>
                            {row.policy_evidence.section_title && (
                              <span className="text-[11px] font-semibold text-[#112117] line-clamp-1">
                                {row.policy_evidence.section_title}
                              </span>
                            )}
                          </div>
                          <p className="text-[#55675C] leading-relaxed line-clamp-3">
                            {row.policy_evidence.clause_text}
                          </p>
                        </>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-dashed border-[#CAD8C9] text-[#88998C] italic text-[11px]">
                          No corresponding company policy clause found.
                        </div>
                      )}
                    </td>

                    {/* Column 3: Compliance Status */}
                    <td className="py-3.5 px-4 align-top space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs">
                        {isCompliant && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Compliant</span>
                          </span>
                        )}
                        {isPartial && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Partial Match</span>
                          </span>
                        )}
                        {isNonCompliant && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border-rose-200">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            <span>Non-Compliant</span>
                          </span>
                        )}
                        {isNoMatch && (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 border-slate-200">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>No Policy</span>
                          </span>
                        )}
                      </div>

                      {row.severity && row.severity !== 'NONE' && (
                        <div className="text-[10px] font-semibold tracking-wide">
                          <span
                            className={
                              row.severity === 'HIGH'
                                ? 'text-rose-600 font-bold'
                                : row.severity === 'MEDIUM'
                                ? 'text-amber-700 font-bold'
                                : 'text-blue-700 font-bold'
                            }
                          >
                            {row.severity} RISK
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Column 4: Gap Details */}
                    <td className="py-3.5 px-4 align-top space-y-1">
                      {row.gap_type ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                          {row.gap_type.replace(/_/g, ' ')}
                        </span>
                      ) : isCompliant ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Parameters Aligned
                        </span>
                      ) : null}

                      {gapText && (
                        <p className="text-[11.5px] text-[#55675C] leading-relaxed line-clamp-2">
                          {gapText}
                        </p>
                      )}

                      {mismatches.length > 0 && (
                        <div className="pt-1 space-y-1 text-[10px] font-mono">
                          {mismatches.map((pm, pidx) => (
                            <div key={pidx} className="text-[#334155] bg-[#FAFBF9] p-1.5 rounded border border-[#E2EBE0]">
                              <span className="text-[#55675C] font-semibold">{pm.dimension}:</span>{' '}
                              <span className="text-rose-700 font-bold">Req [{pm.regulatory_value}]</span> vs{' '}
                              <span className="text-amber-700 font-bold">Pol [{pm.policy_value}]</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Column 5: Action */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <button
                        onClick={() => onViewEvidence && onViewEvidence(row.mapping_id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-2xs active:scale-95"
                      >
                        <span>Evidence</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#55675C]">
                  <p className="text-sm font-semibold text-[#112117]">No policy mapping records match the criteria.</p>
                  <p className="text-xs text-[#88998C] mt-1">Try resetting the filter tabs or search query.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
