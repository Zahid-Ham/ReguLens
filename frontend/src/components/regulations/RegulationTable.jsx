import React from 'react'
import RegulationTableRow from './RegulationTableRow'
import RegulationPagination from './RegulationPagination'
import { FileSearch } from 'lucide-react'

export default function RegulationTable({
  documents = [],
  total = 0,
  page = 1,
  pageSize = 10,
  loading = false,
  selectedDocId = null,
  onSelectDoc,
  onViewDoc,
  onDownloadDoc,
  onUseInNewAnalysis,
  onInspectInNLP,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}) {
  return (
    <div className="bg-white border border-[#EAEFE8] rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto min-w-full flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F6F9F5] border-b border-[#EAEFE8] text-[11px] font-semibold text-[#55675C] uppercase tracking-wider">
              <th className="py-3 px-4">Document Name</th>
              <th className="py-3 px-3">Regulator</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Version / Year</th>
              <th className="py-3 px-3">Effective Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F0F4EF]">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-100 rounded"></div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-4 w-10 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-4 w-20 bg-slate-100 rounded-full"></div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-3 w-10 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-3 w-16 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="h-4 w-12 bg-slate-100 rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : documents.length === 0 ? (
              // Empty State inside table
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#EDF4ED] text-[#55675C] flex items-center justify-center mb-3">
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#112117]">No regulatory documents found</h3>
                    <p className="text-xs text-[#718277] mt-1 leading-relaxed">
                      No documents match your active search or filter criteria. Try adjusting your query.
                    </p>
                    {onResetFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-3 px-3 py-1.5 bg-[#132E22] text-[#FAFBF9] text-xs font-medium rounded-lg hover:bg-[#1E4333] transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <RegulationTableRow
                  key={doc.document_id}
                  doc={doc}
                  isSelected={selectedDocId === doc.document_id}
                  onSelect={onSelectDoc}
                  onView={onViewDoc}
                  onDownload={onDownloadDoc}
                  onUseInNewAnalysis={onUseInNewAnalysis}
                  onInspectInNLP={onInspectInNLP}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!loading && total > 0 && (
        <RegulationPagination
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
