/**
 * ReguLens Text Diff Engine
 * High-precision word & phrase diff with replacement detection and anchor alignment.
 * Accurately aligns regulatory provisions, modality shifts, and statutory changes.
 */

/**
 * Tokenizes text into word and whitespace/punctuation tokens.
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return []
  // Matches words, numbers, currency symbols, percentages, or punctuation/spaces
  const regex = /([a-zA-Z0-9_₹$€%.-]+|\s+|[^\s\w₹$€%.-]+)/g
  const tokens = []
  let match
  while ((match = regex.exec(text)) !== null) {
    const value = match[0]
    const isWhitespace = /^\s+$/.test(value)
    const isPunctuation = /^[^\s\w₹$€%.-]+$/.test(value)
    tokens.push({
      text: value,
      isWhitespace,
      isPunctuation,
      isWord: !isWhitespace && !isPunctuation,
    })
  }
  return tokens
}

function norm(t) {
  return t.text.toLowerCase().trim()
}

/**
 * Longest Common Subsequence Diff with Anchor Matching
 */
function diffTokens(tokensA, tokensB) {
  const m = tokensA.length
  const n = tokensB.length

  if (m === 0 && n === 0) return []
  if (m === 0) return tokensB.map((t) => ({ type: 'ADDED', text: t.text }))
  if (n === 0) return tokensA.map((t) => ({ type: 'REMOVED', text: t.text }))

  const dp = new Int32Array((m + 1) * (n + 1))
  const getDP = (i, j) => dp[i * (n + 1) + j]
  const setDP = (i, j, val) => {
    dp[i * (n + 1) + j] = val
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const a = tokensA[i - 1]
      const b = tokensB[j - 1]
      if (norm(a) === norm(b)) {
        const score = a.isWord && a.text.length > 2 ? 3 : a.isWord ? 2 : 1
        setDP(i, j, getDP(i - 1, j - 1) + score)
      } else {
        const up = getDP(i - 1, j)
        const left = getDP(i, j - 1)
        setDP(i, j, up >= left ? up : left)
      }
    }
  }

  let i = m
  let j = n
  const result = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && norm(tokensA[i - 1]) === norm(tokensB[j - 1])) {
      result.unshift({
        type: 'UNCHANGED',
        text: tokensB[j - 1].text,
        oldText: tokensA[i - 1].text,
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || getDP(i, j - 1) >= getDP(i - 1, j))) {
      result.unshift({
        type: 'ADDED',
        text: tokensB[j - 1].text,
      })
      j--
    } else if (i > 0 && (j === 0 || getDP(i, j - 1) < getDP(i - 1, j))) {
      result.unshift({
        type: 'REMOVED',
        text: tokensA[i - 1].text,
      })
      i--
    }
  }

  return result
}

/**
 * Computes structured clause diff with visual highlights and detected changes.
 */
