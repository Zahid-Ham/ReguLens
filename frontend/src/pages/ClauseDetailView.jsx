import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Download,
  FileText,
  Sparkles,
  GitCompare,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Minus,
  Plus,
  RefreshCw as ModifyIcon,
} from 'lucide-react'
import { getAnalysisChange, getAnalysisChanges, getNlpClauseDetail } from '../services/api'
import { computeClauseDiff } from '../utils/textDiff'

export default function ClauseDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const analysisId = location.state?.analysisId || 'psl-2020-2025'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [changeRecord, setChangeRecord] = useState(null)
  const [nlpClause, setNlpClause] = useState(null)
  const [allChanges, setAllChanges] = useState([])
  const [showChangesOnly, setShowChangesOnly] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const changesListRes = await getAnalysisChanges(analysisId, { limit: 100 })
        const changes = changesListRes.changes || []
        if (isMounted) setAllChanges(changes)

        // Find target change record
        let rec = null
        try {
          rec = await getAnalysisChange(analysisId, id)
        } catch {
          rec =
            changes.find(
              (c) =>
                c.change_id?.toLowerCase() === id?.toLowerCase() ||
                c.old_clause_id?.toLowerCase() === id?.toLowerCase() ||
                c.new_clause_id?.toLowerCase() === id?.toLowerCase() ||
                c.old_provision_id === id ||
                c.new_provision_id === id
            ) || changes[0]
        }

        if (isMounted) setChangeRecord(rec)

        // Fetch NLP clause detail if available
        const targetClauseId = rec?.new_clause_id || rec?.old_clause_id || id
        if (targetClauseId) {
          try {
            const nlpData = await getNlpClauseDetail(analysisId, targetClauseId)
            if (isMounted) setNlpClause(nlpData)
          } catch {
            // non-critical
          }
        }
      } catch (err) {
        console.error('Failed to load clause detail:', err)
        if (isMounted) {
          setError(err.message || 'Unable to load clause-level intelligence from the ReguLens API.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [analysisId, id])

  // Calculate Next Change navigation ID
  const nextChangeId = useMemo(() => {
    if (!allChanges || allChanges.length === 0 || !changeRecord) return null
    const currentIndex = allChanges.findIndex((c) => c.change_id === changeRecord.change_id)
    if (currentIndex >= 0 && currentIndex < allChanges.length - 1) {
      return allChanges[currentIndex + 1].change_id
    }
    return allChanges[0]?.change_id
  }, [allChanges, changeRecord])

  // Compute text diff
  const diffResult = useMemo(() => {
    if (!changeRecord) {
      return { oldSpans: [], newSpans: [], detectedChanges: [], wordCountOld: 0, wordCountNew: 0 }
    }
    return computeClauseDiff(
      changeRecord.old_clause_text || '',
      changeRecord.new_clause_text || '',
      changeRecord.regulatory_changes || []
    )
  }, [changeRecord])

  const handleDownloadComparison = () => {
    if (!changeRecord) return
    const content = `ReguLens Regulatory Change Intelligence
Change ID: ${changeRecord.change_id}
Provisions: Clause ${changeRecord.old_provision_id || 'N/A'} -> Clause ${changeRecord.new_provision_id || 'N/A'}
Materiality: ${changeRecord.final_materiality || changeRecord.materiality}
Type: ${changeRecord.final_change_type || changeRecord.change_type}

--- PREVIOUS REGULATION (2020) ---
${changeRecord.old_clause_text || 'None'}

--- REVISED REGULATION (2025) ---
${changeRecord.new_clause_text || 'None'}

--- NLP EXPLANATION ---
${changeRecord.final_explanation || changeRecord.explanation || 'N/A'}
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${changeRecord.change_id}_regulatory_comparison.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 animate-pulse pb-16">
        <div className="h-6 w-64 bg-[#EDF4ED]/80 rounded-lg" />
        <div className="h-44 bg-white border border-[#E0E8DE] rounded-2xl" />
        <div className="h-12 bg-white border border-[#E0E8DE] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-[#E0E8DE] rounded-2xl" />
          <div className="h-80 bg-white border border-[#E0E8DE] rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !changeRecord) {
    return (
      <div className="bg-white border border-[#E0E8DE] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[#FDF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[#112117] mb-2">Clause Detail Unavailable</h2>
        <p className="text-sm text-[#55675C] mb-6 leading-relaxed">
          {error || 'Unable to load the requested regulatory change detail.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/analysis/results', { state: { analysisId } })}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors cursor-pointer"
          >
            <span>Back to Analysis Results</span>
          </button>
        </div>
      </div>
    )
  }

  const oldProv = changeRecord.old_provision_id ? `Clause ${changeRecord.old_provision_id}` : 'Baseline'
  const newProv = changeRecord.new_provision_id ? `Clause ${changeRecord.new_provision_id}` : 'Revised'

  const simPercent = changeRecord.semantic_similarity
    ? Math.round(changeRecord.semantic_similarity * 100)
    : 73
  const alignPercent = changeRecord.alignment_score
    ? Math.round(changeRecord.alignment_score * 100)
    : 72

  // Format dimensions
  const dimensionList = (changeRecord.change_dimension || 'DATE, MODALITY')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

  return (
    <div className="flex flex-col space-y-5 pb-16 select-text">
      {/* 1. Breadcrumbs & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#667085]">
            <Link to="/analysis/new" className="hover:text-[#132E22]">
              Analysis
            </Link>
            <span>/</span>
            <Link to="/analysis/results" state={{ analysisId }} className="hover:text-[#132E22]">
              Results
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#1D2939]">Change {changeRecord.change_id}</span>
          </div>
          <Link
            to="/analysis/results"
            state={{ analysisId }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#344054] hover:text-[#132E22] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#667085] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Analysis Results</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => navigate('/analysis/results', { state: { analysisId } })}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#344054] hover:text-[#1D2939] border border-[#D0D5DD] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#475467]" />
            <span>View in Context</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadComparison}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#344054] hover:text-[#1D2939] border border-[#D0D5DD] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#475467]" />
            <span>Download Comparison</span>
          </button>
          {nextChangeId && (
            <button
              type="button"
              onClick={() => navigate(`/analysis/clause/${nextChangeId}`, { state: { analysisId } })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#132E22] hover:bg-[#1E4333] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Next Change</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Header Card */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-mono text-xs font-bold text-[#132E22] bg-[#EDF4ED] px-2.5 py-0.5 rounded-md border border-[#D0E5D5]">
              {changeRecord.change_id}
            </span>
            <span className="text-xs font-semibold text-[#475467]">
              {oldProv} &rarr; {newProv}
            </span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#101828] tracking-tight leading-tight">
            {changeRecord.final_category === 'SUBSTANTIVE_REGULATORY_CHANGE'
              ? 'Substantive Regulatory Change'
              : changeRecord.final_category?.replace(/_/g, ' ') || 'Regulatory Provision Change'}
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#475467] mt-1.5 font-medium">
            <span>
              Semantic Similarity: <strong className="text-[#101828] font-bold">{simPercent}%</strong>
            </span>
            <span>|</span>
            <span>
              Alignment Score: <strong className="text-[#101828] font-bold">{alignPercent}%</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318]">
              Materiality: <strong>{changeRecord.final_materiality || changeRecord.materiality || 'HIGH'}</strong>
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#EFF8FF] border border-[#B2DDFF] text-[#175CD3]">
              Type: <strong>{changeRecord.final_change_type || changeRecord.change_type || 'MODIFIED'}</strong>
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F9FAFB] border border-[#EAECF0] text-[#344054]">
            Dimension: <span className="font-mono">{dimensionList.join(', ') || 'DATE, MODALITY'}</span>
          </div>
        </div>
      </div>

      {/* 3. Diff Legend Bar & Show Changes Only Toggle */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Legend Swatches */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-[#344054]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-4 rounded bg-[#D1FADF] border border-[#A6F4C5] inline-block" />
            <span className="font-medium">Added text</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-4 rounded bg-[#FEE4E2] border border-[#FECDCA] relative flex items-center justify-center">
              <span className="w-3 h-[1.5px] bg-[#B42318]" />
            </span>
            <span className="font-medium">Removed text</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-4 rounded bg-[#FEF0C7] border border-[#FEDF89] inline-block" />
            <span className="font-medium">Modified text</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-4 rounded bg-[#D1E9FF] border border-[#B2DDFF] inline-block" />
            <span className="font-medium">Moved text</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-4 rounded border border-dashed border-[#CBD5E1] bg-white inline-block" />
            <span className="font-medium text-[#667085]">Unchanged text</span>
          </div>
        </div>

        {/* Right: Show Changes Only Toggle */}
        <div className="flex items-center gap-2.5 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0">
          <Eye className="w-4 h-4 text-[#475467]" />
          <span className="text-xs font-semibold text-[#344054]">Show changes only</span>
          <button
            type="button"
            onClick={() => setShowChangesOnly(!showChangesOnly)}
            role="switch"
            aria-checked={showChangesOnly}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showChangesOnly ? 'bg-[#132E22]' : 'bg-[#D0D5DD]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showChangesOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Two-Column Diff-Highlighted Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Previous Regulation (2020) */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-3.5 mb-4 border-b border-[#F2F4F7]">
              <div className="w-8 h-8 rounded-lg bg-[#F2F4F7] text-[#344054] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-[13.5px] font-bold text-[#101828] leading-tight">
                  Previous Regulation (2020)
                </h3>
                <span className="text-xs text-[#667085] mt-0.5 truncate">
                  {oldProv} &bull; RBI Master Directions (2020)
                </span>
              </div>
            </div>

            {/* Diff Highlighting Content Box */}
            <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#EAEFE8] text-[13px] sm:text-[13.5px] text-[#1D2939] leading-relaxed font-normal min-h-[160px]">
              {diffResult.oldSpans.length === 0 ? (
                <span className="text-[#667085] italic">
                  No previous baseline text available (New candidate requirement).
                </span>
              ) : (
                diffResult.oldSpans.map((span, idx) => {
                  if (span.type === 'REMOVED') {
                    return (
                      <span
                        key={idx}
                        className="bg-[#FEE4E2] text-[#912018] line-through px-1 py-0.5 rounded font-medium border border-[#FECDCA]/70 mx-0.5 inline-block my-0.5"
                      >
                        {span.text}
                      </span>
                    )
                  }
                  if (span.type === 'MODIFIED') {
                    return (
                      <span
                        key={idx}
                        className="bg-[#FEF0C7] text-[#93370D] px-1 py-0.5 rounded font-medium border border-[#FEDF89]/70 mx-0.5 inline-block my-0.5"
                      >
                        {span.text}
                      </span>
                    )
                  }
                  if (showChangesOnly) {
                    // In show changes only mode, condense long unchanged spans
                    if (span.text.length > 60) {
                      return (
                        <span key={idx} className="text-[#98A2B3] text-xs px-1 select-none">
                          &hellip; [unchanged] &hellip;
                        </span>
                      )
                    }
                  }
                  return <span key={idx}>{span.text}</span>
                })
              )}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center gap-4 pt-3.5 mt-4 border-t border-[#F2F4F7] text-xs text-[#667085]">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#98A2B3]" />
              <span>Page: 24</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#98A2B3]" />
              <span>Word count: {diffResult.wordCountOld}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Revised Regulation (2025) */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-3.5 mb-4 border-b border-[#F2F4F7]">
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF3] text-[#027A48] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-[13.5px] font-bold text-[#101828] leading-tight">
                  Revised Regulation (2025)
                </h3>
                <span className="text-xs text-[#667085] mt-0.5 truncate">
                  {newProv} &bull; RBI Master Directions (2025)
                </span>
              </div>
            </div>

            {/* Diff Highlighting Content Box */}
            <div className="p-4 bg-[#F8FDF9] rounded-xl border border-[#D5EADB] text-[13px] sm:text-[13.5px] text-[#101828] leading-relaxed font-normal min-h-[160px]">
              {diffResult.newSpans.length === 0 ? (
                <span className="text-[#667085] italic">
                  No revised clause text available (Candidate retired provision).
                </span>
              ) : (
                diffResult.newSpans.map((span, idx) => {
                  if (span.type === 'ADDED') {
                    return (
                      <span
                        key={idx}
                        className="bg-[#D1FADF] text-[#027A48] px-1 py-0.5 rounded font-medium border border-[#A6F4C5]/70 mx-0.5 inline-block my-0.5"
                      >
                        {span.text}
                      </span>
                    )
                  }
                  if (span.type === 'MODIFIED') {
                    return (
                      <span
                        key={idx}
                        className="bg-[#FEF0C7] text-[#93370D] px-1 py-0.5 rounded font-medium border border-[#FEDF89]/70 mx-0.5 inline-block my-0.5"
                      >
                        {span.text}
                      </span>
                    )
                  }
                  if (showChangesOnly) {
                    if (span.text.length > 60) {
                      return (
                        <span key={idx} className="text-[#98A2B3] text-xs px-1 select-none">
                          &hellip; [unchanged] &hellip;
                        </span>
                      )
                    }
                  }
                  return <span key={idx}>{span.text}</span>
                })
              )}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center gap-4 pt-3.5 mt-4 border-t border-[#F2F4F7] text-xs text-[#667085]">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#98A2B3]" />
              <span>Page: 28</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#98A2B3]" />
              <span>Word count: {diffResult.wordCountNew}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Detected Changes & NLP Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Detected Changes */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-3.5 border-b border-[#F2F4F7]">
              <GitCompare className="w-4 h-4 text-[#344054]" />
              <h4 className="text-[13.5px] font-bold text-[#101828]">Detected Changes</h4>
            </div>

            <div className="space-y-2.5">
              {diffResult.detectedChanges.length === 0 ? (
                <p className="text-xs text-[#667085] italic">No textual modifications detected.</p>
              ) : (
                diffResult.detectedChanges.map((change, idx) => {
                  let iconBg = 'bg-[#FEE4E2] text-[#B42318]'
                  let Icon = Minus
                  if (change.type === 'ADDED') {
                    iconBg = 'bg-[#D1FADF] text-[#027A48]'
                    Icon = Plus
                  } else if (change.type === 'MODIFIED') {
                    iconBg = 'bg-[#FEF0C7] text-[#B54708]'
                    Icon = ModifyIcon
                  }

                  return (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#344054] leading-snug">
                      <div
                        className={`w-4 h-4 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold`}
                      >
                        <Icon className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="font-mono text-[12px]">{change.label}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Card: NLP Analysis */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-3.5 border-b border-[#F2F4F7]">
              <Sparkles className="w-4 h-4 text-[#132E22]" />
              <h4 className="text-[13.5px] font-bold text-[#101828]">NLP Analysis</h4>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-[12.5px] text-[#334155] leading-relaxed mb-4">
              {changeRecord.final_explanation ||
                changeRecord.explanation ||
                'This is primarily a structural and wording change with expansion of sub-provisions in the 2025 version.'}
            </div>

            {/* Change Dimensions */}
            <div>
              <h5 className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">
                Change Dimensions
              </h5>
              <div className="flex flex-wrap gap-2">
                {dimensionList.map((dim, idx) => {
                  let badgeStyle = 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                  if (dim.includes('STRUCTURE') || dim.includes('EXPANSION')) {
                    badgeStyle = 'bg-[#FEF0C7] text-[#B54708] border-[#FEDF89]'
                  } else if (dim.includes('MONETARY') || dim.includes('PERCENTAGE')) {
                    badgeStyle = 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]'
                  }
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold border uppercase tracking-wider ${badgeStyle}`}
                    >
                      {dim}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
