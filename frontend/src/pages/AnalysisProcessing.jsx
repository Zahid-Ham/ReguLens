import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

import AnalysisProgressHeader from '../components/analysis/AnalysisProgressHeader'
import NLPPipeline from '../components/analysis/NLPPipeline'
import CurrentProcessing from '../components/analysis/CurrentProcessing'
import CurrentClause from '../components/analysis/CurrentClause'
import NLPAnalysisPanel from '../components/analysis/NLPAnalysisPanel'
import AnalysisSummary from '../components/analysis/AnalysisSummary'
import CancelAnalysisModal from '../components/analysis/CancelAnalysisModal'
import { getAnalysisStatus, getDocumentClauses } from '../services/api'
import rbiFacadeImage from '../assets/rbi_facade.jpg'

export default function AnalysisProcessing() {
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve incoming documents & analysis ID
  const analysisId = location.state?.analysisId || 'psl-2020-2025'
  const previousDoc = location.state?.previousDoc || {
    id: 'rbi_psl_2020_official',
    title: 'rbi_psl_2020_official.pdf',
    name: 'Reserve Bank of India (Priority Sector Lending - Targets and Classification) Directions, 2020',
    clausesCount: 60,
  }
  const currentDoc = location.state?.currentDoc || {
    id: 'rbi_a8d0f9a98495',
    title: 'rbi_a8d0f9a98495.pdf',
    name: 'Master Directions - Reserve Bank of India (Priority Sector Lending – Targets and Classification) Directions, 2025',
    clausesCount: 348,
  }
  const policyDoc = location.state?.policyDoc || null
  const hasPolicy = Boolean(policyDoc)

  // Real backend status state
  const [statusData, setStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stored clauses for post-completion explorer
  const [storedClauses, setStoredClauses] = useState({ previous: [], current: [] })
  const [selectedDocRole, setSelectedDocRole] = useState('current')
  const [selectedClauseIndex, setSelectedClauseIndex] = useState(1)

  // Selected token for NLP detail view
  const [selectedToken, setSelectedToken] = useState(null)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('tokens')

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  // Fetch full clause datasets upon completion
  const loadCompletedClauses = async () => {
    try {
      const [prevRes, currRes] = await Promise.all([
        getDocumentClauses(analysisId, 'previous'),
        getDocumentClauses(analysisId, 'current'),
      ])
      setStoredClauses({
        previous: prevRes?.clauses || [],
        current: currRes?.clauses || [],
      })
    } catch (err) {
      console.error('Failed to load completed document clauses:', err)
    }
  }

  // Poll backend status
  useEffect(() => {
    let intervalId = null
    let isCancelled = false

    const poll = async () => {
      try {
        const res = await getAnalysisStatus(analysisId)
        if (!isCancelled) {
          setStatusData(res)
          setLoading(false)
          if (res.status === 'failed') {
            setError(res.error_message || 'Analysis processing failed.')
            if (intervalId) clearInterval(intervalId)
          } else if (res.status === 'complete') {
            if (intervalId) clearInterval(intervalId)
            loadCompletedClauses()
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Unable to connect to the ReguLens API.')
          setLoading(false)
          if (intervalId) clearInterval(intervalId)
        }
      }
    }

    // Immediate initial poll
    poll()

    // Poll every 350ms
    intervalId = setInterval(poll, 350)

    return () => {
      isCancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [analysisId])

  const handleOpenCancel = () => {
    setCancelModalOpen(true)
  }

  const handleCloseCancel = () => {
    setCancelModalOpen(false)
  }

  const handleConfirmCancel = () => {
    setCancelModalOpen(false)
    navigate('/analysis/new', {
      state: {
        previousDoc,
        currentDoc,
        policyDoc,
      },
    })
  }

  const handleNavigateToResults = () => {
    navigate('/analysis/results', {
      state: {
        analysisId,
        previousDoc,
        currentDoc,
        policyDoc,
      },
    })
  }

  const isComplete = statusData?.status === 'complete'
  const progressPercent = statusData?.progress ?? (loading ? 0 : 100)
  const currentStageIndex = statusData?.stage_index ?? 0
  const stages = statusData?.stages || []

  // Document counts
  const prevClausesCount =
    statusData?.document_counts?.previous_clauses ??
    (storedClauses.previous?.length || previousDoc.clausesCount || 0)
  const currClausesCount =
    statusData?.document_counts?.current_clauses ??
    (storedClauses.current?.length || currentDoc.clausesCount || 0)

  // Active NLP data derivation (Live vs Post-Completion)
  let activeNlp = null
  let activeDocRole = 'current'
  let activeDocTitle = currentDoc.title || currentDoc.name
  let activeDocIndex = 2
  let activeClauseIndex = 1
  let activeTotalClauses = currClausesCount || 1

  if (isComplete && storedClauses[selectedDocRole]?.length > 0) {
    const list = storedClauses[selectedDocRole]
    activeDocRole = selectedDocRole
    activeTotalClauses = list.length
    const boundedIdx = Math.max(1, Math.min(list.length, selectedClauseIndex))
    activeClauseIndex = boundedIdx
    activeNlp = list[boundedIdx - 1]
    activeDocTitle =
      activeNlp?.document_title ||
      (selectedDocRole === 'previous'
        ? previousDoc.title || previousDoc.name
        : currentDoc.title || currentDoc.name)
    activeDocIndex = selectedDocRole === 'previous' ? 1 : 2
  } else if (statusData?.current_nlp) {
    activeNlp = statusData.current_nlp
    activeDocRole = statusData.current_document?.role || 'previous'
    activeDocTitle =
      statusData.current_document?.filename ||
      (activeDocRole === 'previous'
        ? previousDoc.title || previousDoc.name
        : currentDoc.title || currentDoc.name)
    activeDocIndex = statusData.current_document?.document_index || 1
    activeClauseIndex = statusData.current_clause?.clause_index || 1
    activeTotalClauses = statusData.current_clause?.total_clauses || 1
  }

  const clauseText =
    activeNlp?.clause_text ||
    statusData?.current_clause?.clause_text ||
    (loading
      ? 'Loading clause extraction from uploaded document...'
      : 'Waiting for clause segmentation...')

  const clauseNumber =
    activeNlp?.provision_id ||
    (activeNlp?.clause_id
      ? `Clause ${activeNlp.clause_id}`
      : `Clause ${activeClauseIndex}`)

  const highlightedToken = activeNlp?.highlighted_token || 'shall'
  const clauseTokens = activeNlp?.tokens || []
  const clauseEntities = activeNlp?.domain_entities || []
  const clauseDependencies = activeNlp?.dependencies || []
  const clauseClassification = activeNlp?.classification || null

  // Post-completion Navigation Handlers
  const handleSelectDocRole = (role) => {
    setSelectedDocRole(role)
    setSelectedClauseIndex(1)
  }

  const handlePreviousClause = () => {
    setSelectedClauseIndex((prev) => Math.max(1, prev - 1))
  }

  const handleNextClause = () => {
    const total = storedClauses[selectedDocRole]?.length || activeTotalClauses
    setSelectedClauseIndex((prev) => Math.min(total, prev + 1))
  }

  const handleSelectClauseIndex = (idx) => {
    setSelectedClauseIndex(idx)
  }

  // Maintain selected token
  useEffect(() => {
    if (clauseTokens.length > 0) {
      if (!selectedToken || !clauseTokens.some((t) => t.text === selectedToken.text)) {
        const highlighted =
          clauseTokens.find((t) => t.isHighlighted) || clauseTokens[0]
        setSelectedToken(highlighted)
      }
    } else {
      setSelectedToken(null)
    }
  }, [clauseTokens])

  return (
    <div className="flex flex-col space-y-6 pb-16">
      {/* Top Back Navigation Link */}
      <div>
        <Link
          to="/analysis/new"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A5D51] hover:text-[#112117] transition-colors group select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#63756A] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Analysis Setup</span>
        </Link>
      </div>

      {/* Main Page Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Eyebrow + Main Title + Subtitle */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#2C634D]" />
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
              Analysis Status
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] text-[#112117] font-normal tracking-tight mb-3">
            {isComplete ? 'Regulatory Analysis Complete' : 'Processing Your Documents'}
          </h1>
          <p className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-xl">
            {isComplete
              ? 'All clauses have been segmented, parsed, classified, and aligned across both regulatory documents.'
              : 'ReguLens processes your documents across 12 NLP stages to extract, compare and understand regulatory changes.'}
          </p>
        </div>

        {/* Right: Restrained Editorial Visual Banner */}
        <div className="lg:col-span-5 flex justify-end">
          <div className="relative w-full max-w-md bg-[#EDF4ED]/80 border border-[#DCE8DC] rounded-2xl p-5 overflow-hidden flex items-center justify-between shadow-2xs">
            <div className="absolute right-0 bottom-0 w-36 h-28 opacity-35 pointer-events-none select-none">
              <img
                src={rbiFacadeImage}
                alt="Regulatory Artwork"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>

            <div className="relative z-10 flex flex-col pr-4">
              <p className="font-editorial italic text-[15px] sm:text-[16px] text-[#132E22] leading-snug">
                &ldquo;From documents to understanding &mdash; step by step.&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-3.5 h-[1px] bg-[#2C634D]" />
                <span className="text-[9.5px] font-bold tracking-widest text-[#2C634D] uppercase">
                  ReguLens
                </span>
              </div>
            </div>

            <div className="relative z-10 pl-3 border-l border-[#D2E2D1] hidden sm:flex flex-col text-right">
              <span className="font-editorial italic text-xs text-[#2C634D]">
                Regulatory intelligence
              </span>
              <span className="font-editorial italic text-xs text-[#132E22] font-semibold">
                for a better tomorrow.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error state if backend disconnected */}
      {error && (
        <div className="p-5 bg-[#FDF2F2] border border-[#F8DADA] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-[#C93B3B] flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-[#991B1B]">
                Processing Error
              </h4>
              <p className="text-xs text-[#7A1D1D] mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E0B8B8] text-xs font-semibold text-[#7A1D1D] rounded-xl hover:bg-[#FDF6F6] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Progress Header Status Bar */}
      <AnalysisProgressHeader
        progress={progressPercent}
        currentDocName={activeDocTitle}
        elapsedTime="00:00:00"
        estimatedTime={isComplete ? 'Complete' : 'Processing...'}
        onCancel={handleOpenCancel}
      />

      {/* Completion Notification Banner */}
      {isComplete ? (
        <div className="p-4 bg-[#EBF5EE] border border-[#A8D5B1] rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#132E22] text-[#FAFBF9] flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <div>
              <h4 className="text-sm font-semibold text-[#112117]">
                Regulatory Analysis Complete
              </h4>
              <p className="text-xs text-[#45574C]">
                {analysisId === 'psl-2020-2025'
                  ? 'All 63 comparative provisions and semantic changes have been verified in precomputed dataset.'
                  : `Analyzed ${prevClausesCount} baseline clauses and ${currClausesCount} revised clauses across 12 NLP stages.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNavigateToResults}
            className="px-4 py-2.5 bg-[#132E22] hover:bg-[#1E4333] text-[#FAFBF9] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <span>View Change Intelligence Results</span>
            <span>&rarr;</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1 text-xs text-[#55675C]">
          <span>
            Processing status:{' '}
            <strong>{statusData?.current_stage || 'Initializing NLP Pipeline...'}</strong>
          </span>
          <button
            type="button"
            onClick={handleNavigateToResults}
            className="text-xs font-semibold text-[#2C634D] hover:underline cursor-pointer"
          >
            View results &rarr;
          </button>
        </div>
      )}

      {/* 3-Column Analytical Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Vertical NLP Pipeline */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <NLPPipeline stages={stages} currentStageIndex={currentStageIndex} />
        </div>

        {/* Column 2: Center Live Processing & Clause NLP */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-5">
          {/* Currently Processing Card */}
          <CurrentProcessing
            documentTitle={activeDocTitle}
            documentIndex={activeDocIndex}
            totalDocuments={2}
            clauseProgress={
              isComplete
                ? `Analyzed ${prevClausesCount + currClausesCount} total clauses across 2 regulatory versions`
                : `Processing clause ${activeClauseIndex} of ${activeTotalClauses}`
            }
            progressPercent={progressPercent}
          />

          {/* Current Clause / Clause Explorer Card */}
          <CurrentClause
            documentRole={activeDocRole}
            documentTitle={activeDocTitle}
            documentIndex={activeDocIndex}
            clauseNumber={clauseNumber}
            clauseIndex={activeClauseIndex}
            totalClauses={activeTotalClauses}
            text={clauseText}
            highlightedToken={highlightedToken}
            isCompleted={isComplete}
            selectedDocRole={selectedDocRole}
            onSelectDocRole={handleSelectDocRole}
            onPreviousClause={handlePreviousClause}
            onNextClause={handleNextClause}
            onSelectClauseIndex={handleSelectClauseIndex}
            previousCount={prevClausesCount}
            currentCount={currClausesCount}
          />

          {/* Live NLP Analysis Panel */}
          <NLPAnalysisPanel
            activeTab={activeAnalysisTab}
            onTabChange={setActiveAnalysisTab}
            tokens={clauseTokens}
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            entities={clauseEntities}
            dependencies={clauseDependencies}
            clauseClassification={clauseClassification}
          />
        </div>

        {/* Column 3: Analysis Summary & Configuration */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
          <AnalysisSummary
            previousDocTitle={previousDoc.title || previousDoc.name}
            currentDocTitle={currentDoc.title || currentDoc.name}
            previousClausesCount={prevClausesCount}
            currentClauseIndex={
              isComplete
                ? currClausesCount
                : activeDocRole === 'previous'
                ? activeClauseIndex
                : activeClauseIndex
            }
            currentClausesCount={currClausesCount}
            hasPolicy={hasPolicy}
            policyDocTitle={policyDoc?.title || policyDoc?.name}
          />
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelAnalysisModal
        isOpen={cancelModalOpen}
        onClose={handleCloseCancel}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}

