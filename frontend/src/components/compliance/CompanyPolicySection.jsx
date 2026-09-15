import React, { useState, useEffect, useCallback } from 'react'
import {
  Layers,
  FileText,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
  FileUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getPolicyMapping,
  generatePolicyInsights,
  explainPolicyMappingRecord,
} from '../../services/api'
import { PolicyMetricCards } from './PolicyMetricCards'
import { ComplianceInsightsPanel } from './ComplianceInsightsPanel'
import { PolicyMappingTable } from './PolicyMappingTable'
import { PolicyEvidenceDrawer } from './PolicyEvidenceDrawer'
import { PolicyEmptyState } from './PolicyEmptyState'

export function CompanyPolicySection({ analysisId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [policyData, setPolicyData] = useState(null)

  // Drawer state
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isExplainingRecord, setIsExplainingRecord] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  const loadData = useCallback(async () => {
    if (!analysisId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getPolicyMapping(analysisId)
      setPolicyData(data)
    } catch (err) {
      console.error('Failed to load policy mapping:', err)
      setError(err.message || 'Failed to load policy mapping data')
    } finally {
      setLoading(false)
    }
  }, [analysisId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Selected mapping record for drawer
  const selectedRecord = policyData?.mappings?.find(
    (m) => m.mapping_id === selectedRecordId
  )

  const handleOpenEvidence = (mappingId) => {
    setSelectedRecordId(mappingId)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedRecordId(null)
  }

  const handleGenerateInsights = async () => {
    if (!analysisId) return
    setIsGeneratingInsights(true)
    try {
      const updatedSummary = await generatePolicyInsights(analysisId)
      if (policyData) {
        setPolicyData({
          ...policyData,
          summary: updatedSummary,
        })
      }
    } catch (err) {
      console.error('Failed to generate policy insights:', err)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const handleExplainRecord = async (mappingId) => {
    if (!analysisId || !mappingId) return
    setIsExplainingRecord(true)
    try {
      const updatedRecord = await explainPolicyMappingRecord(analysisId, mappingId)
      if (policyData) {
        const updatedMappings = policyData.mappings.map((m) =>
          m.mapping_id === mappingId ? updatedRecord : m
        )
        setPolicyData({
          ...policyData,
          mappings: updatedMappings,
        })
      }
    } catch (err) {
      console.error('Failed to explain mapping record:', err)
    } finally {
      setIsExplainingRecord(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E0E8DE] bg-white p-12 text-center space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-semibold text-[#112117]">
          Loading Company Policy Mapping & Compliance Impact...
        </p>
        <p className="text-xs text-[#55675C]">
          Aligning regulatory obligations against internal policies
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6 text-center space-y-3 shadow-xs">
        <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
        <p className="text-sm font-semibold text-red-900">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#112117] bg-white border border-[#E0E8DE] hover:bg-[#F4F7F4] shadow-2xs transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  const hasPolicy = policyData?.has_policy && (policyData?.mappings?.length > 0 || policyData?.summary?.total_regulatory_requirements > 0)
  const policyTitle = policyData?.policy_document_title || 'Internal Company Policy'

  return (
    <section className="space-y-6 pt-6 border-t border-[#E0E8DE]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#112117] tracking-tight">
                  Company Policy Mapping & Compliance Impact
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  NLP Alignment
                </span>
              </div>
              <p className="text-xs text-[#55675C] mt-0.5">
                Automated alignment of regulatory requirements against internal company policies with verifiable citations and gap detection
              </p>
            </div>
          </div>
        </div>

        {/* Action / Metadata Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {hasPolicy && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFBF9] border border-[#E0E8DE] text-xs text-[#112117] shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold truncate max-w-[220px]">{policyTitle}</span>
            </div>
          )}

          <button
            onClick={loadData}
            title="Refresh Policy Mapping"
            className="p-2 rounded-xl text-[#55675C] hover:text-[#112117] bg-white border border-[#E0E8DE] hover:bg-[#F4F7F4] shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/analysis/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Manage Policy</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {!hasPolicy ? (
        <PolicyEmptyState />
      ) : (
        <div className="space-y-6">
          {/* 1. 5 Metric Cards */}
          <PolicyMetricCards summary={policyData.summary} hasPolicy={hasPolicy} />

          {/* 2. Compliance Insights AI Panel */}
          <ComplianceInsightsPanel
            summary={policyData.summary}
            analysisId={analysisId}
            onGenerateInsights={handleGenerateInsights}
            onViewEvidence={handleOpenEvidence}
            isLoadingInsights={isGeneratingInsights}
          />

          {/* 3. Policy Mapping Table */}
          <PolicyMappingTable
            mappings={policyData.mappings}
            summary={policyData.summary}
            onViewEvidence={handleOpenEvidence}
          />

          {/* 4. Evidence Slide-over Drawer */}
          <PolicyEvidenceDrawer
            mappingRecord={selectedRecord}
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            onExplainRecord={handleExplainRecord}
            isExplaining={isExplainingRecord}
          />
        </div>
      )}
    </section>
  )
}
