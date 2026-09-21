import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function RegulationPagination({
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(total, page * pageSize)

  // Generate page numbers to show (e.g. up to 5 around current page)
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 5)
      } else if (page >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(page - 2, page - 1, page, page + 1, page + 2)
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#EAEFE8] rounded-b-xl text-xs text-[#55675C]">
      {/* Total documents count */}
      <div className="font-medium text-[#718277]">
        Showing <span className="font-semibold text-[#112117]">{startItem}</span> to{' '}
        <span className="font-semibold text-[#112117]">{endItem}</span> of{' '}
        <span className="font-semibold text-[#112117]">{total}</span> documents
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-lg border border-[#E0E8DE] bg-white text-[#55675C] hover:bg-[#F4F7F3] hover:text-[#112117] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p) => {
            const isActive = p === page
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-[#132E22] border-2 border-[#132E22] shadow-xs'
                    : 'bg-white text-[#55675C] border border-[#E0E8DE] hover:bg-[#F4F7F3] hover:text-[#112117]'
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-lg border border-[#E0E8DE] bg-white text-[#55675C] hover:bg-[#F4F7F3] hover:text-[#112117] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="ml-2 relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none pl-2.5 pr-6 py-1 bg-[#FAFBF9] border border-[#E0E8DE] rounded-lg text-xs font-medium text-[#19221C] hover:border-[#CAD8C7] focus:outline-none focus:ring-1 focus:ring-[#132E22] cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <span className="text-[9px] text-[#718277] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>
        )}
      </div>
    </div>
  )
}
