/**
 * Regulations Library API Client
 * Interfaces with backend endpoints for listing, filtering, metrics, and document details.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export class RegulationsApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'RegulationsApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  try {
    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      let errorData = null
      try {
        errorData = await response.json()
      } catch {
        // Non-JSON response
      }
      const msg =
        (errorData && (errorData.detail || errorData.message || errorData.error)) ||
        `Request failed (${response.status}): ${response.statusText}`
      throw new RegulationsApiError(msg, response.status, errorData)
    }

    if (response.status === 204) return null
    return await response.json()
  } catch (err) {
    if (err instanceof RegulationsApiError) throw err
    throw new RegulationsApiError(
      'Unable to connect to the ReguLens backend server at ' + API_BASE_URL,
      0,
      { originalError: err.message }
    )
  }
}

/**
 * Fetch list of regulations with query parameters.
 */
export async function fetchRegulations({
  search = '',
  document_type = '',
  regulator = '',
  category = '',
  status = '',
  year = '',
  sort = 'date_desc',
  limit = 10,
  offset = 0,
} = {}) {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (document_type && document_type !== 'All Types' && document_type !== 'all') {
    params.append('document_type', document_type)
  }
  if (regulator && regulator !== 'All Regulators' && regulator !== 'all') {
    params.append('regulator', regulator)
  }
  if (category && category !== 'All Categories' && category !== 'all') {
    params.append('category', category)
  }
  if (status && status !== 'All Statuses' && status !== 'all') {
    params.append('status', status)
  }
  if (year && year !== 'All Years' && year !== 'all') {
    params.append('year', year)
  }
  if (sort) params.append('sort', sort)
  if (limit !== undefined) params.append('limit', limit)
  if (offset !== undefined) params.append('offset', offset)

  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/regulations${query}`)
}

/**
 * Fetch detailed metadata for a single document.
 */
export async function fetchRegulationDetail(documentId) {
  if (!documentId) throw new Error('documentId is required')
  return request(`/api/regulations/${encodeURIComponent(documentId)}`)
}

/**
 * Fetch real aggregate metrics for the metric cards.
 */
export async function fetchRegulationMetrics() {
  return request('/api/regulations/metrics')
}

/**
 * Fetch available filter options (regulators, categories, statuses, years).
 */
export async function fetchRegulationFilters() {
  return request('/api/regulations/filters')
}

/**
 * Upload a new regulatory document (PDF or DOCX).
 */
export async function uploadRegulationDocument(file) {
  if (!file) throw new Error('File is required')
  const formData = new FormData()
  formData.append('file', file)

  const url = `${API_BASE_URL}/api/documents/upload`
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      let errData = null
      try {
        errData = await res.json()
      } catch {}
      const msg =
        (errData && (errData.detail || errData.message || errData.error)) ||
        `Upload failed with status ${res.status}`
      throw new RegulationsApiError(msg, res.status, errData)
    }
    return await res.json()
  } catch (err) {
    if (err instanceof RegulationsApiError) throw err
    throw new RegulationsApiError('Upload network request failed', 0, { originalError: err.message })
  }
}

/**
 * Get the direct download URL for a document.
 */
export function getRegulationDownloadUrl(documentId) {
  return `${API_BASE_URL}/api/regulations/${encodeURIComponent(documentId)}/download`
}
