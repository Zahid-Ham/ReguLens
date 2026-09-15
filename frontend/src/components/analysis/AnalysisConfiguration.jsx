import React from 'react'
import { SlidersHorizontal, Check } from 'lucide-react'

export default function AnalysisConfiguration({
  scope = 'full',
  onScopeChange,
  modules = {
    classification: true,
    extraction: true,
    comparison: true,
    materiality: true,
  },
  onToggleModule,
}) {
  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-md bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-[14.5px] font-semibold text-[#112117] tracking-tight">
          Analysis Configuration
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Analysis Scope */}
        <div className="md:col-span-5 flex flex-col space-y-2.5">
          <span className="text-[12px] font-bold tracking-wider text-[#55675C] uppercase">
            Analysis Scope
          </span>

          {/* Option 1: Full Document */}
          <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#243329] group">
            <input
              type="radio"
              name="analysisScope"
              value="full"
              checked={scope === 'full'}
              onChange={() => onScopeChange('full')}
              className="w-4 h-4 text-[#132E22] accent-[#132E22] focus:ring-[#132E22] cursor-pointer"
            />
            <span className="font-medium group-hover:text-[#112117]">
              Full document <span className="text-[#65776C] font-normal">(recommended)</span>
            </span>
          </label>

          {/* Option 2: Selected Provisions */}
          <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#243329] group">
            <input
              type="radio"
              name="analysisScope"
              value="selected"
              checked={scope === 'selected'}
              onChange={() => onScopeChange('selected')}
              className="w-4 h-4 text-[#132E22] accent-[#132E22] focus:ring-[#132E22] cursor-pointer"
            />
            <span className="font-medium group-hover:text-[#112117]">
              Selected provisions only
            </span>
          </label>
        </div>

        {/* Vertical Separator */}
        <div className="hidden md:block w-px h-20 bg-[#E8EFE7] self-center" />

        {/* Right: NLP Modules */}
        <div className="md:col-span-6 flex flex-col space-y-2.5">
          <span className="text-[12px] font-bold tracking-wider text-[#55675C] uppercase">
            NLP Modules
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Clause Classification */}
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#243329] group select-none">
              <input
                type="checkbox"
                checked={modules.classification}
                onChange={() => onToggleModule('classification')}
                className="w-4 h-4 rounded text-[#132E22] accent-[#132E22] focus:ring-[#132E22] cursor-pointer"
              />
              <span className="font-medium group-hover:text-[#112117]">
                Clause classification
              </span>
            </label>

            {/* Semantic Comparison */}
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#243329] group select-none">
              <input
                type="checkbox"
                checked={modules.comparison}
                onChange={() => onToggleModule('comparison')}
                className="w-4 h-4 rounded text-[#132E22] accent-[#132E22] focus:ring-[#132E22] cursor-pointer"
              />
              <span className="font-medium group-hover:text-[#112117]">
                Semantic comparison
              </span>
            </label>

            {/* Requirement Extraction */}
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#243329] group select-none">
              <input
                type="checkbox"
                checked={modules.extraction}
                onChange={() => onToggleModule('extraction')}
                className="w-4 h-4 rounded text-[#132E22] accent-[#132E22] focus:ring-[#132E22] cursor-pointer"
              />
              <span className="font-medium group-hover:text-[#112117]">
                Requirement extraction
              </span>
            </label>

            {/* Materiality Assessment */}
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#243329] group select-none">
              <input
                type="checkbox"
                checked={modules.materiality}
                onChange={() => onToggleModule('materiality')}
                className="w-4 h-4 rounded text-[#132E22] accent-[#132E22] focus:ring-[#132E22] cursor-pointer"
              />
              <span className="font-medium group-hover:text-[#112117]">
                Materiality assessment
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
