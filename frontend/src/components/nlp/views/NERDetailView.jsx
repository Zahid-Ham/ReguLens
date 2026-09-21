import React from 'react'
import EntityTable from '../EntityTable'
import { Tag, Sparkles } from 'lucide-react'

export default function NERDetailView({ clauseDetail = null }) {
  if (!clauseDetail) return null

  const entities = clauseDetail.entities || []
  const text = clauseDetail.clause_text || ''

  // Highlight entities in text
  const renderHighlightedText = () => {
    if (!entities.length) return <p className="text-[14px] text-[#223328] font-serif leading-relaxed italic">{text}</p>

    // Highlight recognized entity spans
    let elements = []
    let lastIndex = 0

    // Sort entities by start character
    const sorted = [...entities].sort((a, b) => (a.start_char ?? 0) - (b.start_char ?? 0))

    sorted.forEach((ent, i) => {
      const start = ent.start_char !== undefined ? ent.start_char : text.indexOf(ent.text, lastIndex)
      if (start >= lastIndex && start !== -1) {
        // Plain text segment
        if (start > lastIndex) {
          elements.push(<span key={`txt-${i}`}>{text.substring(lastIndex, start)}</span>)
        }
        // Entity pill
        const end = ent.end_char !== undefined ? ent.end_char : start + ent.text.length
        elements.push(
          <mark
            key={`ent-${i}`}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-[#EBF4EC] text-[#132E22] border border-[#C2DEC6] font-sans font-bold text-[12.5px]"
            title={`${ent.type}: ${ent.description || ''}`}
          >
            <span>{text.substring(start, end)}</span>
            <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#132E22] text-white">
              {ent.type}
            </span>
          </mark>
        )
        lastIndex = end
      }
    })

    if (lastIndex < text.length) {
      elements.push(<span key="txt-end">{text.substring(lastIndex)}</span>)
    }

    return (
      <div className="text-[14px] text-[#223328] font-serif leading-loose italic">
        {elements}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Annotated Clause Text */}
      <div className="bg-white border border-[#E2EAE0] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-[#1E4333]" />
          <h3 className="text-[15px] font-bold text-[#112117]">
            Entity-Annotated Clause
          </h3>
        </div>

        <div className="p-4 bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl">
          {renderHighlightedText()}
        </div>
      </div>

      {/* Entity Table & Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <EntityTable entities={entities} />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
            <h4 className="text-[14px] font-bold text-[#112117] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1E4333]" />
              NER Summary
            </h4>
            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-[#6C7E72]">Total Recognized Spans:</span>
                <span className="font-bold text-[#112117]">{entities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C7E72]">Domain Schema:</span>
                <span className="font-semibold text-[#1E4333]">ReguLens 10-Class Banking NER</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C7E72]">Disambiguation:</span>
                <span className="font-semibold text-[#112117]">Span Prioritization & Offset Guardrails</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
