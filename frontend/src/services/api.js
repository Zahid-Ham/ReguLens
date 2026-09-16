/**
 * ReguLens Centralized API Client
 * Connects React frontend directly to FastAPI backend service.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Core HTTP fetch wrapper with error handling and JSON parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorData = null
      try {
        errorData = await response.json()
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        (errorData && (errorData.detail || errorData.message || errorData.error)) ||
        `Request failed with status ${response.status}: ${response.statusText}`

      throw new ApiError(errorMessage, response.status, errorData)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    // Network or connection failure
    throw new ApiError(
      'Unable to connect to the ReguLens API. Please verify the backend server is running at ' +
        API_BASE_URL,
      0,
      { originalError: err.message }
    )
  }
}

// =============================================================================
// Regulatory Document Library
// =============================================================================

export async function getRegulations({ search, document_type, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (document_type) params.append('document_type', document_type)
  if (limit !== undefined) params.append('limit', limit)
  if (offset !== undefined) params.append('offset', offset)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/regulations${queryString}`)
}

export async function getRegulation(documentId) {
  if (!documentId) throw new Error('documentId is required')
  return request(`/api/regulations/${encodeURIComponent(documentId)}`)
}

// =============================================================================
// Document Upload & Ingestion
// =============================================================================

export async function uploadDocument(file) {
  if (!file) throw new Error('File is required for upload')

  const formData = new FormData()
  formData.append('file', file)

  const url = `${API_BASE_URL}/api/documents/upload`

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type so browser sets multipart/form-data boundary automatically
    })

    if (!response.ok) {
      let errorData = null
      try {
        errorData = await response.json()
      } catch {
        // Non-JSON response
      }

      const errorMessage =
        (errorData && (errorData.detail || errorData.message || errorData.error)) ||
        `Upload failed with status ${response.status}: ${response.statusText}`

      throw new ApiError(errorMessage, response.status, errorData)
    }

    return await response.json()
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    throw new ApiError(
      'Unable to connect to the ReguLens API during upload. Please verify the backend server is running.',
      0,
      { originalError: err.message }
    )
  }
}

export async function processDocumentNlp(documentId) {
  if (!documentId) throw new Error('documentId is required')
  return request(`/api/documents/${encodeURIComponent(documentId)}/nlp`, {
    method: 'POST',
  })
}

export async function getDocumentNlp(documentId) {
  if (!documentId) throw new Error('documentId is required')
  return request(`/api/documents/${encodeURIComponent(documentId)}/nlp`)
}


// =============================================================================
// Analysis Workflow & Jobs
// =============================================================================
// Analysis History & Persistence
// =============================================================================

export async function getAnalyses({
  search,
  status,
  date_filter,
  document_type,
  page = 1,
  page_size = 10,
} = {}) {
  const params = new URLSearchParams()
  if (search && search.trim()) params.append('search', search.trim())
  if (status && status !== 'all') params.append('status', status)
  if (date_filter && date_filter !== 'all') params.append('date_filter', date_filter)
  if (document_type && document_type !== 'all') params.append('document_type', document_type)
  if (page !== undefined) params.append('page', page)
  if (page_size !== undefined) params.append('page_size', page_size)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/analyses${queryString}`)
}

export async function getAnalysisDetail(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analyses/${encodeURIComponent(analysisId)}`)
}

export async function deleteAnalysis(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analyses/${encodeURIComponent(analysisId)}`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Analysis Workflow & Jobs
// =============================================================================

export async function createAnalysis({
  previous_document_id,
  current_document_id,
  company_policy_document_id = null,
}) {
  return request('/api/analysis', {
    method: 'POST',
    body: JSON.stringify({
      previous_document_id,
      current_document_id,
      company_policy_document_id,
    }),
  })
}

export async function getAnalysisStatus(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/status`)
}

export async function getAnalysisResults(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/results`)
}

export async function getDocumentClauses(analysisId, documentRole = 'current') {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/documents/${encodeURIComponent(documentRole)}/clauses`)
}

export async function getClauseDetail(analysisId, documentRole = 'current', clauseIndex = 1) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/clauses/${encodeURIComponent(documentRole)}/${encodeURIComponent(clauseIndex)}`)
}

// =============================================================================
// Regulatory Change Intelligence
// =============================================================================

export async function getAnalysisChanges(
  analysisId = 'psl-2020-2025',
  { change_type, category, materiality, limit = 50, offset = 0 } = {}
) {
  const params = new URLSearchParams()
  if (change_type && change_type !== 'all') params.append('change_type', change_type)
  if (category && category !== 'all') params.append('category', category)
  if (materiality && materiality !== 'all') params.append('materiality', materiality)
  if (limit !== undefined) params.append('limit', limit)
  if (offset !== undefined) params.append('offset', offset)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/changes${queryString}`)
}

export async function getAnalysisChange(analysisId = 'psl-2020-2025', changeId) {
  if (!changeId) throw new Error('changeId is required')
  return request(
    `/api/analysis/${encodeURIComponent(analysisId)}/changes/${encodeURIComponent(changeId)}`
  )
}

export async function getAnalysisClause(analysisId = 'psl-2020-2025', version, clauseId) {
  if (!version || !clauseId) throw new Error('version and clauseId are required')
  return request(
    `/api/analysis/${encodeURIComponent(analysisId)}/clauses/${encodeURIComponent(
      version
    )}/${encodeURIComponent(clauseId)}`
  )
}

export async function getAnalysisRequirements(
  analysisId = 'psl-2020-2025',
  { document_id, function: regFunction, limit = 50, offset = 0 } = {}
) {
  const params = new URLSearchParams()
  if (document_id) params.append('document_id', document_id)
  if (regFunction) params.append('function', regFunction)
  if (limit !== undefined) params.append('limit', limit)
  if (offset !== undefined) params.append('offset', offset)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/requirements${queryString}`)
}

// =============================================================================
// NLP Processing Intelligence
// =============================================================================

export async function getNlpOverview(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/overview`)
}

export async function getNlpEntities(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/entities`)
}

export async function getNlpClassification(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/classification`)
}

export async function getNlpRequirementCoverage(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/requirements/coverage`)
}

export async function getNlpEvaluation(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/evaluation`)
}

export async function getNlpStatus(analysisId = 'psl-2020-2025') {
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/nlp/status`)
}

export async function getNlpClauseDetail(analysisId = 'psl-2020-2025', clauseId) {
  if (!clauseId) throw new Error('clauseId is required')
  return request(
    `/api/analysis/${encodeURIComponent(analysisId)}/nlp/clauses/${encodeURIComponent(clauseId)}`
  )
}

// =============================================================================
// Company Policy Mapping & Compliance Impact
// =============================================================================

export async function getPolicyMapping(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/policy-mapping`)
}

export async function getPolicyMappingSummary(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/policy-mapping/summary`)
}

export async function getPolicyMappingRecord(analysisId, mappingId) {
  if (!analysisId || !mappingId) throw new Error('analysisId and mappingId are required')
  return request(
    `/api/analysis/${encodeURIComponent(analysisId)}/policy-mapping/${encodeURIComponent(mappingId)}`
  )
}

export async function generatePolicyInsights(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/policy-mapping/insights`, {
    method: 'POST',
  })
}

export async function explainPolicyMappingRecord(analysisId, mappingId) {
  if (!analysisId || !mappingId) throw new Error('analysisId and mappingId are required')
  return request(
    `/api/analysis/${encodeURIComponent(analysisId)}/policy-mapping/${encodeURIComponent(
      mappingId
    )}/explain`,
    {
      method: 'POST',
    }
  )
}

// =============================================================================
// AI Advisory Insights (Groq + Evidence Grounded)
// =============================================================================

export async function getAnalysisInsights(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/insights`)
}

export async function refreshAnalysisInsights(analysisId) {
  if (!analysisId) throw new Error('analysisId is required')
  return request(`/api/analysis/${encodeURIComponent(analysisId)}/insights/refresh`, {
    method: 'POST',
  })
}

export async function getAnalysisInsightDetail(analysisId, insightId) {
  if (!analysisId || !insightId) throw new Error('analysisId and insightId are required')
  return request(
    `/api/analysis/${encodeURIComponent(analysisId)}/insights/${encodeURIComponent(insightId)}`
  )
}

// =============================================================================
// Health & Integrity
// =============================================================================

export async function getHealth() {
  return request('/api/health')
}

export async function getHealthIntegrity() {
  return request('/api/health/integrity')
}


