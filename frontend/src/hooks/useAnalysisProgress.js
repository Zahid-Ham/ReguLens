import { useState, useEffect, useRef } from 'react'

/**
 * Standard 12-stage ReguLens NLP Pipeline Stages
 */
export const NLP_STAGES = [
  {
    id: 'document_processing',
    title: 'Document Processing',
    description: 'Extract text from PDFs',
    defaultDuration: '12s',
  },
  {
    id: 'clause_segmentation',
    title: 'Clause Segmentation',
    description: 'Split into meaningful clauses',
    defaultDuration: '18s',
  },
  {
    id: 'tokenization',
    title: 'Tokenization',
    description: 'Convert text to tokens',
    defaultDuration: '15s',
  },
  {
    id: 'pos_tagging',
    title: 'POS Tagging',
    description: 'Identify part-of-speech',
    defaultDuration: '14s',
  },
  {
    id: 'ner',
    title: 'Named Entity Recognition',
    description: 'Identify domain entities',
    defaultDuration: '20s',
  },
  {
    id: 'clause_classification',
    title: 'Clause Classification',
    description: 'Classify regulatory clauses',
    defaultDuration: '16s',
  },
  {
    id: 'requirement_extraction',
    title: 'Requirement Extraction',
    description: 'Extract obligations and attributes',
    defaultDuration: '22s',
  },
  {
    id: 'semantic_comparison',
    title: 'Semantic Comparison',
    description: 'Align provisions across versions',
    defaultDuration: '25s',
  },
  {
    id: 'change_detection',
    title: 'Change Detection',
    description: 'Identify and classify changes',
    defaultDuration: '18s',
  },
  {
    id: 'materiality_assessment',
    title: 'Materiality Assessment',
    description: 'Assess significance and impact',
    defaultDuration: '15s',
  },
  {
    id: 'policy_matching',
    title: 'Policy Matching',
    description: 'Compare with your company policy',
    defaultDuration: '20s',
  },
  {
    id: 'generate_insights',
    title: 'Generate Insights',
    description: 'Produce explainable results',
    defaultDuration: '10s',
  },
]

/**
 * Real clause NLP annotation data from the RBI Priority Sector Lending corpus
 */
