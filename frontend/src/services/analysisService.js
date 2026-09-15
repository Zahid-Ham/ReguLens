import { getAnalysisResults, getAnalysisChanges, getRegulation } from './api'

/**
 * Service adapter for Regulatory Change Intelligence
 * Integrates directly with FastAPI backend endpoints:
 * - GET /api/analysis/{analysisId}/results
 * - GET /api/analysis/{analysisId}/changes
 * - GET /api/regulations/{docId}
 */

function formatShiftValues(arr) {
  if (!arr || arr.length === 0) return ''
  const unique = Array.from(new Set(arr.map((v) => String(v).trim()))).filter(Boolean)
  if (unique.length === 0) return ''
  if (unique.length <= 2) {
    return unique.join(', ')
  }
  return `${unique.slice(0, 2).join(', ')} (+${unique.length - 2} more)`
}

export function getChangePriority(change) {
  const type = (change?.changeType || '').toUpperCase()
  if (type === 'MODIFIED') return 1
  if (type === 'WORDING_ONLY' || type === 'ADMINISTRATIVE_CHANGE') return 2
  if (type === 'ADDED' || type === 'ADDED_CANDIDATE') return 3
  if (type === 'REMOVED' || type === 'REMOVED_CANDIDATE') return 4
  if (type === 'UNCHANGED') return 5
  return 6
}

export function getMaterialityPriority(materiality) {
  const mat = (materiality || '').toUpperCase()
  if (mat === 'HIGH') return 1
  if (mat === 'MEDIUM') return 2
  if (mat === 'LOW') return 3
  return 4
}

export function sortAnalysisRecords(records = []) {
  return [...records].sort((a, b) => {
    const priorityA = getChangePriority(a)
    const priorityB = getChangePriority(b)
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // Within same change type category (especially substantive), sort by materiality
    const matA = getMaterialityPriority(a.materiality)
    const matB = getMaterialityPriority(b.materiality)
    if (matA !== matB) {
      return matA - matB
    }

    return 0
  })
}

export function computeSummaryFromRecords(records = []) {
  const total = records.length
  const substantive = records.filter((r) => r.changeType === 'MODIFIED').length
  const wordingOnly = records.filter(
    (r) => r.changeType === 'WORDING_ONLY' || r.changeType === 'ADMINISTRATIVE_CHANGE'
  ).length
  const added = records.filter(
    (r) => r.changeType === 'ADDED' || r.changeType === 'ADDED_CANDIDATE'
  ).length
  const removed = records.filter(
    (r) => r.changeType === 'REMOVED' || r.changeType === 'REMOVED_CANDIDATE'
  ).length
  const unchanged = records.filter((r) => r.changeType === 'UNCHANGED').length

  const substantivePct = total > 0 ? Math.round((substantive / total) * 100) : 0
  const wordingOnlyPct = total > 0 ? Math.round((wordingOnly / total) * 100) : 0
  const addedPct = total > 0 ? Math.round((added / total) * 100) : 0
  const removedPct = total > 0 ? Math.round((removed / total) * 100) : 0
  const unchangedPct = total > 0 ? Math.round((unchanged / total) * 100) : 0

  const highMateriality = records.filter(
    (r) => (r.materiality || '').toUpperCase() === 'HIGH'
  ).length
  const mediumMateriality = records.filter(
    (r) => (r.materiality || '').toUpperCase() === 'MEDIUM'
  ).length
  const lowMateriality = records.filter(
    (r) => (r.materiality || '').toUpperCase() === 'LOW'
  ).length

  const rawChartData = [
    { name: 'Substantive', value: substantive, percentage: substantivePct, color: '#DC2626' },
    { name: 'Wording only', value: wordingOnly, percentage: wordingOnlyPct, color: '#D97706' },
    { name: 'Added candidates', value: added, percentage: addedPct, color: '#2563EB' },
    { name: 'Removed candidates', value: removed, percentage: removedPct, color: '#64748B' },
    { name: 'Unchanged', value: unchanged, percentage: unchangedPct, color: '#94A3B8' },
  ]

  const activeChartData = rawChartData.filter((item) => item.value > 0)

  return {
    total,
    substantive,
    substantivePct,
    wordingOnly,
    wordingOnlyPct,
    added,
    addedPct,
    removed,
    removedPct,
    unchanged,
    unchangedPct,
    highMateriality,
    mediumMateriality,
    lowMateriality,
    chartData: activeChartData.length > 0 ? activeChartData : rawChartData,
  }
}

