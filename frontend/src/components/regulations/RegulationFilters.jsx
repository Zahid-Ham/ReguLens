import React from 'react'
import { Search, Building2, Layers, Filter, ArrowUpDown, X } from 'lucide-react'

export default function RegulationFilters({
  search,
  onSearchChange,
  regulator,
  onRegulatorChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  filterOptions = {},
  onResetFilters,
}) {
  const regulators = filterOptions.regulators || ['RBI']
  const categories = filterOptions.categories || []
  const statuses = filterOptions.statuses || ['Processed', 'Processing', 'Pending']

  const isFiltered =
    Boolean(search) ||
    (Boolean(regulator) && regulator !== 'all' && regulator !== 'All Regulators') ||
    (Boolean(category) && category !== 'all' && category !== 'All Categories') ||
    (Boolean(status) && status !== 'all' && status !== 'All Statuses') ||
    (Boolean(sort) && sort !== 'date_desc')

  return (
    <div className="bg-white border border-[#EAEFE8] rounded-xl p-3 sm:p-3.5 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#718277] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents, titles, or keywords..."
            className="w-full pl-9 pr-8 py-2 bg-[#FAFBF9] border border-[#E0E8DE] rounded-lg text-xs sm:text-sm text-[#19221C] placeholder-[#8A9B90] focus:outline-none focus:ring-1.5 focus:ring-[#132E22] focus:border-[#132E22] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A9B90] hover:text-[#19221C] p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Regulator Filter */}
          <div className="relative">
            <select
              value={regulator}
              onChange={(e) => onRegulatorChange(e.target.value)}
              className="appearance-none pl-8 pr-7 py-2 bg-[#FAFBF9] border border-[#E0E8DE] rounded-lg text-xs font-medium text-[#19221C] hover:border-[#CAD8C7] focus:outline-none focus:ring-1.5 focus:ring-[#132E22] focus:border-[#132E22] cursor-pointer"
            >
              <option value="all">All Regulators</option>
              {regulators.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-[#718277] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="text-[10px] text-[#718277] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 bg-[#FAFBF9] border border-[#E0E8DE] rounded-lg text-xs font-medium text-[#19221C] hover:border-[#CAD8C7] focus:outline-none focus:ring-1.5 focus:ring-[#132E22] focus:border-[#132E22] cursor-pointer max-w-[170px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-[#718277] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 bg-[#FAFBF9] border border-[#E0E8DE] rounded-lg text-xs font-medium text-[#19221C] hover:border-[#CAD8C7] focus:outline-none focus:ring-1.5 focus:ring-[#132E22] focus:border-[#132E22] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-[#718277] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 bg-[#FAFBF9] border border-[#E0E8DE] rounded-lg text-xs font-medium text-[#19221C] hover:border-[#CAD8C7] focus:outline-none focus:ring-1.5 focus:ring-[#132E22] focus:border-[#132E22] cursor-pointer"
            >
              <option value="date_desc">Sort by: Date (Newest)</option>
              <option value="date_asc">Sort by: Date (Oldest)</option>
              <option value="name_asc">Sort by: Name (A–Z)</option>
              <option value="name_desc">Sort by: Name (Z–A)</option>
              <option value="clauses_desc">Sort by: Clause Count</option>
            </select>
            <span className="text-[10px] text-[#718277] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#627368] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
