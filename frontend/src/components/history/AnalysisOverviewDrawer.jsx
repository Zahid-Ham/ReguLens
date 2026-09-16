import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  FileText,
  AlertTriangle,
  ListChecks,
  Scale,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react'

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return 'Instant (precomputed)'
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) return `${secs} seconds`
  if (secs === 0) return `${mins} minute${mins > 1 ? 's' : ''}`
  return `${mins} minute${mins > 1 ? 's' : ''} ${secs} second${secs > 1 ? 's' : ''}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return dateStr
  }
}

export default function AnalysisOverviewDrawer({ analysis, onClose, onOpenAnalysis }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  if (!analysis) return null

  const overview = analysis.overview_summary || {}
  const policySummary = analysis.policy_summary || {}
  const hasPolicy = Boolean(analysis.company_policy_document_id || analysis.company_policy_document_title)

  const isComplete = analysis.status === 'complete'
  const isProcessing = analysis.status === 'processing'
  const isFailed = analysis.status === 'failed'

  const handleOpen = () => {
    if (onOpenAnalysis) {
      onOpenAnalysis(analysis.id)
    } else {
      navigate(`/analysis/results?id=${encodeURIComponent(analysis.id)}`)
    }
  }

  const handleCompare = () => {
    navigate('/analysis/new')
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md lg:max-w-lg bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
      {/* Drawer Header */}
      <div className="px-6 py-5 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Analysis Overview
            </span>
            <h2 className="text-lg font-bold text-[#0F172A] mt-0.5 leading-snug">
              {analysis.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-mono text-[#64748B]">#{analysis.id}</span>
              {isComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  <CheckCircle2 className="w-3 h-3" /> Complete
                </span>
              )}
              {isProcessing && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  <Loader2 className="w-3 h-3 animate-spin" /> Processing
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                  <AlertCircle className="w-3 h-3" /> Failed
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            aria-label="Close overview drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 border-b border-[#E2E8F0] -mb-px mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'documents'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'results'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Results
          </button>
          {hasPolicy && (
            <button
              type="button"
              onClick={() => setActiveTab('policy')}
              className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'policy'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Policy Mapping
            </button>
          )}
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* =========================================================================
            TAB 1: OVERVIEW
           ========================================================================= */}
        {activeTab === 'overview' && (
          <>
            {/* Key Information */}
            <div>
              <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-3">
                Key Information
              </h3>
              <div className="space-y-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block leading-none">Created At</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block">
                      {formatDate(analysis.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block leading-none">Duration</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block">
                      {formatDuration(analysis.duration_seconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#059669] flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block leading-none">Status</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block">
                      {isComplete ? 'Completed successfully' : isProcessing ? 'In progress' : 'Failed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block leading-none">Created By</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block">
                      {analysis.created_by || 'Zahid Hamdule'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Used */}
            <div>
              <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-3">
                Documents Used
              </h3>
              <div className="space-y-2">
                {/* Previous Regulation */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                      Previous Regulation
                    </span>
                    <span className="text-xs font-medium text-[#0F172A] line-clamp-2 mt-0.5">
                      {analysis.previous_document_title || analysis.previous_document_filename || analysis.previous_document_id}
                    </span>
                  </div>
                </div>

                {/* Current Regulation */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                      Current Regulation
                    </span>
                    <span className="text-xs font-medium text-[#0F172A] line-clamp-2 mt-0.5">
                      {analysis.current_document_title || analysis.current_document_filename || analysis.current_document_id}
                    </span>
                  </div>
                </div>

                {/* Company Policy */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 mt-0.5 ${hasPolicy ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                      Company Policy
                    </span>
                    <span className={`text-xs font-medium line-clamp-2 mt-0.5 ${hasPolicy ? 'text-[#0F172A]' : 'text-[#94A3B8] italic'}`}>
                      {hasPolicy
                        ? analysis.company_policy_document_title || analysis.company_policy_document_filename || analysis.company_policy_document_id
                        : 'Not added'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div>
              <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-3">
                Results Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Regulatory Changes Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none">
                    {overview.total_records ?? 0}
                  </div>
                  <div className="text-[11px] font-semibold text-[#64748B] mt-1">
                    Regulatory Changes
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8] mt-1 space-y-0.5">
                    <div>{overview.substantive_changes ?? 0} substantive</div>
                    <div>{overview.added_candidates ?? 0} added</div>
                    <div>{overview.wording_only ?? 0} wording only</div>
                  </div>
                </div>

                {/* Policy Gaps Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${hasPolicy ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none">
                    {hasPolicy ? (policySummary.policy_gaps ?? 0) : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#64748B] mt-1">
                    Policy Gaps
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8] mt-1 space-y-0.5">
                    {hasPolicy ? (
                      <>
                        <div>{policySummary.non_compliant ?? policySummary.policy_gaps ?? 0} non-compliant</div>
                        <div>{policySummary.partial_matches ?? 0} partial matches</div>
                      </>
                    ) : (
                      <div>No policy evaluated</div>
                    )}
                  </div>
                </div>

                {/* Administrative Changes Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6 h-6 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <ListChecks className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none">
                    {overview.administrative_changes ?? 0}
                  </div>
                  <div className="text-[11px] font-semibold text-[#64748B] mt-1">
                    Administrative Changes
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8] mt-1">
                    Non-material updates
                  </div>
                </div>

                {/* Mapped to Policy Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${hasPolicy ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none">
                    {hasPolicy ? (policySummary.mapped_to_policy ?? 0) : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#64748B] mt-1">
                    Mapped to Policy
                  </div>
                  <div className="text-[10.5px] text-[#059669] font-medium mt-1">
                    {hasPolicy ? `${policySummary.coverage_percentage ?? 0}% coverage` : '—'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================================
            TAB 2: DOCUMENTS
           ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider block mb-1">
                Baseline (Previous)
              </span>
              <h4 className="text-xs font-bold text-[#0F172A] leading-snug">
                {analysis.previous_document_title}
              </h4>
              <p className="text-[11px] font-mono text-[#64748B] mt-1">
                ID: {analysis.previous_document_id}
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <span className="text-[11px] font-semibold text-[#059669] uppercase tracking-wider block mb-1">
                Target (Current)
              </span>
              <h4 className="text-xs font-bold text-[#0F172A] leading-snug">
                {analysis.current_document_title}
              </h4>
              <p className="text-[11px] font-mono text-[#64748B] mt-1">
                ID: {analysis.current_document_id}
              </p>
            </div>

            {hasPolicy && (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <span className="text-[11px] font-semibold text-[#D97706] uppercase tracking-wider block mb-1">
                  Internal Company Policy
                </span>
                <h4 className="text-xs font-bold text-[#0F172A] leading-snug">
                  {analysis.company_policy_document_title}
                </h4>
                <p className="text-[11px] font-mono text-[#64748B] mt-1">
                  ID: {analysis.company_policy_document_id}
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: RESULTS BREAKDOWN
           ========================================================================= */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Change Classification Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Substantive Modifications</span>
                  <span className="font-semibold text-[#DC2626]">{overview.substantive_changes ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Administrative Updates</span>
                  <span className="font-semibold text-[#2563EB]">{overview.administrative_changes ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Wording-Only Changes</span>
                  <span className="font-semibold text-[#D97706]">{overview.wording_only ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Added Candidates</span>
                  <span className="font-semibold text-[#2563EB]">{overview.added_candidates ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Removed Candidates</span>
                  <span className="font-semibold text-[#64748B]">{overview.removed_candidates ?? 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Unchanged Provisions</span>
                  <span className="font-semibold text-[#94A3B8]">{overview.unchanged ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Materiality Distribution
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">High Materiality</span>
                  <span className="font-semibold text-[#DC2626]">{overview.high_materiality ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Medium Materiality</span>
                  <span className="font-semibold text-[#D97706]">{overview.medium_materiality ?? 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Low Materiality</span>
                  <span className="font-semibold text-[#059669]">{overview.low_materiality ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: POLICY MAPPING BREAKDOWN
           ========================================================================= */}
        {activeTab === 'policy' && hasPolicy && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Compliance Status Counts
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Total Regulatory Requirements</span>
                  <span className="font-semibold text-[#0F172A]">{policySummary.total_regulatory_requirements ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Fully Compliant</span>
                  <span className="font-semibold text-[#059669]">{policySummary.compliant_count ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Partial Matches</span>
                  <span className="font-semibold text-[#D97706]">{policySummary.partial_matches ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Policy Gaps (Non-Compliant)</span>
                  <span className="font-semibold text-[#DC2626]">{policySummary.policy_gaps ?? 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">No Policy Match Found</span>
                  <span className="font-semibold text-[#64748B]">{policySummary.no_match_found ?? 0}</span>
                </div>
              </div>
            </div>

            {policySummary.executive_summary && (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Executive Summary
                </span>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {policySummary.executive_summary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={handleOpen}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          Open Analysis <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCompare}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] text-xs font-semibold rounded-lg transition-colors"
        >
          <Scale className="w-3.5 h-3.5 text-[#64748B]" /> Compare
        </button>
      </div>
    </div>
  )
}
