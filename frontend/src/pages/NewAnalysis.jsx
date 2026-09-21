import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Database,
  Info,
  Play,
  FileText,
  SlidersHorizontal,
  Upload,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react'

import DocumentUploadCard from '../components/documents/DocumentUploadCard'
import SelectedDocument from '../components/documents/SelectedDocument'
import DocumentLibraryModal from '../components/documents/DocumentLibraryModal'
import AnalysisConfiguration from '../components/analysis/AnalysisConfiguration'
import AnalysisPipeline from '../components/analysis/AnalysisPipeline'
import { createAnalysis, getRegulation } from '../services/api'
import {
  DEMO_PREVIOUS_DOC,
  DEMO_CURRENT_DOC,
  DEMO_POLICY_DOC,
} from '../data/demoDocuments'
import rbiFacadeImage from '../assets/rbi_facade.jpg'


export default function NewAnalysis() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // State for selected documents
  const [previousDoc, setPreviousDoc] = useState(null)
  const [currentDoc, setCurrentDoc] = useState(null)
  const [policyDoc, setPolicyDoc] = useState(null)

  // Handle incoming preselection from Regulations Library
  useEffect(() => {
    if (location.state?.selectedDoc) {
      const target = location.state.target || 'current'
      if (target === 'previous') {
        setPreviousDoc(location.state.selectedDoc)
      } else {
        setCurrentDoc(location.state.selectedDoc)
      }
    } else if (location.state?.previousDoc || location.state?.currentDoc) {
      if (location.state.previousDoc) setPreviousDoc(location.state.previousDoc)
      if (location.state.currentDoc) setCurrentDoc(location.state.currentDoc)
    }

    const currId = searchParams.get('current') || searchParams.get('current_doc_id')
    const prevId = searchParams.get('previous') || searchParams.get('previous_doc_id')

    if (currId && !currentDoc) {
      getRegulation(currId).then((d) => setCurrentDoc(d)).catch(() => {})
    }
    if (prevId && !previousDoc) {
      getRegulation(prevId).then((d) => setPreviousDoc(d)).catch(() => {})
    }
  }, [location.state, searchParams])


  // Library modal state
  const [libraryModalOpen, setLibraryModalOpen] = useState(false)
  const [libraryTarget, setLibraryTarget] = useState('previous') // 'previous' | 'current' | 'policy'

  // Analysis Configuration state
  const [analysisScope, setAnalysisScope] = useState('full')
  const [nlpModules, setNlpModules] = useState({
    classification: true,
    extraction: true,
    comparison: true,
    materiality: true,
  })

  // Execution state
  const [isPreparing, setIsPreparing] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Helper: Open Library for specific target
  const handleOpenLibrary = (target) => {
    setLibraryTarget(target)
    setLibraryModalOpen(true)
  }

  // Independent document setters & removers
  const handleSelectPrevious = (doc) => {
    setPreviousDoc(doc)
    setSubmitError(null)
  }

  const handleRemovePrevious = () => {
    setPreviousDoc(null)
    setSubmitError(null)
  }

  const handleSelectCurrent = (doc) => {
    setCurrentDoc(doc)
    setSubmitError(null)
  }

  const handleRemoveCurrent = () => {
    setCurrentDoc(null)
    setSubmitError(null)
  }

  const handleSelectPolicy = (doc) => {
    setPolicyDoc(doc)
    setSubmitError(null)
  }

  const handleRemovePolicy = () => {
    setPolicyDoc(null)
    setSubmitError(null)
  }

  // Helper: Handle Library selection
  const handleSelectFromLibrary = (doc) => {
    if (libraryTarget === 'previous') {
      handleSelectPrevious(doc)
    } else if (libraryTarget === 'current') {
      handleSelectCurrent(doc)
    } else if (libraryTarget === 'policy') {
      handleSelectPolicy(doc)
    }
  }

  // Helper: Auto-load real RBI PSL demo documents
  const handleLoadDemoDocuments = () => {
    setPreviousDoc(DEMO_PREVIOUS_DOC)
    setCurrentDoc(DEMO_CURRENT_DOC)
    setPolicyDoc(DEMO_POLICY_DOC)
    setSubmitError(null)
  }

  const handleToggleModule = (moduleKey) => {
    setNlpModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }))
  }

  const isReadyToRun = Boolean(previousDoc && currentDoc)

  const handleRunAnalysis = async () => {
    if (!isReadyToRun || isPreparing) return

    const prevId = previousDoc?.document_id || previousDoc?.id
    const currId = currentDoc?.document_id || currentDoc?.id

    if (!prevId || !currId) {
      setSubmitError('Please select both a Baseline (Previous) and Revised (Current) regulation.')
      return
    }

    // Defensive validation: Ensure previous and current documents are distinct
    if (prevId === currId) {
      setSubmitError('Previous and Current Regulation must be different documents.')
      return
    }

    setIsPreparing(true)
    setSubmitError(null)

    const payload = {
      previous_document_id: prevId,
      current_document_id: currId,
      company_policy_document_id: policyDoc?.document_id || policyDoc?.id || null,
    }

    if (import.meta.env.DEV) {
      console.debug('[ReguLens] Submitting analysis request payload:', payload)
    }

    try {
      const response = await createAnalysis(payload)

      const targetAnalysisId = response?.analysis_id || 'psl-2020-2025'

      navigate('/analysis/processing', {
        state: {
          analysisId: targetAnalysisId,
          previousDoc,
          currentDoc,
          policyDoc,
          analysisScope,
          nlpModules,
        },
      })
    } catch (err) {
      setIsPreparing(false)
      setSubmitError(
        err.message || 'Unable to connect to the ReguLens API. Please verify FastAPI backend is running.'
      )
    }
  }



  return (
    <div className="flex flex-col space-y-8 pb-16">
      {/* Top Main Page Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Eyebrow + Main Title + Subtitle */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#2C634D]" />
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#3E4E43] uppercase">
              New Analysis
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] text-[#112117] font-normal tracking-tight mb-3">
            Regulatory Analysis
          </h1>
          <p className="text-sm sm:text-base text-[#46564C] leading-relaxed max-w-xl">
            Compare regulatory requirements and assess them against your organization's
            policy with explainable NLP.
          </p>
        </div>

        {/* Right: Restrained Editorial Visual Banner */}
        <div className="lg:col-span-5 flex justify-end">
          <div className="relative w-full max-w-md bg-[#EDF4ED]/80 border border-[#DCE8DC] rounded-2xl p-5 overflow-hidden flex items-center justify-between shadow-2xs">
            {/* Blended Background Architectural Art */}
            <div className="absolute right-0 bottom-0 w-36 h-28 opacity-35 pointer-events-none select-none">
              <img
                src={rbiFacadeImage}
                alt="Regulatory Artwork"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>

            {/* Editorial Content */}
            <div className="relative z-10 flex flex-col pr-4">
              <p className="font-editorial italic text-[15px] sm:text-[16px] text-[#132E22] leading-snug">
                &ldquo;Better insights for a more compliant tomorrow.&rdquo;
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
                Regulations build trust.
              </span>
              <span className="font-editorial italic text-xs text-[#132E22] font-semibold">
                So does clarity.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Step 1, Step 2, and Step 3 Configuration (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-7">
          {/* ======================================================== */}
          {/* STEP 1: Compare Regulatory Versions */}
          {/* ======================================================== */}
          <div className="bg-[#FAFBF9] border border-[#E0E8DE] rounded-2xl p-6 sm:p-7 shadow-xs">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAEFE8] mb-6">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#132E22] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-2xs">
                  1
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-[#112117] tracking-tight">
                    Compare Regulatory Versions
                  </h3>
                  <p className="text-[12.5px] text-[#55675C] mt-0.5">
                    Upload or select two versions of the same regulation to detect and
                    understand changes.
                  </p>
                </div>
              </div>

              {/* Demo Documents Action Button */}
              <button
                type="button"
                onClick={handleLoadDemoDocuments}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#132E22] bg-[#EDF4ED] hover:bg-[#DEECE0] border border-[#D0E2D0] rounded-xl transition-all shadow-2xs cursor-pointer flex-shrink-0 self-start sm:self-auto"
                title="Populate with RBI Priority Sector Lending 2020 and 2025 datasets"
              >
                <Database className="w-3.5 h-3.5 text-[#2C634D]" />
                Use Demo Documents
              </button>
            </div>

            {/* 2 Document Upload Dropzones + Middle Relation Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Previous Regulation (Col Span 5) */}
              <div className="md:col-span-5">
                <DocumentUploadCard
                  title="Previous Regulation"
                  document={previousDoc}
                  onSelectDocument={handleSelectPrevious}
                  onRemoveDocument={handleRemovePrevious}
                  onOpenLibrary={() => handleOpenLibrary('previous')}
                  required={true}
                />
              </div>

              {/* Center Relationship Indicator (Col Span 1) */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-2 text-center select-none">
                <div className="w-8 h-8 rounded-full bg-[#F0F5EF] border border-[#D9E6D8] flex items-center justify-center text-[#2C634D] mb-1.5 shadow-2xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#667A6E] tracking-tight leading-tight max-w-[64px]">
                  Detect Regulatory Changes
                </span>
              </div>

              {/* Current Regulation (Col Span 5) */}
              <div className="md:col-span-5">
                <DocumentUploadCard
                  title="Current Regulation"
                  document={currentDoc}
                  onSelectDocument={handleSelectCurrent}
                  onRemoveDocument={handleRemoveCurrent}
                  onOpenLibrary={() => handleOpenLibrary('current')}
                  required={true}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STEP 2: Check Against Company Policy (Optional) */}
          {/* ======================================================== */}
          <div className="bg-[#FAFBF9] border border-[#E0E8DE] rounded-2xl p-6 sm:p-7 shadow-xs">
            {/* Section Header */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-[#EAEFE8] mb-5">
              <div className="w-7 h-7 rounded-full bg-[#132E22] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-2xs">
                2
              </div>
              <div className="flex flex-col">
                <h3 className="text-base sm:text-lg font-semibold text-[#112117] tracking-tight">
                  Check Against Company Policy{' '}
                  <span className="text-[#63756A] font-normal text-sm">
                    (Optional)
                  </span>
                </h3>
                <p className="text-[12.5px] text-[#55675C] mt-0.5">
                  Upload your organization's internal policy to identify potential
                  compliance gaps.
                </p>
              </div>
            </div>

            {/* Policy Upload Zone */}
            <DocumentUploadCard
              title="Company Policy"
              document={policyDoc}
              onSelectDocument={handleSelectPolicy}
              onRemoveDocument={handleRemovePolicy}
              onOpenLibrary={() => handleOpenLibrary('policy')}
              required={false}
            />
          </div>


          {/* ======================================================== */}
          {/* STEP 3: Analysis Configuration */}
          {/* ======================================================== */}
          <AnalysisConfiguration
            scope={analysisScope}
            onScopeChange={setAnalysisScope}
            modules={nlpModules}
            onToggleModule={handleToggleModule}
          />
        </div>

        {/* Right Column: Analysis Pipeline & Run CTA (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Analysis Pipeline Card */}
          <AnalysisPipeline policyEnabled={Boolean(policyDoc)} />

          {/* Primary Action Card */}
          <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col space-y-4">
            {/* Error Banner */}
            {submitError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#F8DADA] rounded-xl flex items-start gap-2 text-xs text-[#991B1B]">
                <Info className="w-4 h-4 text-[#C93B3B] flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Run Button */}
            <button
              type="button"
              disabled={!isReadyToRun || isPreparing}
              onClick={handleRunAnalysis}
              className={`w-full py-3.5 px-5 rounded-xl font-semibold text-[14.5px] flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm ${
                isReadyToRun && !isPreparing
                  ? 'bg-[#132E22] hover:bg-[#1E4333] text-[#FAFBF9] hover:shadow-md cursor-pointer active:scale-[0.99]'
                  : 'bg-[#E5ECE4] text-[#86988C] cursor-not-allowed'
              }`}
            >

              {isPreparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Analysis...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Regulatory Analysis</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {/* Selection Status */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#526458] font-medium">
              <span>
                {previousDoc && currentDoc
                  ? '2 regulatory documents'
                  : previousDoc || currentDoc
                  ? '1 regulatory document selected'
                  : '0 regulatory documents selected'}
              </span>
              <span>•</span>
              <span>
                {policyDoc ? '1 company policy' : 'No company policy'}
              </span>
            </div>

            {/* Footer Tagline */}
            <div className="pt-3 border-t border-[#EEF3EC] text-center text-[11px] text-[#718277] tracking-wide">
              Powered by Advanced NLP • Explainable • Domain-Specific
            </div>
          </div>
        </div>
      </div>

      {/* Library Selection Modal */}
      <DocumentLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        onSelect={handleSelectFromLibrary}
        targetRole={libraryTarget}
      />
    </div>
  )
}
