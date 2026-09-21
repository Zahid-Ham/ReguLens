import React from 'react'
import { Network, FilePlus2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NLPEmptyState() {
  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-10 sm:p-14 text-center max-w-xl mx-auto my-12 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#EDF4ED] text-[#132E22] flex items-center justify-center mx-auto mb-4">
        <Network className="w-7 h-7 text-[#1E4333]" />
      </div>
      <h2 className="text-xl font-serif font-bold text-[#112117] mb-2">
        No NLP artifacts available.
      </h2>
      <p className="text-[13px] text-[#55675C] mb-6 leading-relaxed">
        Select a valid regulatory document from the catalog or upload a new regulation to inspect its NLP processing pipeline.
      </p>
      <Link
        to="/analysis/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#132E22] hover:bg-[#1E4333] text-white text-[12.5px] font-semibold rounded-xl transition-colors shadow-xs"
      >
        <FilePlus2 className="w-4 h-4" />
        <span>Analyze New Document</span>
      </Link>
    </div>
  )
}
