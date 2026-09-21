/**
 * Global Insights API Service
 * Interacts with FastAPI backend for /api/insights endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetch complete aggregated global insights payload.
 *
 * @param {string} timeRange - '30d', '90d', '180d', '1y'/'12m', 'all'
 * @param {string} trendGranularity - 'monthly' or 'weekly'
 * @param {boolean} refreshAi - force fresh AI advisory brief generation
 * @returns {Promise<Object>}
 */
export async function getGlobalInsights(timeRange = '12m', trendGranularity = 'monthly', refreshAi = false) {
  const params = new URLSearchParams({
    time_range: timeRange,
    trend_granularity: trendGranularity,
    refresh_ai: String(refreshAi),
  })

  const res = await fetch(`${API_BASE_URL}/api/insights?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Failed to load global insights (${res.status}): ${res.statusText}`)
  }
  return await res.json()
}

/**
 * Trigger Groq AI advisory brief regeneration.
 *
 * @param {string} timeRange
 * @returns {Promise<Object>}
 */
export async function refreshAIBrief(timeRange = '12m') {
  const params = new URLSearchParams({ time_range: timeRange })
  const res = await fetch(`${API_BASE_URL}/api/insights/ai-brief?${params.toString()}`, {
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(`Failed to refresh AI brief (${res.status}): ${res.statusText}`)
  }
  return await res.json()
}
