import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RegulationsHeader from '../components/regulations/RegulationsHeader'
import RegulationMetricCards from '../components/regulations/RegulationMetricCards'
import RegulationFilters from '../components/regulations/RegulationFilters'
import RegulationTable from '../components/regulations/RegulationTable'
import RegulationDetailDrawer from '../components/regulations/RegulationDetailDrawer'
import UploadDocumentModal from '../components/regulations/UploadDocumentModal'
import DocumentViewerModal from '../components/regulations/DocumentViewerModal'
import RegulationEmptyState from '../components/regulations/RegulationEmptyState'
import {
  fetchRegulations,
  fetchRegulationDetail,
  fetchRegulationMetrics,
  fetchRegulationFilters,
  getRegulationDownloadUrl,
} from '../services/regulationsApi'

export default function RegulationsLibrary() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // State: Search & Filters
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [regulator, setRegulator] = useState(searchParams.get('regulator') || 'all')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [year, setYear] = useState(searchParams.get('year') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_desc')

  // State: Pagination
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [pageSize, setPageSize] = useState(10)

  // State: Data
  const [documents, setDocuments] = useState([])
  const [total, setTotal] = useState(0)
  const [metrics, setMetrics] = useState(null)
  const [filterOptions, setFilterOptions] = useState({
    regulators: [],
    categories: [],
    statuses: [],
    years: [],
  })

  // State: Loading & Errors
  const [loading, setLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State: Modals & Drawer
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [viewerModalOpen, setViewerModalOpen] = useState(false)
  const [viewerDoc, setViewerDoc] = useState(null)

  // Load Metrics & Filters
  const loadMetadata = useCallback(async () => {
    setMetricsLoading(true)
    try {
      const [m, f] = await Promise.all([
        fetchRegulationMetrics().catch(() => null),
        fetchRegulationFilters().catch(() => ({ regulators: [], categories: [], statuses: [], years: [] })),
      ])
      if (m) setMetrics(m)
      if (f) setFilterOptions(f)
    } catch (err) {
      console.error('Failed to load metrics/filters:', err)
    } finally {
      setMetricsLoading(false)
    }
  }, [])

  // Load Regulations List
  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * pageSize
      const res = await fetchRegulations({
        search,
        regulator,
        category,
        status,
        year,
        sort,
        limit: pageSize,
        offset,
      })

      setDocuments(res.documents || res.items || [])
      setTotal(res.total ?? (res.documents?.length || 0))
    } catch (err) {
      console.error('Failed to fetch regulations:', err)
      setError(err.message || 'Unable to load regulatory document catalog.')
    } finally {
      setLoading(false)
    }
  }, [search, regulator, category, status, year, sort, page, pageSize])

  // Initial load
  useEffect(() => {
    loadMetadata()
  }, [loadMetadata])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Sync URL search params
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (regulator !== 'all') params.set('regulator', regulator)
    if (category !== 'all') params.set('category', category)
    if (status !== 'all') params.set('status', status)
    if (sort !== 'date_desc') params.set('sort', sort)
    if (page > 1) params.set('page', String(page))
    setSearchParams(params, { replace: true })
  }, [search, regulator, category, status, sort, page, setSearchParams])

  // Handlers
  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
  }

  const handleRegulatorChange = (val) => {
    setRegulator(val)
    setPage(1)
  }

  const handleCategoryChange = (val) => {
    setCategory(val)
    setPage(1)
  }

  const handleStatusChange = (val) => {
    setStatus(val)
    setPage(1)
  }

  const handleSortChange = (val) => {
    setSort(val)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch('')
    setRegulator('all')
    setCategory('all')
    setStatus('all')
    setYear('all')
    setSort('date_desc')
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setPage(1)
  }

  // Row selection & drawer inspect
  const handleSelectDoc = async (doc) => {
    setSelectedDoc(doc)
    setDrawerOpen(true)
    // Lazy fetch full details (including sections & smart relations)
    try {
      const fullDoc = await fetchRegulationDetail(doc.document_id)
      if (fullDoc) {
        setSelectedDoc(fullDoc)
      }
    } catch (err) {
      console.warn('Could not load detailed metadata for drawer:', err)
    }
  }

  const handleViewDoc = (doc) => {
    setViewerDoc(doc)
    setViewerModalOpen(true)
  }

  const handleDownloadDoc = (doc) => {
    const downloadUrl = getRegulationDownloadUrl(doc.document_id)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = doc.filename || `${doc.document_id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Actions
  const handleUseInNewAnalysis = (doc) => {
    navigate('/analysis/new', {
      state: {
        selectedDoc: {
          id: doc.document_id,
          document_id: doc.document_id,
          title: doc.title,
          filename: doc.filename,
          clause_count: doc.clause_count,
          total_words: doc.total_words,
          date: doc.effective_date || doc.version_year,
          category: doc.category,
        },
        target: 'current',
      },
    })
  }

  const handleCompareWithRelated = (currentDoc, relatedItem) => {
    navigate('/analysis/new', {
      state: {
        previousDoc: {
          id: relatedItem.document_id,
          document_id: relatedItem.document_id,
          title: relatedItem.title,
          category: currentDoc.category,
        },
        currentDoc: {
          id: currentDoc.document_id,
          document_id: currentDoc.document_id,
          title: currentDoc.title,
          filename: currentDoc.filename,
          clause_count: currentDoc.clause_count,
          total_words: currentDoc.total_words,
          category: currentDoc.category,
        },
      },
    })
  }

  const handleInspectInNLP = (doc) => {
    navigate(`/nlp-explorer?document_id=${encodeURIComponent(doc.document_id)}`)
  }

  const handleUploadSuccess = () => {
    loadMetadata()
    loadDocuments()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <RegulationsHeader
        onUploadClick={() => setUploadModalOpen(true)}
        onRefresh={() => {
          loadMetadata()
          loadDocuments()
        }}
        isRefreshing={loading || metricsLoading}
      />

      {/* Metric Cards Row */}
      <RegulationMetricCards metrics={metrics} loading={metricsLoading} />

      {/* Search and Filters */}
      <RegulationFilters
        search={search}
        onSearchChange={handleSearchChange}
        regulator={regulator}
        onRegulatorChange={handleRegulatorChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        status={status}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSortChange}
        filterOptions={filterOptions}
        onResetFilters={handleResetFilters}
      />

      {/* Main Documents Table or Error */}
      {error ? (
        <RegulationEmptyState
          title="Unable to load regulatory library"
          description={error}
          isError={true}
          onRetry={loadDocuments}
        />
      ) : (
        <RegulationTable
          documents={documents}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          selectedDocId={selectedDoc?.document_id}
          onSelectDoc={handleSelectDoc}
          onViewDoc={handleViewDoc}
          onDownloadDoc={handleDownloadDoc}
          onUseInNewAnalysis={handleUseInNewAnalysis}
          onInspectInNLP={handleInspectInNLP}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Document Detail Drawer */}
      <RegulationDetailDrawer
        doc={selectedDoc}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onViewDoc={handleViewDoc}
        onDownloadDoc={handleDownloadDoc}
        onUseInNewAnalysis={handleUseInNewAnalysis}
        onCompareWithRelated={handleCompareWithRelated}
        onInspectInNLP={handleInspectInNLP}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        doc={viewerDoc}
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        onDownload={handleDownloadDoc}
      />
    </div>
  )
}
