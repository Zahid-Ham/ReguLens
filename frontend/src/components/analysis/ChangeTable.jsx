import React from 'react'
import ChangeRow from './ChangeRow'
import ResultsEmptyState from './ResultsEmptyState'

export default function ChangeTable({ records = [], onViewClause, onResetFilters }) {
  if (records.length === 0) {
    return (
      <div className="bg-white border border-[#E0E8DE] rounded-2xl shadow-xs overflow-hidden">
        <ResultsEmptyState onReset={onResetFilters} />
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl shadow-xs overflow-hidden flex flex-col w-full">
      {/* Table View */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse min-w-[700px]">
          <thead className="bg-[#FAFBF9] border-b border-[#EAEFE8] text-[11px] font-bold text-[#55675C] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-[12%]">Provision</th>
              <th className="py-3.5 px-4 w-[28%]">Title / Description</th>
              <th className="py-3.5 px-4 w-[16%]">Change Type</th>
              <th className="py-3.5 px-4 w-[26%]">Key Change</th>
              <th className="py-3.5 px-4 w-[10%]">Materiality</th>
              <th className="py-3.5 px-4 w-[8%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEFE8]">
            {records.map((record) => (
              <ChangeRow
                key={record.id}
                record={record}
                onViewClause={onViewClause}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count Indicator */}
      <div className="px-5 py-3.5 bg-[#FAFBF9] border-t border-[#EAEFE8] flex items-center justify-between text-xs text-[#55675C]">
        <span>
          Showing <strong className="text-[#112117]">{records.length}</strong> provisions
        </span>
        <span className="text-[11px] text-[#718277]">
          Click any row to expand comparative clause delta
        </span>
      </div>
    </div>
  )
}