export const SAMPLE_CLAUSE_DATA = {
  clauseNumber: 'Clause 6.2',
  documentTitle: 'RBI PSL Guidelines 2025.pdf',
  documentProgress: 'Processing clause 24 of 312',
  documentProgressPercent: 42,
  text: 'Scheduled commercial banks shall extend credit facilities to small and marginal farmers, either directly or through cooperative institutions, in accordance with the priority sector lending targets specified by the Reserve Bank of India.',
  highlightedToken: 'shall',
  tokens: [
    { text: 'Scheduled', lemma: 'schedule', pos: 'ADJ', entity: 'REGULATED_ENTITY', dep: 'amod', head: 'banks' },
    { text: 'commercial', lemma: 'commercial', pos: 'ADJ', entity: 'REGULATED_ENTITY', dep: 'amod', head: 'banks' },
    { text: 'banks', lemma: 'bank', pos: 'NOUN', entity: 'REGULATED_ENTITY', dep: 'nsubj', head: 'extend' },
    { text: 'shall', lemma: 'shall', pos: 'AUX', entity: 'MODALITY', dep: 'aux', head: 'extend', isHighlighted: true },
    { text: 'extend', lemma: 'extend', pos: 'VERB', entity: null, dep: 'ROOT', head: 'extend' },
    { text: 'credit', lemma: 'credit', pos: 'NOUN', entity: 'FINANCIAL_PRODUCT', dep: 'compound', head: 'facilities' },
    { text: 'facilities', lemma: 'facility', pos: 'NOUN', entity: 'FINANCIAL_PRODUCT', dep: 'dobj', head: 'extend' },
    { text: 'to', lemma: 'to', pos: 'ADP', entity: null, dep: 'prep', head: 'extend' },
    { text: 'small', lemma: 'small', pos: 'ADJ', entity: 'BENEFICIARY_SECTOR', dep: 'amod', head: 'farmers' },
    { text: 'and', lemma: 'and', pos: 'CCONJ', entity: null, dep: 'cc', head: 'marginal' },
    { text: 'marginal', lemma: 'marginal', pos: 'ADJ', entity: 'BENEFICIARY_SECTOR', dep: 'conj', head: 'small' },
    { text: 'farmers', lemma: 'farmer', pos: 'NOUN', entity: 'BENEFICIARY_SECTOR', dep: 'pobj', head: 'to' },
    { text: ',', lemma: ',', pos: 'PUNCT', entity: null, dep: 'punct', head: 'extend' },
    { text: 'either', lemma: 'either', pos: 'CCONJ', entity: null, dep: 'preconj', head: 'directly' },
    { text: 'directly', lemma: 'directly', pos: 'ADV', entity: null, dep: 'advmod', head: 'extend' },
    { text: 'or', lemma: 'or', pos: 'CCONJ', entity: null, dep: 'cc', head: 'through' },
    { text: 'through', lemma: 'through', pos: 'ADP', entity: null, dep: 'conj', head: 'directly' },
    { text: 'cooperative', lemma: 'cooperative', pos: 'ADJ', entity: 'INTERMEDIARY', dep: 'amod', head: 'institutions' },
    { text: 'institutions', lemma: 'institution', pos: 'NOUN', entity: 'INTERMEDIARY', dep: 'pobj', head: 'through' },
    { text: ',', lemma: ',', pos: 'PUNCT', entity: null, dep: 'punct', head: 'extend' },
    { text: 'in', lemma: 'in', pos: 'ADP', entity: null, dep: 'prep', head: 'extend' },
    { text: 'accordance', lemma: 'accordance', pos: 'NOUN', entity: null, dep: 'pobj', head: 'in' },
    { text: 'with', lemma: 'with', pos: 'ADP', entity: null, dep: 'prep', head: 'accordance' },
    { text: 'the', lemma: 'the', pos: 'DET', entity: null, dep: 'det', head: 'targets' },
    { text: 'priority', lemma: 'priority', pos: 'NOUN', entity: 'REGULATORY_INSTRUMENT', dep: 'compound', head: 'targets' },
    { text: 'sector', lemma: 'sector', pos: 'NOUN', entity: 'REGULATORY_INSTRUMENT', dep: 'compound', head: 'targets' },
    { text: 'lending', lemma: 'lending', pos: 'NOUN', entity: 'REGULATORY_INSTRUMENT', dep: 'compound', head: 'targets' },
    { text: 'targets', lemma: 'target', pos: 'NOUN', entity: 'REGULATORY_INSTRUMENT', dep: 'pobj', head: 'with' },
    { text: 'specified', lemma: 'specify', pos: 'VERB', entity: null, dep: 'acl', head: 'targets' },
    { text: 'by', lemma: 'by', pos: 'ADP', entity: null, dep: 'agent', head: 'specified' },
    { text: 'the', lemma: 'the', pos: 'DET', entity: null, dep: 'det', head: 'India' },
    { text: 'Reserve', lemma: 'Reserve', pos: 'PROPN', entity: 'REGULATOR', dep: 'compound', head: 'Bank' },
    { text: 'Bank', lemma: 'Bank', pos: 'PROPN', entity: 'REGULATOR', dep: 'compound', head: 'India' },
    { text: 'of', lemma: 'of', pos: 'ADP', entity: 'REGULATOR', dep: 'prep', head: 'Bank' },
    { text: 'India', lemma: 'India', pos: 'PROPN', entity: 'REGULATOR', dep: 'pobj', head: 'of' },
    { text: '.', lemma: '.', pos: 'PUNCT', entity: null, dep: 'punct', head: 'extend' },
  ],
  entities: [
    { text: 'Scheduled commercial banks', type: 'REGULATED_ENTITY', category: 'Entity' },
    { text: 'shall', type: 'MODALITY', category: 'Obligation' },
    { text: 'credit facilities', type: 'FINANCIAL_PRODUCT', category: 'Product' },
    { text: 'small and marginal farmers', type: 'BENEFICIARY_SECTOR', category: 'Beneficiary' },
    { text: 'cooperative institutions', type: 'INTERMEDIARY', category: 'Channel' },
    { text: 'priority sector lending targets', type: 'REGULATORY_INSTRUMENT', category: 'Standard' },
    { text: 'Reserve Bank of India', type: 'REGULATOR', category: 'Authority' },
  ],
  dependencies: [
    { subject: 'Scheduled commercial banks', relation: 'nsubj (Nominal Subject)', target: 'extend', description: 'Primary regulated entity bearing the legal obligation' },
    { subject: 'shall', relation: 'aux (Modal Auxiliary)', target: 'extend', description: 'Mandatory obligation modal verb establishing strict compliance' },
    { subject: 'extend', relation: 'ROOT (Main Action)', target: '—', description: 'Core operational mandate required by the Reserve Bank of India' },
    { subject: 'credit facilities', relation: 'dobj (Direct Object)', target: 'extend', description: 'Regulated financial allocation and lending quota' },
    { subject: 'small & marginal farmers', relation: 'pobj (Beneficiary)', target: 'to', description: 'Designated priority credit segment under sub-target requirements' },
    { subject: 'Reserve Bank of India', relation: 'agent (Regulatory Authority)', target: 'specified', description: 'Issuing statutory banking supervisor' },
  ],
  classification: {
    type: 'MANDATORY_OBLIGATION',
    confidence: 0.94,
    subject: 'Scheduled commercial banks',
    modality: 'shall',
    action: 'extend',
    object: 'credit facilities to small and marginal farmers',
  },
  changeComparison: {
    oldVersion: '2020: "Banks may consider extending credit facilities..."',
    newVersion: '2025: "Scheduled commercial banks shall extend credit facilities..."',
    changeType: 'MODALITY_STRENGTHENED',
    significance: 'HIGH',
    impact: 'Discretionary recommendation converted into a mandatory supervisory requirement.',
  },
}

