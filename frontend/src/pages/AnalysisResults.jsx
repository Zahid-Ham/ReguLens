import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import ResultsHeader from '../components/analysis/ResultsHeader'
import ResultsSummary from '../components/analysis/ResultsSummary'
import ChangeFilters from '../components/analysis/ChangeFilters'
import ChangeTable from '../components/analysis/ChangeTable'
import AnalysisDetails from '../components/analysis/AnalysisDetails'
import { CompanyPolicySection } from '../components/compliance/CompanyPolicySection'
import {
  fetchAnalysisResults,
  filterAnalysisRecords,
  computeSummaryFromRecords,
} from '../services/analysisService'

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

  // Filter States
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChangeType, setSelectedChangeType] = useState('all')
  const [selectedMateriality, setSelectedMateriality] = useState('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAnalysisResults(analysisId)
      setAnalysisData(res)
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
    setActiveTab('all')
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

  const handleViewConfig = () => {
    navigate('/analysis/new')
  }

  const handleExport = () => {
    alert(
      'Export capability: audit-ready regulatory comparison package (CSV/JSON/PDF) for ' +
        analysisId
    )
  }

  // Dynamic record filtering
  const filteredRecords = useMemo(() => {
    if (!analysisData?.records) return []
    return filterAnalysisRecords(analysisData.records, {
      tabFilter: activeTab,
      search: searchQuery,
      changeType: selectedChangeType,
      materiality: selectedMateriality,
    })
  }, [analysisData?.records, activeTab, searchQuery, selectedChangeType, selectedMateriality])

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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="flex flex-col space-y-7 pb-16">
      {/* 1. Page Header with Back Link & Editorial Banner */}
      <ResultsHeader
        previousDocName={analysisData.metadata.previousDocument.name}
        currentDocName={analysisData.metadata.currentDocument.name}
      />

      {/* 2. Dynamic Reactive Summary Metric Cards Row */}
      <ResultsSummary
        summary={dynamicSummary}
        totalBaseline={analysisData.summary.total}
        isFiltered={isFiltered}
      />

      {/* 3. Filter Bar & Controls */}
      <ChangeFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
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

      {/* 4. Main Results Section: Full-Width Change-Intelligence Table */}
      <div className="w-full">
        <ChangeTable
          records={filteredRecords}
          onViewClause={handleViewClause}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* 5. Bottom Analytics Section: Analysis Details & Dynamic Change Distribution Donut */}
      <div className="w-full pt-2">
        <AnalysisDetails
          metadata={analysisData.metadata}
          chartData={dynamicSummary.chartData}
          totalChanges={dynamicSummary.total}
          onViewDetailedAnalysis={handleViewDetailedAnalysis}
          onViewConfig={handleViewConfig}
        />
      </div>

      {/* 6. Company Policy Mapping & Compliance Impact Section */}
      <div className="w-full">
        <CompanyPolicySection analysisId={analysisId} />
      </div>
    </div>
  )
}