export function computeClauseDiff(oldText = '', newText = '', regulatoryShifts = []) {
  const cleanOld = (oldText || '').trim()
  const cleanNew = (newText || '').trim()

  if (!cleanOld && !cleanNew) {
    return {
      oldSpans: [],
      newSpans: [],
      detectedChanges: [],
      wordCountOld: 0,
      wordCountNew: 0,
    }
  }

  const tokensA = tokenize(cleanOld)
  const tokensB = tokenize(cleanNew)

  const wordCountOld = tokensA.filter((t) => t.isWord).length
  const wordCountNew = tokensB.filter((t) => t.isWord).length

  if (!cleanOld && cleanNew) {
    return {
      oldSpans: [],
      newSpans: [{ type: 'ADDED', text: cleanNew, isChange: true }],
      detectedChanges: [{ type: 'ADDED', text: cleanNew, label: 'Entire provision introduced' }],
      wordCountOld: 0,
      wordCountNew,
    }
  }

  if (cleanOld && !cleanNew) {
    return {
      oldSpans: [{ type: 'REMOVED', text: cleanOld, isChange: true }],
      newSpans: [],
      detectedChanges: [{ type: 'REMOVED', text: cleanOld, label: 'Entire provision removed' }],
      wordCountOld,
      wordCountNew: 0,
    }
  }

  const rawDiff = diffTokens(tokensA, tokensB)

  const oldSpans = []
  const newSpans = []
  const rawChanges = []

  let currentOld = null
  let currentNew = null

  const addOldSpan = (type, text) => {
    if (!text) return
    if (currentOld && currentOld.type === type) {
      currentOld.text += text
    } else {
      if (currentOld) oldSpans.push(currentOld)
      currentOld = { type, text, isChange: type !== 'UNCHANGED' }
    }
  }

  const addNewSpan = (type, text) => {
    if (!text) return
    if (currentNew && currentNew.type === type) {
      currentNew.text += text
    } else {
      if (currentNew) newSpans.push(currentNew)
      currentNew = { type, text, isChange: type !== 'UNCHANGED' }
    }
  }

  let idx = 0
  while (idx < rawDiff.length) {
    const item = rawDiff[idx]

    if (item.type === 'UNCHANGED') {
      addOldSpan('UNCHANGED', item.oldText || item.text)
      addNewSpan('UNCHANGED', item.text)
      idx++
      continue
    }

    const removedTokens = []
    const addedTokens = []

    while (idx < rawDiff.length && (rawDiff[idx].type === 'REMOVED' || rawDiff[idx].type === 'ADDED')) {
      if (rawDiff[idx].type === 'REMOVED') {
        removedTokens.push(rawDiff[idx].text)
      } else {
        addedTokens.push(rawDiff[idx].text)
      }
      idx++
    }

    const remStr = removedTokens.join('')
    const addStr = addedTokens.join('')

    const cleanRem = remStr.trim()
    const cleanAdd = addStr.trim()

    if (cleanRem && cleanAdd) {
      addOldSpan('MODIFIED', remStr)
      addNewSpan('MODIFIED', addStr)

      rawChanges.push({
        type: 'MODIFIED',
        oldText: cleanRem,
        newText: cleanAdd,
        label: `"${cleanRem}" → "${cleanAdd}"`,
      })
    } else if (cleanRem) {
      addOldSpan('REMOVED', remStr)
      rawChanges.push({
        type: 'REMOVED',
        text: cleanRem,
        label: `"${cleanRem}" → removed`,
      })
    } else if (cleanAdd) {
      addNewSpan('ADDED', addStr)
      rawChanges.push({
        type: 'ADDED',
        text: cleanAdd,
        label: `"${cleanAdd}" → added`,
      })
    } else {
      if (remStr) addOldSpan('UNCHANGED', remStr)
      if (addStr) addNewSpan('UNCHANGED', addStr)
    }
  }

  if (currentOld) oldSpans.push(currentOld)
  if (currentNew) newSpans.push(currentNew)

  // Curate human-readable detected changes
  const detectedChanges = []

  // Add structured regulatory parameter shifts first if present
  if (regulatoryShifts && regulatoryShifts.length > 0) {
    for (const shift of regulatoryShifts) {
      const oldVals = (shift.old || []).filter(Boolean).join(', ')
      const newVals = (shift.new || []).filter(Boolean).join(', ')
      if (oldVals && newVals) {
        detectedChanges.push({
          type: 'MODIFIED',
          label: `"${oldVals}" → "${newVals}"`,
          dimension: shift.dimension,
        })
      } else if (oldVals) {
        detectedChanges.push({
          type: 'REMOVED',
          label: `"${oldVals}" → removed`,
          dimension: shift.dimension,
        })
      } else if (newVals) {
        detectedChanges.push({
          type: 'ADDED',
          label: `"${newVals}" → added`,
          dimension: shift.dimension,
        })
      }
    }
  }

  // Filter and add textual changes (skip pure punctuation or single-letter whitespace changes)
  for (const c of rawChanges) {
    if (c.type === 'MODIFIED') {
      if (c.oldText.length > 1 || c.newText.length > 1) {
        // avoid duplicate if already in parameter shifts
        if (!detectedChanges.some((d) => d.label === c.label)) {
          detectedChanges.push(c)
        }
      }
    } else if (c.type === 'REMOVED') {
      if (c.text.length > 1 && !/^[.,;:()\[\]{}'"]+$/.test(c.text)) {
        if (!detectedChanges.some((d) => d.text === c.text)) {
          detectedChanges.push(c)
        }
      }
    } else if (c.type === 'ADDED') {
      if (c.text.length > 1 && !/^[.,;:()\[\]{}'"]+$/.test(c.text)) {
        if (!detectedChanges.some((d) => d.text === c.text)) {
          detectedChanges.push(c)
        }
      }
    }
  }

  // If new text is significantly longer and structured, add structural indicator
  if (wordCountNew > wordCountOld + 15) {
    detectedChanges.push({
      type: 'MODIFIED',
      label: 'Sentence structure changed → content expanded with sub-provisions',
    })
  }

  return {
    oldSpans,
    newSpans,
    detectedChanges: detectedChanges.slice(0, 10), // keep top 10 most relevant changes
    wordCountOld,
    wordCountNew,
  }
}