/**
 * Custom Hook: useAnalysisProgress
 * Simulates deterministic, verifiable progress across the 12 NLP stages
 */
export function useAnalysisProgress({ hasPolicy = true, autoStart = true } = {}) {
  const [currentStageIndex, setCurrentStageIndex] = useState(3) // Start at POS Tagging (index 3) matching visual reference
  const [stageStatuses, setStageStatuses] = useState({
    document_processing: 'COMPLETED',
    clause_segmentation: 'COMPLETED',
    tokenization: 'COMPLETED',
    pos_tagging: 'ACTIVE',
    ner: 'PENDING',
    clause_classification: 'PENDING',
    requirement_extraction: 'PENDING',
    semantic_comparison: 'PENDING',
    change_detection: 'PENDING',
    materiality_assessment: 'PENDING',
    policy_matching: hasPolicy ? 'PENDING' : 'SKIPPED',
    generate_insights: 'PENDING',
  })

  const [overallProgress, setOverallProgress] = useState(42) // 42% matching visual reference
  const [selectedToken, setSelectedToken] = useState(
    SAMPLE_CLAUSE_DATA.tokens.find((t) => t.isHighlighted) || SAMPLE_CLAUSE_DATA.tokens[3]
  )
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('tokens') // 'tokens' | 'pos' | 'entities' | 'dependencies'
  const [elapsedSeconds, setElapsedSeconds] = useState(84) // 00:01:24
  const [estimatedSeconds, setEstimatedSeconds] = useState(200) // 00:03:20
  const [isPaused, setIsPaused] = useState(!autoStart)
  const [isCompleted, setIsCompleted] = useState(false)

  // Timer for elapsed seconds
  useEffect(() => {
    if (isPaused || isCompleted) return
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isPaused, isCompleted])

  // Deterministic stage progression
  useEffect(() => {
    if (isPaused || isCompleted) return

    const stagesList = NLP_STAGES.filter((s) => (s.id === 'policy_matching' && !hasPolicy ? false : true))

    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prevIdx) => {
        if (prevIdx >= stagesList.length - 1) {
          setIsCompleted(true)
          setOverallProgress(100)
          return prevIdx
        }

        const nextIdx = prevIdx + 1
        const completedStageId = stagesList[prevIdx].id
        const nextStageId = stagesList[nextIdx].id

        setStageStatuses((prev) => ({
          ...prev,
          [completedStageId]: 'COMPLETED',
          [nextStageId]: 'ACTIVE',
        }))

        // Auto-switch tabs to highlight active NLP stage
        if (nextStageId === 'pos_tagging') setActiveAnalysisTab('pos')
        else if (nextStageId === 'ner') setActiveAnalysisTab('entities')
        else if (nextStageId === 'dependency_analysis') setActiveAnalysisTab('dependencies')
        else if (nextStageId === 'tokenization') setActiveAnalysisTab('tokens')

        // Update overall percentage
        const progressPct = Math.min(100, Math.round(((nextIdx + 1) / stagesList.length) * 100))
        setOverallProgress(progressPct)

        return nextIdx
      })
    }, 9000) // Advances every 9 seconds for readable demonstration

    return () => clearInterval(stageInterval)
  }, [isPaused, isCompleted, hasPolicy])

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  const selectToken = (token) => {
    setSelectedToken(token)
  }

  return {
    currentStageIndex,
    stageStatuses,
    overallProgress,
    elapsedFormatted: formatTime(elapsedSeconds),
    estimatedFormatted: formatTime(estimatedSeconds),
    selectedToken,
    selectToken,
    activeAnalysisTab,
    setActiveAnalysisTab,
    clauseData: SAMPLE_CLAUSE_DATA,
    isPaused,
    setIsPaused,
    isCompleted,
  }
}
