import React from 'react'
import { AlertCircle, X, Square } from 'lucide-react'

export default function CancelAnalysisModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B150F]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAFBF9] border border-[#DCE4DA] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FDF2F2] border border-[#FCDADA] flex items-center justify-center text-[#C93B3B] flex-shrink-0">
            <Square className="w-4 h-4 fill-current" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#112117]">
              Cancel Analysis?
            </h3>
            <p className="text-xs text-[#55675C] mt-1 leading-relaxed">
              Are you sure you want to cancel the current regulatory NLP processing? All in-progress clause classifications and semantic alignments for this session will be stopped.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#EAEFE8]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#485B50] hover:text-[#112117] hover:bg-[#EEF3EC] rounded-lg transition-colors cursor-pointer"
          >
            Continue Processing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold bg-[#C93B3B] hover:bg-[#B32D2D] text-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
