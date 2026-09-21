import React from 'react'
import ClauseSelector from '../ClauseSelector'
import ClauseTextCard from '../ClauseTextCard'
import TokenTable from '../TokenTable'
import DependencyGraph from '../DependencyGraph'
import EntityTable from '../EntityTable'
import ClauseInformation from '../ClauseInformation'
import ClauseClassificationCard from '../ClauseClassificationCard'
import ExtractedRequirementCard from '../ExtractedRequirementCard'
import { JSONOutputCard } from '../JSONViewerModal'

export default function ClauseAnalysisView({
  clauses = [],
  selectedClause = null,
  clauseDetail = null,
  onSelectClause = () => {},
  currentIndex = 0,
  onPrevious = () => {},
  onNext = () => {},
  onOpenJSONModal = () => {},
}) {
  if (!clauseDetail) {
    return (
      <div className="py-12 text-center text-[13px] text-[#86978C]">
        Loading clause NLP analysis...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left 8/12 Columns: Analysis Steps */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Sub-column 1 (Left): Select Clause + Tokenization & Lemmatization */}
        <div className="md:col-span-5 space-y-4.5">
          <ClauseSelector
            clauses={clauses}
            selectedClause={selectedClause}
            onSelectClause={onSelectClause}
            currentIndex={currentIndex}
            onPrevious={onPrevious}
            onNext={onNext}
          />
          <TokenTable tokens={clauseDetail.tokens || []} />
        </div>

        {/* Sub-column 2 (Right): Clause Text + Dependency Parse + Named Entities */}
        <div className="md:col-span-7 space-y-4.5">
          <ClauseTextCard
            clauseText={clauseDetail.clause_text}
            provisionId={clauseDetail.metadata?.provision_id}
            clauseId={clauseDetail.clause_id}
            pageNumber={clauseDetail.metadata?.page_number}
          />
          <DependencyGraph dependencies={clauseDetail.dependencies || []} />
          <EntityTable entities={clauseDetail.entities || []} />
        </div>
      </div>

      {/* Right 4/12 Columns: Metadata, Classification, Requirement, JSON */}
      <div className="lg:col-span-4 space-y-4">
        <ClauseInformation metadata={clauseDetail.metadata || {}} />
        <ClauseClassificationCard classification={clauseDetail.classification || {}} />
        <ExtractedRequirementCard requirement={clauseDetail.requirement || {}} />
        <JSONOutputCard onOpenModal={onOpenJSONModal} />
      </div>
    </div>
  )
}
