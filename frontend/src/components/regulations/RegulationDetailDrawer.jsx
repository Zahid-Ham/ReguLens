import React, { useState } from 'react'
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Play,
  Network,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react'

export default function RegulationDetailDrawer({
  doc,
  isOpen = false,
  onClose,
  onViewDoc,
  onDownloadDoc,
  onUseInNewAnalysis,
  onCompareWithRelated,
  onInspectInNLP,
}) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'sections' | 'related'

  if (!isOpen || !doc) return null

  const sections = doc.sections || []
  const relatedDocs = doc.related_documents || []
  const procStatus = doc.processing_status || {
    status: 'Processed',
    stages: [
      { name: 'Document Ingestion', status: 'completed', timestamp: 'Indexed' },
      { name: 'Text Extraction', status: 'completed', timestamp: 'Indexed' },
      { name: 'Clause Segmentation', status: 'completed', timestamp: 'Indexed' },
      { name: 'NLP Processing', status: 'completed', timestamp: 'Indexed' },
      { name: 'Ready for Analysis', status: 'completed', timestamp: 'Indexed' },
    ],
  }

  const isPdf = (doc.filename || '').toLowerCase().endsWith('.pdf')

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-[#E0E8DE] flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#EAEFE8] flex items-start justify-between gap-3 bg-[#FAFBF9]">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs ${
              isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-sky-50 text-sky-600 border border-sky-200'
            }`}
          >
            {isPdf ? 'PDF' : 'DOC'}
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-[#112117] leading-snug line-clamp-2">
              {doc.title || doc.filename}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#718277]">
                {isPdf ? 'PDF Document' : 'Document'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                {doc.status || 'Processed'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#718277] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors flex-shrink-0"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description / Summary Banner */}
      <div className="px-5 py-3.5 bg-white border-b border-[#F0F4EF] text-xs text-[#48594F] leading-relaxed">
        {doc.description ||
          doc.title_candidate ||
          `Official regulatory document issued by ${doc.regulator || 'RBI'}. Verified and indexed for NLP compliance analysis.`}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center px-5 border-b border-[#EAEFE8] bg-white gap-6 text-xs font-semibold text-[#718277]">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-[#132E22] text-[#132E22]'
              : 'border-transparent hover:text-[#112117]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'sections'
              ? 'border-[#132E22] text-[#132E22]'
              : 'border-transparent hover:text-[#112117]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chapters ({sections.length || '—'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('related')}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'related'
              ? 'border-[#132E22] text-[#132E22]'
              : 'border-transparent hover:text-[#112117]'
          }`}
        >
          <span>Related Documents ({relatedDocs.length || '—'})</span>
        </button>
      </div>

      {/* Drawer Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Document Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#112117] uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#132E22]" />
                <span>Document Information</span>
              </div>

              <div className="bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl p-3.5 divide-y divide-[#EAEFE8] text-xs">
                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Document Name</span>
                  <span className="text-[#112117] font-semibold text-right">{doc.title || doc.filename}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Regulator</span>
                  <span className="text-[#112117] font-medium text-right">{doc.regulator || 'Reserve Bank of India (RBI)'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Document Type</span>
                  <span className="text-[#112117] font-medium text-right">{doc.document_type || 'Master Direction'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Category</span>
                  <span className="text-[#112117] font-medium text-right">{doc.category || 'Not available'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Version / Year</span>
                  <span className="text-[#112117] font-medium text-right font-mono">{doc.version_year || 'Not available'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Effective Date</span>
                  <span className="text-[#112117] font-medium text-right">{doc.effective_date || 'Not available'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Total Pages</span>
                  <span className="text-[#112117] font-medium text-right">{doc.total_pages ?? 'Not available'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Language</span>
                  <span className="text-[#112117] font-medium text-right">{doc.language || 'English'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Source</span>
                  <span className="text-[#112117] font-medium text-right">{doc.source || 'RBI Official Website'}</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Clause Count</span>
                  <span className="text-[#112117] font-semibold text-right font-mono">{doc.clause_count} clauses</span>
                </div>

                <div className="py-2 flex justify-between gap-4">
                  <span className="text-[#718277] font-medium">Total Words</span>
                  <span className="text-[#112117] font-semibold text-right font-mono">{doc.total_words?.toLocaleString()} words</span>
                </div>
              </div>
            </div>

            {/* Processing Status Stepper */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#112117] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Processing Status</span>
              </div>

              <div className="bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl p-4 space-y-3">
                {(procStatus.stages || []).map((stage, idx) => (
                  <div key={stage.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-[#112117]">{stage.name}</span>
                    </div>
                    <span className="text-[11px] text-[#718277] font-mono">{stage.timestamp || 'Completed'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#112117] uppercase tracking-wider">
                Parsed Sections & Chapters
              </span>
              <button
                type="button"
                onClick={() => onInspectInNLP(doc)}
                className="text-xs text-[#132E22] hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>NLP Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#718277] bg-[#FAFBF9] rounded-xl border border-[#EAEFE8]">
                No explicit chapter headings indexed for this document. The full document is segmented at clause level.
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.section_id + idx}
                    className="bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl p-3.5 hover:border-[#CAD8C7] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block text-[11px] font-bold text-[#132E22] bg-[#E2ECE0] px-2 py-0.5 rounded">
                          {sec.section_id}
                        </span>
                        <h4 className="text-xs font-semibold text-[#112117] mt-1.5">{sec.title}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#55675C] bg-white border border-[#E0E8DE] px-2 py-0.5 rounded whitespace-nowrap">
                        {sec.clause_count} clauses
                      </span>
                    </div>

                    {sec.provisions && sec.provisions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {sec.provisions.slice(0, 5).map((p) => (
                          <span
                            key={p}
                            className="text-[10px] bg-white border border-[#E0E8DE] text-[#55675C] px-1.5 py-0.5 rounded font-mono"
                          >
                            Prov. {p}
                          </span>
                        ))}
                        {sec.provisions.length > 5 && (
                          <span className="text-[10px] text-[#718277] self-center">
                            +{sec.provisions.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'related' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#112117] uppercase tracking-wider">
              Discovered Relationships
            </span>

            {relatedDocs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#718277] bg-[#FAFBF9] rounded-xl border border-[#EAEFE8]">
                No explicit version relationships found for this regulation.
              </div>
            ) : (
              <div className="space-y-2.5">
                {relatedDocs.map((rel) => (
                  <div
                    key={rel.document_id}
                    className="bg-[#FAFBF9] border border-[#EAEFE8] rounded-xl p-3.5 hover:border-[#CAD8C7] transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]">
                        {rel.relation_type}
                      </span>
                      <span className="text-xs font-mono text-[#718277]">{rel.year || '—'}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#112117] leading-snug line-clamp-2">
                      {rel.title}
                    </h4>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#EAEFE8]">
                      <span className="text-[11px] text-[#55675C] font-mono">{rel.document_id}</span>
                      {onCompareWithRelated && (
                        <button
                          type="button"
                          onClick={() => onCompareWithRelated(doc, rel)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E22] hover:underline"
                        >
                          <span>Compare in New Analysis</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-[#EAEFE8] bg-[#FAFBF9] flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onViewDoc(doc)}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View in Document</span>
        </button>

        <button
          type="button"
          onClick={() => onDownloadDoc(doc)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-[#E0E8DE] text-[#112117] text-xs font-medium rounded-lg hover:bg-[#F4F7F3] transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#55675C]" />
          <span>Download</span>
        </button>

        <button
          type="button"
          onClick={() => onUseInNewAnalysis(doc)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#EDF4ED] text-[#132E22] text-xs font-semibold rounded-lg hover:bg-[#DEEADD] transition-colors border border-[#D3E2D1]"
        >
          <Play className="w-3.5 h-3.5 text-[#132E22]" />
          <span>Use in New Analysis</span>
        </button>
      </div>
    </div>
  )
}
