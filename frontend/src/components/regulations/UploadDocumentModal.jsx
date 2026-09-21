import React, { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { uploadRegulationDocument } from '../../services/regulationsApi'

export default function UploadDocumentModal({
  isOpen = false,
  onClose,
  onUploadSuccess,
}) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [successResult, setSuccessResult] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile) => {
    setError(null)
    const validExtensions = ['.pdf', '.docx', '.txt']
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidExt) {
      setError('Please select a valid PDF, DOCX, or TXT regulatory document.')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('Document exceeds maximum file limit of 50MB.')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || uploading) return
    setUploading(true)
    setError(null)

    try {
      const response = await uploadRegulationDocument(file)
      setSuccessResult(response)
      if (onUploadSuccess) {
        onUploadSuccess(response)
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document. Please verify the backend service.')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setError(null)
    setSuccessResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#E0E8DE] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#EAEFE8] flex items-center justify-between bg-[#FAFBF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EDF4ED] text-[#132E22] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#112117]">
                Upload Regulatory Document
              </h3>
              <p className="text-[11px] text-[#718277]">
                Ingest official PDF or DOCX circulars for NLP segmentation and analysis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-[#718277] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {successResult ? (
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#112117]">
                  Document Successfully Ingested
                </h4>
                <p className="text-xs text-[#55675C] mt-1">
                  <span className="font-semibold text-[#112117]">{successResult.filename}</span> has been
                  indexed with Document ID{' '}
                  <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#DCFCE7] font-mono">
                    {successResult.document_id}
                  </code>
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] transition-colors"
                >
                  Done & View in Library
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 bg-white border border-[#E0E8DE] text-[#112117] text-xs font-medium rounded-lg hover:bg-[#F4F7F3] transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#132E22] bg-[#EEF6EC]'
                    : file
                    ? 'border-emerald-400 bg-[#F0FDF4]'
                    : 'border-[#CAD8C7] hover:border-[#132E22] bg-[#FAFBF9]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-semibold text-[#112117] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#718277]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#EDF4ED] text-[#132E22] flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-[#112117]">
                      Click to browse or drag and drop document
                    </p>
                    <p className="text-[11px] text-[#718277]">
                      Supported formats: PDF, DOCX, TXT (up to 50MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs text-[#991B1B] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!successResult && (
          <div className="p-4 border-t border-[#EAEFE8] bg-[#FAFBF9] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-3.5 py-2 bg-white border border-[#E0E8DE] text-[#55675C] hover:text-[#112117] hover:bg-[#F4F7F3] text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#132E22] text-[#FAFBF9] text-xs font-semibold rounded-lg hover:bg-[#1E4333] disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest Document</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
