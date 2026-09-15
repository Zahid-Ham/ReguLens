import React, { useState, useEffect } from 'react'
import { X, Search, BookOpen, FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { getRegulations } from '../../services/api'

export default function DocumentLibraryModal({ isOpen, onClose, onSelect, targetRole = 'regulation' }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch real regulations from backend API
  const fetchDocs = async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const response = await getRegulations({ search: query || undefined, limit: 100 })
      if (response && Array.isArray(response.documents)) {
        const mapped = response.documents.map((doc) => ({
          id: doc.document_id,
          name: doc.title,
          title: doc.filename,
          version: doc.document_type || 'Master Directions',
          regulator: 'Reserve Bank of India',
          description: doc.title_candidate || doc.title,
          size: doc.file_size_bytes
            ? `${(doc.file_size_bytes / 1024).toFixed(0)} KB`
            : `${doc.total_words || 0} words`,
          clausesCount: doc.clause_count || 0,
          wordsCount: doc.total_words || 0,
          notificationNumbers: doc.notification_numbers,
          datesFound: doc.dates_found,
          isVerified: doc.is_verified_baseline,
          raw: doc,
        }))
        setDocuments(mapped)
      } else {
        setDocuments([])
      }
    } catch (err) {
      setError(err.message || 'Unable to load regulatory documents from library.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchDocs(searchQuery)
    }
  }, [isOpen])

  // Debounced search on user input
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      fetchDocs(searchQuery)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen) return null

  const handleConfirm = () => {
    const doc = documents.find((d) => d.id === selectedId)
    if (doc) {
      onSelect(doc)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B150F]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAFBF9] border border-[#DCE4DA] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#EAEFE8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EDF4ED] flex items-center justify-center text-[#132E22]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#112117]">
                Select from Regulations Library
              </h3>
              <p className="text-[12px] text-[#55675C]">
                Choose indexed regulatory documents from FastAPI repository
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#617468] hover:bg-[#EEF3EC] hover:text-[#112117] transition-colors focus:outline-none"
            aria-label="Close library modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-[#EAEFE8] bg-[#FAFBF9]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6A7D71] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library by document title, regulator, or circular reference..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#DCE4DA] rounded-lg text-[#112117] placeholder-[#76877D] focus:outline-none focus:ring-1 focus:ring-[#132E22] focus:border-[#132E22]"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FAFBF9]">
          {loading && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#55675C]">
              <Loader2 className="w-6 h-6 animate-spin text-[#2C634D] mb-2" />
              <span className="text-xs font-medium">Loading documents from ReguLens repository...</span>
            </div>
          ) : error ? (
            <div className="p-5 bg-[#FDF2F2] border border-[#F8DADA] rounded-xl flex flex-col items-center text-center">
              <AlertCircle className="w-6 h-6 text-[#C93B3B] mb-2" />
              <p className="text-xs font-semibold text-[#991B1B] mb-1">{error}</p>
              <button
                type="button"
                onClick={() => fetchDocs(searchQuery)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E0B8B8] text-xs font-medium text-[#7A1D1D] rounded-lg hover:bg-[#FDF6F6] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#617468]">
              No documents found matching "{searchQuery}"
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = selectedId === doc.id

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#EBF5EE] border-[#132E22] ring-1 ring-[#132E22]'
                      : 'bg-white border-[#E0E8DE] hover:border-[#CAD8C9] hover:bg-[#F9FCF9]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FDF2F2] border border-[#F8DADA] flex items-center justify-center flex-shrink-0 text-[#C93B3B] mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13.5px] font-semibold text-[#112117] leading-tight">
                          {doc.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-[#EDF3EC] text-[#2C634D]">
                          {doc.version}
                        </span>
                        {doc.isVerified && (
                          <span className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-[#EBF5EE] text-[#132E22] border border-[#CDE5D5]">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#55675C] mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#718377] mt-2 font-medium">
                        <span>{doc.regulator}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.clausesCount} Structured Clauses</span>
                      </div>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#132E22] bg-[#132E22]'
                          : 'border-[#CBD8CB] bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#EAEFE8] flex items-center justify-between">
          <span className="text-[12px] text-[#5F7165]">
            {documents.length} documents indexed in repository
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#485B50] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedId}
              onClick={handleConfirm}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedId
                  ? 'bg-[#132E22] text-[#FAFBF9] hover:bg-[#1E4333] shadow-xs cursor-pointer'
                  : 'bg-[#E3ECE2] text-[#86998C] cursor-not-allowed'
              }`}
            >
              Select Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
