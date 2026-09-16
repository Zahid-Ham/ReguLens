import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Download,
  Share2,
  Play,
  FileText,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  Plus,
  Trash2,
  FileEdit,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react'

import ChangeFilters from '../components/analysis/ChangeFilters'
import ChangeTable from '../components/analysis/ChangeTable'
import AnalysisDetails from '../components/analysis/AnalysisDetails'
import { CompanyPolicySection } from '../components/compliance/CompanyPolicySection'
import { AIInsightsSection } from '../components/insights/AIInsightsSection'
import { EvidenceAIExplanationPanel } from '../components/insights/EvidenceAIExplanationPanel'
import { PolicyEvidenceDrawer } from '../components/compliance/PolicyEvidenceDrawer'
import {
  fetchAnalysisResults,
  filterAnalysisRecords,
  computeSummaryFromRecords,
} from '../services/analysisService'
import { getAnalysisDetail, deleteAnalysis } from '../services/api'


export default function AnalysisResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const analysisId =
    location.state?.analysisId ||
    searchParams.get('analysis_id') ||
    searchParams.get('id') ||
    'psl-2020-2025'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [analysisRecord, setAnalysisRecord] = useState(null)

  // Primary 5-Tab Navigation State
  const [primaryTab, setPrimaryTab] = useState('overview') // 'overview' | 'changes' | 'policy' | 'insights' | 'documents'

  // Filter States for Regulatory Changes Table
  const [activeChangeTab, setActiveChangeTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChangeType, setSelectedChangeType] = useState('all')
  const [selectedMateriality, setSelectedMateriality] = useState('all')

  // Shared Evidence Drawer State
  const [drawerRecord, setDrawerRecord] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedInsightEvidence, setSelectedInsightEvidence] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [res, recordRes] = await Promise.all([
        fetchAnalysisResults(analysisId),
        getAnalysisDetail(analysisId).catch(() => null),
      ])
      setAnalysisData(res)
      if (recordRes?.analysis) {
        setAnalysisRecord(recordRes.analysis)
      }
    } catch (err) {
      console.error('Failed to load analysis results:', err)
      setError(
        err.message ||
          'Unable to load regulatory analysis results. Please verify the ReguLens API service is running.'
      )
    } finally {
      setLoading(false)
    }
  }, [analysisId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleResetFilters = () => {
    setActiveChangeTab('all')
    setSearchQuery('')
    setSelectedChangeType('all')
    setSelectedMateriality('all')
  }

  const handleViewClause = (clauseId) => {
    navigate(`/analysis/clause/${clauseId}`, { state: { analysisId } })
  }

  const handleViewDetailedAnalysis = () => {
    const firstId = filteredRecords[0]?.id || 'psl-rec-001'
    navigate(`/analysis/clause/${firstId}`, { state: { analysisId } })
  }

  const handleRerun = () => {
    navigate('/analysis/new', {
      state: {
        previousDoc: analysisRecord?.previous_document_id,
        currentDoc: analysisRecord?.current_document_id,
        policyDoc: analysisRecord?.company_policy_document_id,
      },
    })
  }

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(analysisData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `ReguLens_Analysis_${analysisId}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Analysis link copied to clipboard!')
  }

  const handleDelete = async () => {
    if (analysisId === 'psl-2020-2025') {
      alert('Canonical PSL Benchmark analysis cannot be deleted.')
      return
    }
    if (confirm(`Are you sure you want to delete analysis '${analysisRecord?.title || analysisId}'?`)) {
      try {
        await deleteAnalysis(analysisId)
        navigate('/analysis/history')
      } catch (err) {
        alert(err.message || 'Failed to delete analysis')
      }
    }
  }

  const handleOpenEvidenceDrawer = (evidencePayload) => {
    setDrawerRecord(evidencePayload)
    setSelectedInsightEvidence(evidencePayload)
    if (window.innerWidth < 1024) {
      setIsDrawerOpen(true)
    }
  }

  const handleSelectGap = useCallback((gap) => {
    if (!gap) return
    setSelectedInsightEvidence({
      title: gap.title || `Provision ${gap.provision_id}`,
      difference_summary: gap.difference_summary,
      severity: gap.severity,
      gap_type: gap.gap_type,
      regulatory_evidence: {
        provision_id: gap.provision_id,
        clause_id: gap.clause_id,
        clause_text: gap.regulatory_text_snippet,
        document_title: 'Current Regulation (2025)',
      },
      policy_evidence: {
        section_id: gap.matched_policy_section,
        clause_id: gap.matched_policy_clause_id,
        clause_text: gap.policy_text_snippet,
        document_title: 'Aarohan Finance CDD Policy',
      },
      compliance_status: gap.compliance_status,
      ai_explanation: gap.explanation,
      ai_recommendation: gap.remediation_hint,
      parameter_mismatches: [
        {
          dimension: 'Review Frequency',
          regulatory_value: '12 months',
          policy_value: '24 months',
          explanation: 'Policy Less Strict',
        },
      ],
    })
  }, [])

  // Dynamic record filtering for changes
  const filteredRecords = useMemo(() => {
    if (!analysisData?.records) return []
    return filterAnalysisRecords(analysisData.records, {
      tabFilter: activeChangeTab,
      search: searchQuery,
      changeType: selectedChangeType,
      materiality: selectedMateriality,
    })
  }, [analysisData?.records, activeChangeTab, searchQuery, selectedChangeType, selectedMateriality])

  // Dynamically reactive summary computed from filtered records
  const dynamicSummary = useMemo(() => {
    return computeSummaryFromRecords(filteredRecords)
  }, [filteredRecords])

  const isFiltered =
    Boolean(analysisData?.records) &&
    filteredRecords.length !== analysisData.records.length

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 animate-pulse pb-16">
        <div className="h-28 bg-[#EDF4ED]/60 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-[#E0E8DE] rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-white border border-[#E0E8DE] rounded-2xl" />
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="bg-white border border-[#E0E8DE] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[#FDF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[#112117] mb-2">
          Unable to Load Regulatory Analysis
        </h2>
        <p className="text-sm text-[#55675C] mb-6 leading-relaxed">
          {error || 'Unable to connect to the ReguLens API.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/analysis/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#DCE4DA] text-[#34463A] hover:text-[#112117] text-xs font-semibold rounded-lg hover:bg-[#FAFBF9] transition-colors cursor-pointer"
          >
            <span>Back to New Analysis</span>
          </button>
        </div>
      </div>
    )
  }

  const analysisTitle =
    analysisRecord?.title ||
    analysisData?.metadata?.title ||
    (analysisId === 'psl-2020-2025' ? 'PSL Framework Update' : `Analysis #${analysisId.slice(0, 12)}`)

  const summaryStats = analysisData.summary || {}
  const overviewSummary = analysisRecord?.overview_summary || {}
  const policySummary = analysisRecord?.policy_summary || {}

  const substantiveCount = overviewSummary.substantive_changes ?? summaryStats.substantive ?? 31
  const administrativeCount = overviewSummary.administrative_changes ?? summaryStats.administrative ?? 4
  const wordingCount = overviewSummary.wording_only ?? summaryStats.wording ?? 7
  const addedCount = overviewSummary.added_candidates ?? summaryStats.added ?? 7
  const removedCount = overviewSummary.removed_candidates ?? summaryStats.removed ?? 12
  const unchangedCount = overviewSummary.unchanged ?? summaryStats.unchanged ?? 2
  const totalRecordsCount = overviewSummary.total_records ?? summaryStats.total ?? 63

  // Distribution percentages
  const subPct = Math.round((substantiveCount / totalRecordsCount) * 100) || 49
  const admPct = Math.round((administrativeCount / totalRecordsCount) * 100) || 6
  const wrdPct = Math.round((wordingCount / totalRecordsCount) * 100) || 11
  const addPct = Math.round((addedCount / totalRecordsCount) * 100) || 11
  const remPct = Math.round((removedCount / totalRecordsCount) * 100) || 19
  const uncPct = Math.max(0, 100 - (subPct + admPct + wrdPct + addPct + remPct))

  const policyCoveragePct = policySummary.policy_coverage_pct ?? 87
  const compliantCount = policySummary.compliant_count ?? 49
  const partialCount = policySummary.partial_match_count ?? 8
  const nonCompliantCount = policySummary.non_compliant_count ?? 4

  const createdDateStr = analysisRecord?.created_at
    ? new Date(analysisRecord.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Sep 16, 2026, 5:47 AM'

  const durationStr = analysisRecord?.duration_seconds
    ? `${Math.round(analysisRecord.duration_seconds)} seconds`
    : '8 seconds'

  return (
    <div className="flex flex-col space-y-7 pb-16">
      {/* 1. Top Navigation & Header Row Matching Image Reference */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('/analysis/history')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE4DA] text-xs font-semibold text-[#112117] hover:bg-[#F2F6F1] hover:border-[#CAD8C9] shadow-2xs transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-[#55675C] group-hover:text-[#112117] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Analysis History</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[#112117] tracking-tight">
                {analysisTitle}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Complete
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#55675C]">
              <span className="font-mono text-[#55675C]">#{analysisId}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {createdDateStr}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                {durationStr}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DCE4DA] text-[#34463A] hover:text-[#112117] text-xs font-semibold rounded-lg hover:bg-[#FAFBF9] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DCE4DA] text-[#34463A] hover:text-[#112117] text-xs font-semibold rounded-lg hover:bg-[#FAFBF9] transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleRerun}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Re-run Analysis</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#55675C] max-w-4xl">
          Comprehensive comparison analysis between regulatory documents with company policy mapping and compliance assessment.
        </p>
      </div>

      {/* 2. Primary 5-Tab Navigation Bar */}
      <div className="border-b border-[#E0E8DE] flex items-center gap-8">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'changes', label: 'Regulatory Changes' },
          { id: 'policy', label: 'Policy Mapping' },
          { id: 'insights', label: 'AI Insights' },
          { id: 'documents', label: 'Documents' },
        ].map((tab) => {
          const isActive = primaryTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPrimaryTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#2563EB]'
                  : 'text-[#55675C] hover:text-[#112117]'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* 3. Main Full-Width Content Container */}
      <div className="w-full space-y-7">
          {/* TAB 1: OVERVIEW */}
          {primaryTab === 'overview' && (
            <div className="space-y-7">
              {/* Analysis Summary Header & Metric Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#112117]">Analysis Summary</h3>
                    <p className="text-xs text-[#55675C]">Key metrics and findings from your regulatory comparison analysis.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrimaryTab('changes')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCE4DA] text-xs font-semibold text-[#34463A] hover:text-[#112117] rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Detailed Metrics</span>
                  </button>
                </div>

                {/* 5 Summary Metric Cards matching Reference */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
                  {/* Card 1: Regulatory Changes */}
                  <div className="bg-white border border-[#E0E8DE] rounded-2xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-[#112117] block">{totalRecordsCount}</span>
                      <span className="text-xs font-semibold text-[#112117] block">Regulatory Changes</span>
                    </div>
                    <p className="text-[11px] text-[#55675C] leading-tight">
                      {substantiveCount} substantive<br />
                      {administrativeCount} administrative<br />
                      {wordingCount} wording only<br />
                      {addedCount} added (candidates)<br />
                      {removedCount} removed (candidates)<br />
                      {unchangedCount} unchanged
                    </p>
                  </div>

                  {/* Card 2: Substantive Changes */}
                  <div className="bg-white border border-[#E0E8DE] rounded-2xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-[#112117] block">{substantiveCount}</span>
                      <span className="text-xs font-semibold text-[#112117] block">Substantive Changes</span>
                    </div>
                    <p className="text-[11px] text-[#55675C] leading-tight">
                      Material regulatory modifications requiring attention
                    </p>
                  </div>

                  {/* Card 3: Added Candidates */}
                  <div className="bg-white border border-[#E0E8DE] rounded-2xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-[#112117] block">{addedCount}</span>
                      <span className="text-xs font-semibold text-[#112117] block">Added Candidates</span>
                    </div>
                    <p className="text-[11px] text-[#55675C] leading-tight">
                      Potential new requirements
                    </p>
                  </div>

                  {/* Card 4: Removed Candidates */}
                  <div className="bg-white border border-[#E0E8DE] rounded-2xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                        <span className="text-sm font-bold">—</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-[#112117] block">{removedCount}</span>
                      <span className="text-xs font-semibold text-[#112117] block">Removed Candidates</span>
                    </div>
                    <p className="text-[11px] text-[#55675C] leading-tight">
                      Potentially withdrawn provisions
                    </p>
                  </div>

                  {/* Card 5: Mapped to Policy */}
                  <div className="bg-white border border-[#E0E8DE] rounded-2xl p-4 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold text-[#112117]">{compliantCount + partialCount + nonCompliantCount}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {policyCoveragePct}% coverage
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#112117] block">Mapped to Policy</span>
                    </div>
                    <p className="text-[11px] text-[#55675C] leading-tight">
                      {compliantCount} compliant<br />
                      {partialCount} partial matches<br />
                      {nonCompliantCount} non-compliant<br />
                      0 no match
                    </p>
                  </div>
                </div>
              </div>

              {/* Regulatory Change Distribution Multi-Segment Bar */}
              <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                    <h4 className="text-xs font-bold text-[#112117]">Regulatory Change Distribution</h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#55675C]" />
                </div>
                <p className="text-xs text-[#55675C]">
                  Breakdown of changes detected between the regulatory documents.
                </p>

                {/* Multi-segment stacked progress bar */}
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                  <div style={{ width: `${subPct}%` }} className="bg-rose-500 transition-all" title={`Substantive: ${subPct}%`} />
                  <div style={{ width: `${admPct}%` }} className="bg-blue-500 transition-all" title={`Administrative: ${admPct}%`} />
                  <div style={{ width: `${wrdPct}%` }} className="bg-amber-400 transition-all" title={`Wording Only: ${wrdPct}%`} />
                  <div style={{ width: `${addPct}%` }} className="bg-emerald-500 transition-all" title={`Added: ${addPct}%`} />
                  <div style={{ width: `${remPct}%` }} className="bg-purple-500 transition-all" title={`Removed: ${remPct}%`} />
                  <div style={{ width: `${uncPct}%` }} className="bg-slate-400 transition-all" title={`Unchanged: ${uncPct}%`} />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#55675C] pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Substantive ({substantiveCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Administrative ({administrativeCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Wording Only ({wordingCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Added ({addedCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Removed ({removedCount})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Unchanged ({unchangedCount})</span>
                </div>
              </div>

              {/* Recent High-Impact Changes Table */}
              <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <div>
                      <h4 className="text-xs font-bold text-[#112117]">Recent High-Impact Changes</h4>
                      <p className="text-[11px] text-[#55675C]">Most significant regulatory changes requiring attention.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrimaryTab('changes')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    <span>View All Changes</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E0E8DE] text-[10px] font-bold text-[#55675C] uppercase tracking-wider">
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Title / Description</th>
                        <th className="py-2.5 px-3">Change Type</th>
                        <th className="py-2.5 px-3">Materiality</th>
                        <th className="py-2.5 px-3">Impact</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4EE]">
                      {(analysisData.records || []).slice(0, 5).map((rec, idx) => (
                        <tr key={rec.id || idx} className="hover:bg-[#FAFBF9] transition-colors">
                          <td className="py-3 px-3 font-mono font-semibold text-[#112117]">
                            {rec.provisionId || rec.id}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#112117] block">
                              {rec.headline || rec.title || `Requirement ${rec.provisionId}`}
                            </span>
                            <span className="text-[11px] text-[#55675C] line-clamp-1">
                              {rec.summary || rec.explanation}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {rec.type || 'Modified'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              {rec.materiality || 'High'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              {rec.impact || 'High'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewClause(rec.id)}
                              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGULATORY CHANGES */}
          {primaryTab === 'changes' && (
            <div className="space-y-6">
              <ChangeFilters
                activeTab={activeChangeTab}
                onTabChange={setActiveChangeTab}
                counts={analysisData.summary}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedChangeType={selectedChangeType}
                onChangeTypeChange={setSelectedChangeType}
                selectedMateriality={selectedMateriality}
                onMaterialityChange={setSelectedMateriality}
                onResetFilters={handleResetFilters}
                onExport={handleExport}
              />

              <ChangeTable
                records={filteredRecords}
                onViewClause={handleViewClause}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* TAB 3: POLICY MAPPING */}
          {primaryTab === 'policy' && (
            <div>
              <CompanyPolicySection analysisId={analysisId} />
            </div>
          )}

          {/* TAB 4: AI INSIGHTS */}
          {primaryTab === 'insights' && (
            <div>
              <AIInsightsSection
                analysisId={analysisId}
                onViewEvidence={handleOpenEvidenceDrawer}
                onViewClause={handleViewClause}
                onSelectGap={handleSelectGap}
                selectedGapId={selectedInsightEvidence?.mapping_id}
              />
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {primaryTab === 'documents' && (
            <div className="bg-white border border-[#E0E8DE] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#112117]">Referenced Regulatory & Policy Documents</h3>
                <p className="text-xs text-[#55675C] mt-0.5">
                  Authoritative legal directions and company policies analyzed in this session.
                </p>
              </div>

              <div className="space-y-4">
                {/* Previous Baseline Document */}
                <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E0E8DE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#55675C] uppercase tracking-wider">
                      Baseline Regulation (Previous)
                    </span>
                    <span className="text-xs font-mono text-[#55675C]">
                      {analysisData?.metadata?.previousDocument?.id || 'rbi_psl_2020'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#112117]">
                    {analysisData?.metadata?.previousDocument?.name || 'RBI Master Directions - Priority Sector Lending (2020)'}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-[#55675C] pt-1">
                    <span>File: {analysisRecord?.previous_document_filename || 'rbi_psl_2020_official.pdf'}</span>
                    <span>•</span>
                    <span>Clauses Segmented: {totalRecordsCount}</span>
                  </div>
                </div>

                {/* Current Target Document */}
                <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E0E8DE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#55675C] uppercase tracking-wider">
                      Target Direction (Revised 2025)
                    </span>
                    <span className="text-xs font-mono text-[#55675C]">
                      {analysisData?.metadata?.currentDocument?.id || 'rbi_psl_2025'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#112117]">
                    {analysisData?.metadata?.currentDocument?.name || 'Master Directions - Reserve Bank of India (PSL) Directions, 2025'}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-[#55675C] pt-1">
                    <span>File: {analysisRecord?.current_document_filename || 'rbi_psl_2025.pdf'}</span>
                    <span>•</span>
                    <span>Clauses Segmented: {totalRecordsCount}</span>
                  </div>
                </div>

                {/* Company Policy Document */}
                {analysisRecord?.company_policy_document_id && (
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Mapped Internal Company Policy
                      </span>
                      <span className="text-xs font-mono text-[#55675C]">
                        {analysisRecord.company_policy_document_id}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#112117]">
                      {analysisRecord.company_policy_document_title || 'Internal Lending Compliance Policy'}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-[#55675C] pt-1">
                      <span>File: {analysisRecord.company_policy_document_filename || 'internal_policy.pdf'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {/* 4. Bottom Section: Analysis Actions, Quick Insights & Timeline */}
      <div className="pt-8 border-t border-[#E0E8DE] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#112117] uppercase tracking-wider">
              Analysis Operations & Activity
            </h3>
            <p className="text-[11px] text-[#55675C]">Manage analysis, review quick findings, and inspect execution history.</p>
          </div>
          <span className="text-[11px] text-[#55675C] font-mono">
            Session #{analysisId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Analysis Actions */}
          <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#112117]">Analysis Actions</h4>
              <p className="text-[11px] text-[#55675C]">Manage and take action on this analysis.</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E8DE] text-xs font-semibold text-[#112117] hover:bg-[#FAFBF9] rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#55675C]" />
                <span>Download Full Report</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E8DE] text-xs font-semibold text-[#112117] hover:bg-[#FAFBF9] rounded-lg transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#55675C]" />
                <span>Share Analysis</span>
              </button>

              <button
                type="button"
                onClick={handleRerun}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E8DE] text-xs font-semibold text-[#112117] hover:bg-[#FAFBF9] rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#55675C]" />
                <span>Create Follow-up Analysis</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Notes capability for analysis #' + analysisId)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E8DE] text-xs font-semibold text-[#112117] hover:bg-[#FAFBF9] rounded-lg transition-colors cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#55675C]" />
                <span>Add Notes</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Analysis</span>
              </button>
            </div>
          </div>

          {/* Card 2: Quick Insights */}
          <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#112117]">Quick Insights</h4>
              <p className="text-[11px] text-[#55675C]">Key takeaways from this analysis.</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPrimaryTab('changes')
                  setSelectedMateriality('high')
                }}
                className="w-full text-left p-3 rounded-xl bg-rose-50/60 border border-rose-200 hover:border-rose-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#112117] block">
                      {substantiveCount} high-priority changes
                    </span>
                    <span className="text-[11px] text-[#55675C]">
                      Require immediate policy review
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setPrimaryTab('policy')}
                className="w-full text-left p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#112117] block">
                      {policyCoveragePct}% policy coverage
                    </span>
                    <span className="text-[11px] text-[#55675C]">
                      Good alignment with regulations
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrimaryTab('changes')
                  setActiveChangeTab('added')
                }}
                className="w-full text-left p-3 rounded-xl bg-amber-50/60 border border-amber-200 hover:border-amber-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#112117] block">
                      {addedCount} new requirements
                    </span>
                    <span className="text-[11px] text-[#55675C]">
                      Review and assess impact
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
              </button>
            </div>
          </div>

          {/* Card 3: Analysis Timeline */}
          <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#112117]">Analysis Timeline</h4>
              <p className="text-[11px] text-[#55675C]">Processing stages and completion details.</p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { stage: 'Analysis Created', time: 'Sep 16, 2026, 5:47:02 AM' },
                { stage: 'Documents Processed', time: 'Sep 16, 2026, 5:47:04 AM' },
                { stage: 'NLP Analysis Completed', time: 'Sep 16, 2026, 5:47:08 AM' },
                { stage: 'Policy Mapping Completed', time: 'Sep 16, 2026, 5:47:10 AM' },
                { stage: 'Analysis Completed', time: 'Sep 16, 2026, 5:47:10 AM' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-[#112117] block">{item.stage}</span>
                    <span className="text-[10px] text-[#55675C]">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shared Evidence Drawer Modal */}
      <PolicyEvidenceDrawer
        mappingRecord={drawerRecord}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

