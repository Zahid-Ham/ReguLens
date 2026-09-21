import React from 'react'
import { X, FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react'
import { getRegulationDownloadUrl } from '../../services/regulationsApi'

export default function DocumentViewerModal({
  doc,
  isOpen = false,
  onClose,
  onDownload,
}) {
  if (!isOpen || !doc) return null

  const isPdf = (doc.filename || '').toLowerCase().endsWith('.pdf')
  const downloadUrl = getRegulationDownloadUrl(doc.document_id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#E0E8DE] rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAEFE8] flex items-center justify-between bg-[#FAFBF9]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-sky-50 text-sky-600 border border-sky-200'
              }`}
            >
              {isPdf ? 'PDF' : 'DOC'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#112117] truncate">
                {doc.title || doc.filename}
              </h3>
              <p className="text-[11px] text-[#718277]">
                Document ID: <code className="font-mono">{doc.document_id}</code> • {doc.clause_count} clauses • {doc.total_words?.toLocaleString()} words
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownload(doc)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E0E8DE] text-xs font-medium text-[#112117] rounded-lg hover:bg-[#F4F7F3] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#55675C]" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#718277] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#FAFBF9]">
          {/* Metadata Card */}
          <div className="bg-white border border-[#EAEFE8] rounded-xl p-4 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#718277] block text-[11px]">Authority</span>
              <span className="font-semibold text-[#112117]">{doc.regulator_code || 'RBI'}</span>
            </div>
            <div>
              <span className="text-[#718277] block text-[11px]">Version Year</span>
              <span className="font-semibold text-[#112117] font-mono">{doc.version_year || '—'}</span>
            </div>
            <div>
              <span className="text-[#718277] block text-[11px]">Effective Date</span>
              <span className="font-semibold text-[#112117]">{doc.effective_date || '—'}</span>
            </div>
            <div>
              <span className="text-[#718277] block text-[11px]">Verification</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Indexed & Verified</span>
              </span>
            </div>
          </div>

          {/* Description & Extracted Text Summary */}
          <div className="bg-white border border-[#EAEFE8] rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#112117] uppercase tracking-wider">
              Document Excerpt & Metadata Summary
            </h4>
            <div className="text-xs text-[#2A3B31] leading-relaxed whitespace-pre-line font-sans bg-[#F9FBFA] p-4 rounded-lg border border-[#EAEFE8]">
              {doc.description || doc.title_candidate || 'Full text extraction and clause segmentation completed.'}
            </div>

            {doc.notification_numbers && (
              <div className="text-xs text-[#55675C]">
                <strong className="text-[#112117]">Notification Reference:</strong>{' '}
                <span className="font-mono">{doc.notification_numbers}</span>
              </div>
            )}

            {doc.source_page_url && (
              <div className="pt-2">
                <a
                  href={doc.source_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#132E22] hover:underline font-medium"
                >
                  <span>View on official regulatory portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAEFE8] bg-white flex items-center justify-between">
          <span className="text-xs text-[#718277]">
            Protected statutory record • ReguLens Regulatory Vault
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
