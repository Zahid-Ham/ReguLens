import React from 'react'

export default function EntityTable({ entities = [] }) {
  const getEntityBadge = (type) => {
    const clean = (type || '').toUpperCase()
    switch (clean) {
      case 'CUSTOMER_TYPE':
        return 'bg-[#EBF3FC] text-[#2563EB] border-[#BFDBFE]'
      case 'DURATION':
        return 'bg-[#EDF8F1] text-[#16A34A] border-[#BBF7D0]'
      case 'DEADLINE':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
      case 'REGULATORY_CONCEPT':
        return 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]'
      case 'REGULATOR':
        return 'bg-[#EBF4EC] text-[#132E22] border-[#C2DEC6]'
      case 'REGULATED_ENTITY':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]'
      case 'MONETARY_VALUE':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
      case 'THRESHOLD':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]'
      case 'ACT':
      case 'REGULATORY_INSTRUMENT':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
    }
  }

  return (
    <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Step Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-5 h-5 rounded-full bg-[#132E22] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
          4
        </div>
        <div>
          <h3 className="text-[14.5px] font-bold text-[#112117]">
            Named Entities
          </h3>
          <p className="text-[11.5px] text-[#55675C]">
            Identified regulatory entities and key information.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto max-h-[220px] overflow-y-auto border border-[#F0F4EE] rounded-xl">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[#E2EAE0] text-[10.5px] uppercase tracking-wider text-[#6C7E72] bg-[#FAFBF9] sticky top-0 z-10">
              <th className="py-2 px-3 font-semibold w-1/3">Entity Text</th>
              <th className="py-2 px-3 font-semibold w-1/3">Entity Type</th>
              <th className="py-2 px-3 font-semibold w-1/3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4EE]">
            {entities.map((ent, idx) => (
              <tr key={idx} className="hover:bg-[#FAFBF9] transition-colors">
                <td className="py-2 px-3 font-bold text-[#112117]">
                  {ent.text}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wider border ${getEntityBadge(
                      ent.type
                    )}`}
                  >
                    {ent.type}
                  </span>
                </td>
                <td className="py-2 px-3 text-[#4A5D51] text-[11.5px]">
                  {ent.description || 'Domain Entity'}
                </td>
              </tr>
            ))}

            {entities.length === 0 && (
              <tr>
                <td colSpan="3" className="py-6 text-center text-[#86978C] text-[12px]">
                  No domain entities recognized in this clause.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-[#F0F4EE] flex items-center justify-between text-[11px] text-[#55675C]">
        <span>{entities.length} entities extracted</span>
        <span className="font-medium text-[#1E4333]">ReguLens 10-Class Domain NER</span>
      </div>
    </div>
  )
}
