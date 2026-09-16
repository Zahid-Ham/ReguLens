import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { getAnalyses, deleteAnalysis } from '../services/api'
import AnalysisOverviewDrawer from '../components/history/AnalysisOverviewDrawer'

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

export default function AnalysisHistory() {
  const navigate = useNavigate()

  // Data & State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')
  const [selectedDocType, setSelectedDocType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Selected Analysis for Right-Side Overview Drawer
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)

  // Action Menu Dropdown State (holds open row ID)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  // Fetch Analyses from Backend API
  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAnalyses({
        search: searchQuery,
        status: selectedStatus,
        date_filter: selectedDate,
        document_type: selectedDocType,
        page: currentPage,
        page_size: pageSize,
      })

      const rawItems = data.analyses || []
      const items = rawItems.slice().sort((a, b) => {
        const timeA = new Date(a.created_at || a.started_at || 0).getTime()
        const timeB = new Date(b.created_at || b.started_at || 0).getTime()
        return timeB - timeA
      })

      if (items.length > 0 && currentPage === 1) {
        items[0].is_most_recent = true
        for (let i = 1; i < items.length; i++) {
          items[i].is_most_recent = false
        }
      }

      setAnalyses(items)
      setTotalRecords(data.total || 0)
      setTotalPages(data.total_pages || 1)

      // Auto-select first item if drawer is open or keep selection updated
      if (items.length > 0) {
        setSelectedAnalysis((prev) => {
          if (!prev) return items[0]
          const matched = items.find((i) => i.id === prev.id)
          return matched || items[0]
        })
      } else {
        setSelectedAnalysis(null)
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err)
      setError(err.message || 'Unable to connect to persistence database.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedStatus, selectedDate, selectedDocType, currentPage])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Reset page to 1 when filters change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value)
    setCurrentPage(1)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setCurrentPage(1)
  }

  const handleDocTypeChange = (e) => {
    setSelectedDocType(e.target.value)
    setCurrentPage(1)
  }

  const handleOpenAnalysis = (analysisId) => {
    navigate(`/analysis/results?id=${encodeURIComponent(analysisId)}`)
  }

  const handleDeleteAnalysis = async (e, analysisId) => {
    e.stopPropagation()
    setOpenActionMenuId(null)
    if (analysisId === 'psl-2020-2025') {
      alert('The canonical PSL 2020 vs 2025 analysis benchmark cannot be deleted.')
      return
    }
    if (!window.confirm(`Are you sure you want to delete analysis #${analysisId}?`)) {
      return
    }

    try {
      await deleteAnalysis(analysisId)
      fetchHistory()
    } catch (err) {
      alert(err.message || 'Failed to delete analysis.')
    }
  }

  // Calculate pagination label bounds
  const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endRecord = Math.min(currentPage * pageSize, totalRecords)

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col relative pb-16">
      <div className={`flex-1 transition-all duration-300 ${selectedAnalysis ? 'xl:pr-[460px] 2xl:pr-[500px]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                Analysis History
              </h1>
              <p className="text-sm text-[#55675C] mt-1">
                Review, compare and reopen previous regulatory analyses.
              </p>
            </div>
            <div>
              <Link
                to="/analysis/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> New Analysis
              </Link>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            </div>

            {/* Status Dropdown */}
            <div className="w-full md:w-40">
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              >
                <option value="all">All statuses</option>
                <option value="complete">Complete</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Dates Dropdown */}
            <div className="w-full md:w-40">
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              >
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </select>
            </div>

            {/* Document Type Dropdown */}
            <div className="w-full md:w-44">
              <select
                value={selectedDocType}
                onChange={handleDocTypeChange}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              >
                <option value="all">All document types</option>
                <option value="Master Direction">Master Direction</option>
                <option value="Circular">Circular</option>
                <option value="Directions">Directions</option>
                <option value="Policy">Company Policy</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
                <p className="text-xs text-[#64748B]">Loading analysis history...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto" />
                <h3 className="text-sm font-semibold text-[#0F172A]">Failed to load history</h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">{error}</p>
                <button
                  type="button"
                  onClick={fetchHistory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            ) : analyses.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">No analyses yet</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  {searchQuery || selectedStatus !== 'all' || selectedDate !== 'all'
                    ? 'No regulatory analyses match your filter criteria.'
                    : 'Completed regulatory comparisons and policy gap assessments will appear here.'}
                </p>
                <Link
                  to="/analysis/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8]"
                >
                  <Plus className="w-3.5 h-3.5" /> Start New Analysis
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-6">Analysis</th>
                      <th className="py-3 px-4">Regulation Pair</th>
                      <th className="py-3 px-4">Company Policy</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Compliance Gaps</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {analyses.map((item, idx) => {
                      const isSelected = selectedAnalysis?.id === item.id
                      const hasPolicy = Boolean(item.company_policy_document_id || item.company_policy_document_title)
                      const isActionOpen = openActionMenuId === item.id

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedAnalysis(item)}
                          className={`cursor-pointer transition-colors group ${
                            isSelected
                              ? 'bg-[#F0FDF4]/70 hover:bg-[#F0FDF4]'
                              : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {/* Column 1: Analysis Name & ID */}
                          <td className="py-4 px-4 sm:px-6 align-top">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[#0F172A] text-xs leading-snug group-hover:text-[#2563EB] transition-colors">
                                  {item.title}
                                </span>
                                {item.is_most_recent && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                    ★ Most recent
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-[#94A3B8] mt-1">
                                #{item.id}
                              </span>
                            </div>
                          </td>

                          {/* Column 2: Regulation Pair */}
                          <td className="py-4 px-4 align-top max-w-xs">
                            <div className="flex items-start gap-2 text-[11.5px]">
                              <FileText className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-[#64748B] line-clamp-1">
                                  <span className="font-semibold text-[#0F172A]">Previous:</span>{' '}
                                  {item.previous_document_title || item.previous_document_filename || item.previous_document_id}
                                </div>
                                <div className="text-[#64748B] line-clamp-1">
                                  <span className="font-semibold text-[#0F172A]">Current:</span>{' '}
                                  {item.current_document_title || item.current_document_filename || item.current_document_id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Column 3: Company Policy */}
                          <td className="py-4 px-4 align-top max-w-[200px]">
                            <div className="flex items-start gap-2 text-[11.5px]">
                              <FileSpreadsheet
                                className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                                  hasPolicy ? 'text-[#059669]' : 'text-[#CBD5E1]'
                                }`}
                              />
                              <span
                                className={`line-clamp-2 ${
                                  hasPolicy
                                    ? 'text-[#0F172A] font-medium'
                                    : 'text-[#94A3B8] italic'
                                }`}
                              >
                                {hasPolicy
                                  ? item.company_policy_document_title ||
                                    item.company_policy_document_filename ||
                                    item.company_policy_document_id
                                  : 'Not added'}
                              </span>
                            </div>
                          </td>

                          {/* Column 4: Status */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            {item.status === 'complete' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                <CheckCircle2 className="w-3 h-3 text-[#059669]" /> Complete
                              </span>
                            )}
                            {item.status === 'processing' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                                <Loader2 className="w-3 h-3 text-[#2563EB] animate-spin" /> Processing
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                                <AlertCircle className="w-3 h-3 text-[#DC2626]" /> Failed
                              </span>
                            )}
                          </td>

                          {/* Column 5: Compliance Gaps */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            {hasPolicy ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-[#DC2626]">
                                  {item.policy_summary?.policy_gaps ?? 0} gaps
                                </span>
                                <span className="text-[11px] text-[#D97706]">
                                  {item.policy_summary?.partial_matches ?? 0} partial
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#94A3B8] font-medium">—</span>
                            )}
                          </td>

                          {/* Column 6: Created Date */}
                          <td className="py-4 px-4 align-top whitespace-nowrap text-[#64748B]">
                            {formatDate(item.created_at)}
                          </td>

                          {/* Column 7: Actions Menu */}
                          <td className="py-4 px-4 align-top text-right relative">
                            <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionMenuId((prev) => (prev === item.id ? null : item.id))
                                }
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                                aria-label="Analysis row actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Action Dropdown Menu */}
                              {isActionOpen && (
                                <div className="absolute right-4 mt-1 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 py-1 divide-y divide-[#F1F5F9]">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAnalysis(item.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 font-medium"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" /> Open Analysis
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAnalysis(item)
                                      setOpenActionMenuId(null)
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#64748B]" /> View Overview
                                  </button>
                                  {item.id !== 'psl-2020-2025' && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteAnalysis(e, item.id)}
                                      className="w-full text-left px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" /> Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {totalRecords > 0 && (
              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
                <div>
                  Showing <span className="font-semibold text-[#0F172A]">{startRecord}</span>–
                  <span className="font-semibold text-[#0F172A]">{endRecord}</span> of{' '}
                  <span className="font-semibold text-[#0F172A]">{totalRecords}</span> analyses
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-[#F1F5F9] transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-[#F1F5F9] transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right-Side Analysis Overview Drawer */}
      {selectedAnalysis && (
        <AnalysisOverviewDrawer
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          onOpenAnalysis={handleOpenAnalysis}
        />
      )}
    </div>
  )
}
