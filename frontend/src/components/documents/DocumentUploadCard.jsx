import React, { useState, useRef } from 'react'
import { FileText, Upload, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import SelectedDocument from './SelectedDocument'
import { uploadDocument } from '../../services/api'

export default function DocumentUploadCard({
  title,
  subtitle,
  document,
  onSelectDocument,
  onRemoveDocument,
  onOpenLibrary,
  required = true,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingFilename, setUploadingFilename] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const fileInputRef = useRef(null)

  const processFile = async (file) => {
    setErrorMessage(null)
    if (!file) return

    // Validate extension
    const extension = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(extension)) {
      setErrorMessage('Unsupported file format. Please upload a PDF or DOCX regulatory file.')
      return
    }

    // Validate size (max 25MB)
    const maxSizeBytes = 25 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setErrorMessage('File size exceeds the 25 MB limit for single document parsing.')
      return
    }

    setIsUploading(true)
    setUploadingFilename(file.name)

    try {
      const result = await uploadDocument(file)

      const formattedSize =
        result.file_size > 1024 * 1024
          ? `${(result.file_size / (1024 * 1024)).toFixed(1)} MB`
          : `${(result.file_size / 1024).toFixed(0)} KB`

      const docObj = {
        id: result.document_id,
        document_id: result.document_id,
        filename: result.filename || file.name,
        title: result.filename || file.name,
        name: result.title || result.filename || file.name,
        size: formattedSize,
        sizeBytes: result.file_size,
        type: result.file_type || extension.toUpperCase(),
        regulator: 'Uploaded Document',
        version: 'Uploaded Version',
        source: 'uploaded',
        pageCount: result.page_count,
        wordCount: result.word_count,
        characterCount: result.character_count,
        extractedText: result.extracted_text,
      }

      onSelectDocument(docObj)
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to upload and ingest document to backend server.'
      )
      if (onRemoveDocument) onRemoveDocument()
    } finally {

      setIsUploading(false)
      setUploadingFilename(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }


  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-all hover:border-[#CAD8C9]">
      {/* Hidden File Input for Accessible Native Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
        id={`file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
      />

      {/* Top Header Row */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-6 h-6 rounded-md bg-[#EDF4ED] text-[#132E22] flex items-center justify-center flex-shrink-0">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-[14.5px] font-semibold text-[#112117] tracking-tight">
          {title}
        </h4>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-3.5 p-2.5 bg-[#FEF2F2] border border-[#FAD0D0] rounded-lg flex items-center gap-2 text-[12px] text-[#B91C1C]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone / Dropzone */}
      <div
        onDragOver={isUploading ? undefined : handleDragOver}
        onDragLeave={isUploading ? undefined : handleDragLeave}
        onDrop={isUploading ? undefined : handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-7 flex flex-col items-center justify-center text-center transition-all ${
          isDragging
            ? 'border-[#132E22] bg-[#EBF5EE]'
            : 'border-[#D9E3D8] bg-[#FAFBF9]/80 hover:bg-[#F4F8F4] hover:border-[#CAD8C9]'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-3">
            <div className="w-11 h-11 rounded-full bg-[#EDF4ED] text-[#132E22] flex items-center justify-center mb-3 shadow-2xs">
              <Loader2 className="w-5 h-5 text-[#132E22] animate-spin" />
            </div>
            <span className="text-[13.5px] font-semibold text-[#112117]">
              Ingesting & Extracting Text...
            </span>
            <span className="text-[11.5px] text-[#6A7D71] mt-0.5 max-w-[220px] truncate">
              {uploadingFilename || 'Uploading document...'}
            </span>
          </div>
        ) : (
          <>
            {/* Upload Button / Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 rounded-full bg-[#EDF4ED] group-hover:bg-[#DEECE0] text-[#132E22] flex items-center justify-center mb-3 transition-colors shadow-2xs">
                <Upload className="w-5 h-5 text-[#132E22] group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <span className="text-[13.5px] font-semibold text-[#112117] group-hover:text-[#1E4333]">
                Upload PDF / DOCX
              </span>
              <span className="text-[11.5px] text-[#6A7D71] mt-0.5">
                or drag and drop your file here
              </span>
            </button>

            {/* Subtle "OR" Divider */}
            <div className="flex items-center gap-3 w-full max-w-[200px] my-3.5">
              <div className="flex-1 h-px bg-[#E2EAE0]" />
              <span className="text-[10px] font-bold text-[#839589] uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 h-px bg-[#E2EAE0]" />
            </div>

            {/* Library Button */}
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex items-center gap-2 px-4 py-2 text-[12.5px] font-semibold text-[#132E22] bg-white hover:bg-[#FAFBF9] border border-[#CBD8CB] rounded-lg transition-all shadow-2xs hover:border-[#132E22] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2C634D]" />
              Select from Library
            </button>
          </>
        )}
      </div>


      {/* Selected Document Row */}
      {document ? (
        <SelectedDocument
          document={document}
          onRemove={onRemoveDocument}
          label={title}
        />
      ) : (
        <div className="mt-3 px-3 py-2 bg-[#F6F8F5] rounded-lg border border-[#E9EFE8] text-[11.5px] text-[#7A8B80] flex items-center justify-between">
          <span>No document selected</span>
          <span className="text-[10.5px] font-medium text-[#8F9E94]">
            {required ? 'Required for comparison' : 'Optional'}
          </span>
        </div>
      )}
    </div>
  )
}
