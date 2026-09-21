/**
 * NLP Explorer API Service
 * Interacts with FastAPI backend for /api/nlp-explorer endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetch all available documents for NLP exploration.
 * @returns {Promise<Array>}
 */
export async function getNLPDocuments() {
  const res = await fetch(`${API_BASE_URL}/api/nlp-explorer/documents`)
  if (!res.ok) {
    throw new Error(`Failed to load NLP documents (${res.status}): ${res.statusText}`)
  }
  return await res.json()
}

/**
 * Fetch ordered clauses for a document.
 * @param {string} documentId
 * @param {string} [search]
 * @returns {Promise<Array>}
 */
export async function getDocumentClauses(documentId, search = '') {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  
  const res = await fetch(
    `${API_BASE_URL}/api/nlp-explorer/documents/${encodeURIComponent(documentId)}/clauses?${params.toString()}`
  )
  if (!res.ok) {
    throw new Error(`Failed to load document clauses (${res.status}): ${res.statusText}`)
  }
  return await res.json()
}

/**
 * Fetch comprehensive NLP analysis payload for a clause.
 * @param {string} clauseId
 * @param {string} [documentId]
 * @returns {Promise<Object>}
 */
export async function getClauseNLPDetail(clauseId, documentId = null) {
  const params = new URLSearchParams()
  if (documentId) params.append('document_id', documentId)

  const res = await fetch(
    `${API_BASE_URL}/api/nlp-explorer/clauses/${encodeURIComponent(clauseId)}?${params.toString()}`
  )
  if (!res.ok) {
    throw new Error(`Failed to load clause NLP analysis (${res.status}): ${res.statusText}`)
  }
  return await res.json()
}
