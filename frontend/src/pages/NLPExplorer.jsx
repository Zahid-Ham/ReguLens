import React, { useEffect, useState } from 'react'
import NLPExplorerHeader from '../components/nlp/NLPExplorerHeader'
import ClauseAnalysisView from '../components/nlp/views/ClauseAnalysisView'
import NERDetailView from '../components/nlp/views/NERDetailView'
import DependencyDetailView from '../components/nlp/views/DependencyDetailView'
import ClassificationDetailView from '../components/nlp/views/ClassificationDetailView'
import RequirementDetailView from '../components/nlp/views/RequirementDetailView'
import JSONViewerModal from '../components/nlp/JSONViewerModal'
import NLPEmptyState from '../components/nlp/NLPEmptyState'
import { getNLPDocuments, getDocumentClauses, getClauseNLPDetail } from '../services/nlpExplorerApi'
import { AlertCircle } from 'lucide-react'

export default function NLPExplorer() {
  const [activeTab, setActiveTab] = useState('clause_analysis')
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [clauses, setClauses] = useState([])
  const [selectedClause, setSelectedClause] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [clauseDetail, setClauseDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [jsonModalOpen, setJsonModalOpen] = useState(false)

  const tabs = [
    { id: 'clause_analysis', label: 'Clause Analysis' },
    { id: 'ner', label: 'Named Entity Recognition' },
    { id: 'dependency', label: 'Dependency Analysis' },
    { id: 'classification', label: 'Clause Classification' },
    { id: 'requirements', label: 'Requirement Extraction' },
  ]

  // 1. Load initial documents on mount
  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true)
        setError(null)
        const docs = await getNLPDocuments()
        setDocuments(docs)
        if (docs.length > 0) {
          // Select first document (prioritized 2025/PSL/CDD)
          setSelectedDocument(docs[0])
        }
      } catch (err) {
        console.error('[NLPExplorer] Failed to load documents:', err)
        setError(err.message || 'Failed to load NLP document catalog.')
      } finally {
        setLoading(false)
      }
    }
    loadDocuments()
  }, [])

  // 2. Load clauses when document changes
  useEffect(() => {
    if (!selectedDocument) return

    async function loadClauses() {
      try {
        setLoading(true)
        const clList = await getDocumentClauses(selectedDocument.document_id)
        setClauses(clList)
        if (clList.length > 0) {
          setSelectedClause(clList[0])
          setCurrentIndex(0)
        } else {
          setSelectedClause(null)
          setClauseDetail(null)
        }
      } catch (err) {
        console.error('[NLPExplorer] Failed to load clauses:', err)
        setError(err.message || 'Failed to load document clauses.')
      } finally {
        setLoading(false)
      }
    }
    loadClauses()
  }, [selectedDocument])

  // 3. Load full NLP analysis when clause changes
  useEffect(() => {
    if (!selectedClause) return

    async function loadClauseDetail() {
      try {
        const detail = await getClauseNLPDetail(
          selectedClause.clause_id,
          selectedDocument?.document_id
        )
        setClauseDetail(detail)
      } catch (err) {
        console.error('[NLPExplorer] Failed to load clause NLP detail:', err)
      }
    }
    loadClauseDetail()
  }, [selectedClause, selectedDocument])

  const handleSelectClause = (c) => {
    setSelectedClause(c)
    const idx = clauses.findIndex((x) => x.clause_id === c.clause_id)
    if (idx !== -1) setCurrentIndex(idx)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1
      setCurrentIndex(nextIdx)
      setSelectedClause(clauses[nextIdx])
    }
  }

  const handleNext = () => {
    if (currentIndex < clauses.length - 1) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      setSelectedClause(clauses[nextIdx])
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#112117] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1520px] mx-auto space-y-6">
        {/* Top Header */}
        <NLPExplorerHeader
          documents={documents}
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
        />

        {/* Error Notification */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#F87171]/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-[#B91C1C]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-[#E2EAE0] flex items-center gap-1 sm:gap-4 overflow-x-auto select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 sm:px-4 text-[13.5px] border-b-2 font-sans transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#132E22] text-[#132E22] font-bold'
                    : 'border-transparent text-[#55675C] hover:text-[#112117] font-medium'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* View Workspace */}
        {loading && !clauseDetail ? (
          <div className="space-y-6 animate-pulse py-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-5 h-28 bg-[#EEF3EC] rounded-2xl" />
              <div className="md:col-span-7 h-28 bg-[#EEF3EC] rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-8 h-96 bg-[#EEF3EC] rounded-2xl" />
              <div className="md:col-span-4 h-96 bg-[#EEF3EC] rounded-2xl" />
            </div>
          </div>
        ) : !selectedDocument || clauses.length === 0 ? (
          <NLPEmptyState />
        ) : (
          <div>
            {activeTab === 'clause_analysis' && (
              <ClauseAnalysisView
                clauses={clauses}
                selectedClause={selectedClause}
                clauseDetail={clauseDetail}
                onSelectClause={handleSelectClause}
                currentIndex={currentIndex}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onOpenJSONModal={() => setJsonModalOpen(true)}
              />
            )}

            {activeTab === 'ner' && (
              <NERDetailView clauseDetail={clauseDetail} />
            )}

            {activeTab === 'dependency' && (
              <DependencyDetailView clauseDetail={clauseDetail} />
            )}

            {activeTab === 'classification' && (
              <ClassificationDetailView clauseDetail={clauseDetail} />
            )}

            {activeTab === 'requirements' && (
              <RequirementDetailView clauseDetail={clauseDetail} />
            )}
          </div>
        )}

        {/* JSON Viewer Modal */}
        <JSONViewerModal
          isOpen={jsonModalOpen}
          onClose={() => setJsonModalOpen(false)}
          rawJson={clauseDetail?.raw_json || {}}
          clauseId={clauseDetail?.clause_id || selectedClause?.clause_id || ''}
        />
      </div>
    </div>
  )
}
