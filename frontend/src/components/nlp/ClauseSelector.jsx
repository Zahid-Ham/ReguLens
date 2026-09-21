import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react'

export default function ClauseSelector({
  clauses = [],
  selectedClause = null,
  onSelectClause = () => {},
  currentIndex = 0,
  onPrevious = () => {},
  onNext = () => {},
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredClauses = clauses.filter((c) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      (c.title && c.title.toLowerCase().includes(term)) ||
      (c.clause_id && c.clause_id.toLowerCase().includes(term)) ||
      (c.provision_id && c.provision_id.toLowerCase().includes(term))
    )
  })

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-4 shadow-2xs">
      {/* Step Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#132E22] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
          1
        </div>
        <div>
          <h3 className="text-[13.5px] font-bold text-[#112117]">
            Select Clause
          </h3>
          <p className="text-[11.5px] text-[#55675C]">
            Choose a clause to explore its NLP analysis.
          </p>
        </div>
      </div>

      {/* Navigation Row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentIndex <= 0}
          title="Previous Clause"
          className="p-2 bg-[#F6F9F5] hover:bg-[#EBF2EA] text-[#132E22] border border-[#DCE8DC] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Clause Selector Dropdown */}
        <div className="relative flex-1 min-w-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title={selectedClause?.title || `Clause ${selectedClause?.provision_id || selectedClause?.clause_id || ''}`}
            className="w-full flex items-center justify-between gap-1.5 bg-[#FAFBF9] hover:bg-[#F2F6F1] border border-[#DCE8DC] rounded-xl px-3 py-2 text-left transition-colors group cursor-pointer"
          >
            <span className="text-[12px] font-semibold text-[#112117] truncate flex-1 min-w-0">
              {selectedClause?.title || `Clause ${selectedClause?.provision_id || selectedClause?.clause_id || '...'}`}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#55675C] transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown popup */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-[320px] sm:w-[380px] max-w-[90vw] bg-white border border-[#DCE8DC] rounded-2xl shadow-xl z-50 overflow-hidden py-2">
              {/* Search Bar */}
              <div className="px-3 pb-2 border-b border-[#F0F4EE]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#86978C] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search clause ID or text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#F6F9F5] border border-[#E2EAE0] rounded-lg text-[12px] text-[#112117] placeholder-[#86978C] focus:outline-none focus:border-[#1E4333]"
                  />
                </div>
              </div>

              {/* Clause List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-[#F6F8F5]">
                {filteredClauses.map((c, idx) => {
                  const isSelected = selectedClause?.clause_id === c.clause_id
                  return (
                    <button
                      key={c.clause_id || idx}
                      type="button"
                      onClick={() => {
                        onSelectClause(c)
                        setDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3.5 py-2 text-[12px] hover:bg-[#F4F8F4] transition-colors truncate block ${
                        isSelected ? 'bg-[#EBF4EC] text-[#132E22] font-bold' : 'text-[#33463B]'
                      }`}
                    >
                      {c.title}
                    </button>
                  )
                })}

                {filteredClauses.length === 0 && (
                  <div className="py-4 text-center text-[11px] text-[#86978C]">
                    No matching clauses found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= clauses.length - 1}
          title="Next Clause"
          className="p-2 bg-[#F6F9F5] hover:bg-[#EBF2EA] text-[#132E22] border border-[#DCE8DC] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
