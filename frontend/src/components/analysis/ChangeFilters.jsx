import React, { useState } from 'react'
import { Search, Filter, Download, X, Check, RotateCcw } from 'lucide-react'

export default function ChangeFilters({
  activeTab = 'all',
  onTabChange,
  counts = {},
  searchQuery = '',
  onSearchChange,
  selectedChangeType = 'all',
  onChangeTypeChange,
  selectedMateriality = 'all',
  onMaterialityChange,
  onResetFilters,
  onExport,
}) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  const tabs = [
    { id: 'all', label: 'All Changes', count: counts.total ?? 0 },
    { id: 'substantive', label: 'Substantive', count: counts.substantive ?? 0 },
    { id: 'wording', label: 'Wording Only', count: (counts.wordingOnly ?? counts.wording_only) ?? 0 },
    { id: 'added', label: 'Added', count: (counts.added ?? counts.added_candidates) ?? 0 },
    { id: 'removed', label: 'Removed', count: (counts.removed ?? counts.removed_candidates) ?? 0 },
    { id: 'unchanged', label: 'Unchanged', count: counts.unchanged ?? 0 },
  ]

  const hasActiveFilters =
    activeTab !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedChangeType !== 'all' ||
    selectedMateriality !== 'all'

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none">
      {/* Left: Change Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#132E22] text-[#FAFBF9] shadow-xs'
                  : 'bg-white hover:bg-[#F2F6F1] text-[#4A5D51] hover:text-[#112117] border border-[#DCE4DA]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10.5px] font-bold ${
                  isActive ? 'bg-[#285A44] text-white' : 'bg-[#EBF2EA] text-[#334639]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right: Search, Filter Popover, Export */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#6A7E71] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search provisions..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#DCE4DA] rounded-xl text-[#112117] placeholder-[#76877D] focus:outline-none focus:ring-1 focus:ring-[#132E22] focus:border-[#132E22] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#829589] hover:text-[#112117]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
              selectedChangeType !== 'all' || selectedMateriality !== 'all'
                ? 'bg-[#EBF5EE] text-[#132E22] border-[#132E22]'
                : 'bg-white text-[#34463A] hover:text-[#112117] hover:bg-[#FAFBF9] border-[#DCE4DA]'
            }`}
            aria-expanded={filterPopoverOpen}
          >
            <Filter className="w-3.5 h-3.5 text-[#2C634D]" />
            <span>Filter</span>
            {(selectedChangeType !== 'all' || selectedMateriality !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-[#132E22]" />
            )}
          </button>

          {/* Filter Popover */}
          {filterPopoverOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DCE4DA] rounded-2xl shadow-xl p-4 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEFE8] mb-3">
                <span className="text-xs font-bold text-[#112117] uppercase tracking-wider">
                  Filter Records
                </span>
                <button
                  type="button"
                  onClick={() => setFilterPopoverOpen(false)}
                  className="text-[#64766A] hover:text-[#112117]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Change Type Filter */}
              <div className="space-y-2 mb-3.5">
                <label className="text-[11px] font-bold text-[#55675C] uppercase tracking-wider">
                  Change Type
                </label>
                <select
                  value={selectedChangeType}
                  onChange={(e) => onChangeTypeChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FAFBF9] border border-[#DCE4DA] rounded-lg text-[#112117] focus:outline-none focus:ring-1 focus:ring-[#132E22]"
                >
                  <option value="all">All Change Types</option>
                  <option value="MODIFIED">Modified (Substantive)</option>
                  <option value="WORDING_ONLY">Wording-only</option>
                  <option value="ADDED_CANDIDATE">Added (Candidate)</option>
                  <option value="REMOVED_CANDIDATE">Removed (Candidate)</option>
                  <option value="UNCHANGED">Unchanged</option>
                </select>
              </div>

              {/* Materiality Filter */}
              <div className="space-y-2 mb-4">
                <label className="text-[11px] font-bold text-[#55675C] uppercase tracking-wider">
                  Materiality
                </label>
                <select
                  value={selectedMateriality}
                  onChange={(e) => onMaterialityChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FAFBF9] border border-[#DCE4DA] rounded-lg text-[#112117] focus:outline-none focus:ring-1 focus:ring-[#132E22]"
                >
                  <option value="all">All Materiality Levels</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#EAEFE8]">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55675C] hover:text-[#C93B3B]"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPopoverOpen(false)}
                  className="px-3.5 py-1.5 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="px-3.5 py-2 bg-white hover:bg-[#FAFBF9] text-[#34463A] hover:text-[#112117] border border-[#DCE4DA] rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          title="Export regulatory comparison intelligence (CSV/JSON/PDF)"
        >
          <Download className="w-3.5 h-3.5 text-[#2C634D]" />
          <span>Export</span>
        </button>
      </div>
    </div>
  )
}
