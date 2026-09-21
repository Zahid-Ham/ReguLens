import React from 'react'

export default function TokenTable({ tokens = [] }) {
  const getPOSBadge = (pos) => {
    const clean = (pos || '').toUpperCase()
    switch (clean) {
      case 'ADJ':
        return 'bg-[#EBF3FC] text-[#2563EB] border-[#BFDBFE]'
      case 'NOUN':
      case 'PROPN':
        return 'bg-[#EDF8F1] text-[#16A34A] border-[#BBF7D0]'
      case 'AUX':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
      case 'VERB':
        return 'bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]'
      case 'ADP':
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
      case 'ADV':
        return 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]'
      case 'DET':
        return 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]'
      case 'NUM':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
      case 'PART':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]'
      case 'CCONJ':
      case 'SCONJ':
        return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
      case 'PUNCT':
        return 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]'
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
    }
  }

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Step Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-5 h-5 rounded-full bg-[#132E22] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
          2
        </div>
        <div>
          <h3 className="text-[14.5px] font-bold text-[#112117]">
            Tokenization & Lemmatization
          </h3>
          <p className="text-[11.5px] text-[#55675C]">
            View how the text is broken into tokens and normalized.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto max-h-[480px] overflow-y-auto border border-[#F0F4EE] rounded-xl">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#E2EAE0] text-[10.5px] uppercase tracking-wider text-[#6C7E72] bg-[#FAFBF9] sticky top-0 z-10">
              <th className="py-2 px-2 text-center font-semibold w-8">#</th>
              <th className="py-2 px-2.5 font-semibold">Token</th>
              <th className="py-2 px-2.5 font-semibold">Lemma</th>
              <th className="py-2 px-2.5 font-semibold text-right">POS Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4EE]">
            {tokens.map((t) => (
              <tr key={t.index} className="hover:bg-[#FAFBF9] transition-colors">
                <td className="py-1.5 px-2 text-[#86978C] font-mono text-[11px] text-center">
                  {t.index}
                </td>
                <td className="py-1.5 px-2.5 font-semibold text-[#112117]">
                  {t.token}
                </td>
                <td className="py-1.5 px-2.5 text-[#4A5D51] font-mono text-[11.5px]">
                  {t.lemma}
                </td>
                <td className="py-1.5 px-2.5 text-right">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wider border ${getPOSBadge(
                      t.pos_tag
                    )}`}
                  >
                    {t.pos_tag}
                  </span>
                </td>
              </tr>
            ))}

            {tokens.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-[#86978C] text-[12px]">
                  No token annotations available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-[#F0F4EE] flex items-center justify-between text-[11px] text-[#55675C]">
        <span>{tokens.length} tokens generated</span>
        <span className="font-medium text-[#1E4333]">spaCy Core Model</span>
      </div>
    </div>
  )
}