export async function fetchAnalysisResults(analysisId = 'psl-2020-2025') {
  // Fetch overview/results and all change records in parallel
  const [resultsRes, changesRes] = await Promise.all([
    getAnalysisResults(analysisId),
    getAnalysisChanges(analysisId, { limit: 500, offset: 0 }),
  ])

  const overview = resultsRes.overview || {}
  const rawChanges = changesRes.changes || []

  // Fetch real document metadata from catalog
  const prevDocId = overview.previous_document_id || 'rbi_psl_2020_official'
  const currDocId = overview.current_document_id || 'rbi_a8d0f9a98495'

  const [prevDocRes, currDocRes] = await Promise.all([
    getRegulation(prevDocId).catch(() => null),
    getRegulation(currDocId).catch(() => null),
  ])

  // Map API change records to frontend display format
  const records = rawChanges.map((rec, index) => {
    const provision =
      rec.new_provision_id ||
      rec.old_provision_id ||
      `Clause ${index + 1}`

    let changeTypeLabel = 'Modified'
    if (rec.final_change_type === 'ADDED' || rec.change_type === 'ADDED') {
      changeTypeLabel = 'Added Candidate'
    } else if (rec.final_change_type === 'REMOVED' || rec.change_type === 'REMOVED') {
      changeTypeLabel = 'Removed Candidate'
    } else if (rec.final_change_type === 'WORDING_ONLY' || rec.change_type === 'WORDING_ONLY') {
      changeTypeLabel = 'Wording Only'
    } else if (rec.final_change_type === 'ADMINISTRATIVE_CHANGE') {
      changeTypeLabel = 'Administrative'
    } else if (rec.final_change_type === 'UNCHANGED' || rec.change_type === 'UNCHANGED') {
      changeTypeLabel = 'Unchanged'
    }

    let keyChange = rec.change_dimension ? rec.change_dimension.replace(/_/g, ' ') : 'Updated'
    let shiftOld = null
    let shiftNew = null

    if (rec.regulatory_changes && rec.regulatory_changes.length > 0) {
      const shift = rec.regulatory_changes[0]
      const oldVal = formatShiftValues(shift.old)
      const newVal = formatShiftValues(shift.new)
      if (oldVal && newVal) {
        shiftOld = oldVal
        shiftNew = newVal
        keyChange = `${oldVal} → ${newVal}`
      } else if (newVal) {
        shiftNew = newVal
        keyChange = `+ ${newVal}`
      } else if (oldVal) {
        shiftOld = oldVal
        keyChange = `- ${oldVal}`
      }
    } else if (rec.modality_direction) {
      keyChange = `Modality ${rec.modality_direction.toLowerCase()}`
    }

    let title = rec.final_category
      ? rec.final_category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Regulatory Provision'

    if (rec.final_category === 'SUBSTANTIVE_REGULATORY_CHANGE') {
      title = 'Substantive Provision Shift'
    } else if (rec.final_category === 'REGULATORY_STRUCTURE') {
      title = 'Structural Realignment'
    } else if (rec.final_category === 'WORDING_CHANGE') {
      title = 'Wording & Editorial Update'
    } else if (rec.final_category === 'DOCUMENT_METADATA') {
      title = 'Administrative Metadata'
    }

    return {
      id: rec.change_id,
      changeId: rec.change_id,
      provision,
      oldClauseId: rec.old_clause_id,
      newClauseId: rec.new_clause_id,
      title,
      description: rec.change_dimension
        ? `Dimension: ${rec.change_dimension.replace(/_/g, ' ')}`
        : 'Comparative requirement alignment',
      changeType: rec.final_change_type || rec.change_type,
      changeTypeLabel,
      keyChange,
      shiftOld,
      shiftNew,
      materiality: rec.final_materiality || rec.materiality || 'LOW',
      oldText: rec.old_clause_text || 'No baseline clause text available (New candidate provision).',
      newText: rec.new_clause_text || 'No updated clause text available (Retired candidate provision).',
      explanation: rec.final_explanation || rec.explanation || 'NLP comparative assessment generated based on semantic embedding similarity and deontic modality shifts.',
      similarity: rec.semantic_similarity ?? rec.alignment_score,
      regulatoryChanges: rec.regulatory_changes || [],
    }
  })

  const baseSummary = computeSummaryFromRecords(records)

  const summary = {
    ...baseSummary,
    modalityChanges: overview.modality_changes ?? 0,
    monetaryChanges: overview.monetary_changes ?? 0,
    percentageChanges: overview.percentage_changes ?? 0,
    durationChanges: overview.duration_changes ?? 0,
    deadlineChanges: overview.deadline_changes ?? 0,
    dateChanges: overview.date_changes ?? 0,
  }

  const metadata = {
    analysisId: overview.analysis_id || analysisId,
    timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    previousDocument: {
      id: prevDocId,
      title: prevDocRes?.filename || (prevDocId === 'rbi_psl_2020_official' ? 'rbi_psl_2020_official.pdf' : overview.previous_document_title || prevDocId),
      name: prevDocRes?.title || overview.previous_document_title || (prevDocId === 'rbi_psl_2020_official' ? 'RBI Priority Sector Lending Directions, 2020' : prevDocId),
      clausesProcessed: prevDocRes?.clause_count || overview.total_records || 0,
      totalWords: prevDocRes?.total_words || 0,
    },
    currentDocument: {
      id: currDocId,
      title: currDocRes?.filename || (currDocId === 'rbi_a8d0f9a98495' ? 'rbi_a8d0f9a98495.pdf' : overview.current_document_title || currDocId),
      name: currDocRes?.title || overview.current_document_title || (currDocId === 'rbi_a8d0f9a98495' ? 'Master Directions - RBI Priority Sector Lending, 2025' : currDocId),
      clausesProcessed: currDocRes?.clause_count || overview.total_records || 0,
      totalWords: currDocRes?.total_words || 0,
    },

    configuration: {
      scope: 'Full document analysis',
      modules: ['Clause classification', 'Requirement extraction', 'Semantic comparison', 'Materiality assessment'],
    },
    methodologyNotes: resultsRes.methodology_notes || {},
  }

  return {
    success: true,
    analysisId: overview.analysis_id || analysisId,
    metadata,
    summary,
    records,
  }
}

