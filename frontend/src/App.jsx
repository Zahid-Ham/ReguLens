import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import NewAnalysis from './pages/NewAnalysis'
import AppShell from './layouts/AppShell'
import AnalysisProcessing from './pages/AnalysisProcessing'
import AnalysisResults from './pages/AnalysisResults'
import AnalysisHistory from './pages/AnalysisHistory'
import ClauseDetailView from './pages/ClauseDetailView'
import { Sparkles, Clock, BookOpen, Lightbulb, Network, Files, Settings, HelpCircle } from 'lucide-react'

// Placeholder view component for future screens
function PlaceholderScreen({ title, description, icon: Icon }) {
  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-[#EDF4ED] text-[#132E22] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-semibold text-[#112117] mb-2">{title}</h2>
      <p className="text-sm text-[#55675C] mb-6 leading-relaxed">{description}</p>
      <a
        href="/analysis/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors"
      >
        Go to New Analysis
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated / Application Shell Routes */}
        <Route
          path="/analysis/new"
          element={
            <AppShell>
              <NewAnalysis />
            </AppShell>
          }
        />

        <Route
          path="/analysis/processing"
          element={
            <AppShell>
              <AnalysisProcessing />
            </AppShell>
          }
        />

        <Route
          path="/analysis/results"
          element={
            <AppShell>
              <AnalysisResults />
            </AppShell>
          }
        />

        <Route
          path="/analysis/clause/:id"
          element={
            <AppShell>
              <ClauseDetailView />
            </AppShell>
          }
        />

        <Route
          path="/analysis/clause"
          element={
            <Navigate to="/analysis/clause/psl-rec-001" replace />
          }
        />

        <Route
          path="/analysis/history"
          element={
            <AppShell>
              <AnalysisHistory />
            </AppShell>
          }
        />

        <Route
          path="/analyses"
          element={
            <Navigate to="/analysis/history" replace />
          }
        />

        <Route
          path="/regulations"
          element={
            <AppShell>
              <PlaceholderScreen
                title="Regulations Library"
                description="Browse, filter, and inspect pre-processed RBI Master Directions, circulars, and regulatory datasets."
                icon={BookOpen}
              />
            </AppShell>
          }
        />

        <Route
          path="/insights"
          element={
            <AppShell>
              <PlaceholderScreen
                title="Regulatory Insights"
                description="Domain-specific intelligence across PSL, Digital Lending, KYC, and prudential banking norms."
                icon={Lightbulb}
              />
            </AppShell>
          }
        />

        <Route
          path="/nlp-explorer"
          element={
            <AppShell>
              <PlaceholderScreen
                title="NLP Explorer & Clause Classifier"
                description="Interactive clause-level breakdown, token attribution, lemmatization inspection, and POS tagging."
                icon={Network}
              />
            </AppShell>
          }
        />

        <Route
          path="/documents"
          element={
            <AppShell>
              <PlaceholderScreen
                title="My Documents"
                description="Manage uploaded regulatory PDFs, internal organizational policies, and custom clause annotations."
                icon={Files}
              />
            </AppShell>
          }
        />

        <Route
          path="/settings"
          element={
            <AppShell>
              <PlaceholderScreen
                title="Application Settings"
                description="Configure NLP model thresholds, Sentence-BERT embedding models, and export preferences."
                icon={Settings}
              />
            </AppShell>
          }
        />

        <Route
          path="/help"
          element={
            <AppShell>
              <PlaceholderScreen
                title="Help & Academic Documentation"
                description="Architecture documentation, methodology paper, and evaluation benchmarks for ReguLens."
                icon={HelpCircle}
              />
            </AppShell>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