export function filterAnalysisRecords(
  records,
  { tabFilter = 'all', search = '', changeType = 'all', materiality = 'all' }
) {
  const filtered = records.filter((rec) => {
    // 1. Tab filter
    if (tabFilter === 'substantive' && rec.changeType !== 'MODIFIED') return false
    if (tabFilter === 'wording' && rec.changeType !== 'WORDING_ONLY' && rec.changeType !== 'ADMINISTRATIVE_CHANGE') return false
    if (tabFilter === 'added' && rec.changeType !== 'ADDED' && rec.changeType !== 'ADDED_CANDIDATE') return false
    if (tabFilter === 'removed' && rec.changeType !== 'REMOVED' && rec.changeType !== 'REMOVED_CANDIDATE') return false
    if (tabFilter === 'unchanged' && rec.changeType !== 'UNCHANGED') return false

    // 2. Dropdown Filter: Change Type
    if (changeType !== 'all') {
      if (changeType === 'MODIFIED' && rec.changeType !== 'MODIFIED') return false
      if (changeType === 'WORDING_ONLY' && rec.changeType !== 'WORDING_ONLY') return false
      if (changeType === 'ADDED_CANDIDATE' && rec.changeType !== 'ADDED' && rec.changeType !== 'ADDED_CANDIDATE') return false
      if (changeType === 'REMOVED_CANDIDATE' && rec.changeType !== 'REMOVED' && rec.changeType !== 'REMOVED_CANDIDATE') return false
      if (changeType === 'UNCHANGED' && rec.changeType !== 'UNCHANGED') return false
    }

    // 3. Dropdown Filter: Materiality
    if (materiality !== 'all' && rec.materiality !== materiality) return false

    // 4. Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchProvision = (rec.provision || '').toLowerCase().includes(q)
      const matchTitle = (rec.title || '').toLowerCase().includes(q)
      const matchDesc = (rec.description || '').toLowerCase().includes(q)
      const matchKeyChange = (rec.keyChange || '').toLowerCase().includes(q)
      const matchOldText = (rec.oldText || '').toLowerCase().includes(q)
      const matchNewText = (rec.newText || '').toLowerCase().includes(q)
      const matchExplanation = (rec.explanation || '').toLowerCase().includes(q)

      if (
        !matchProvision &&
        !matchTitle &&
        !matchDesc &&
        !matchKeyChange &&
        !matchOldText &&
        !matchNewText &&
        !matchExplanation
      ) {
        return false
      }
    }

    return true
  })

  // Apply deterministic priority sorting:
  // 1. Substantive (High -> Medium -> Low)
  // 2. Wording-only
  // 3. Added candidates
  // 4. Removed candidates
  // 5. Unchanged
  return sortAnalysisRecords(filtered)
}
