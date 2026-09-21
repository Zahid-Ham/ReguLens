import React from 'react'
import DependencyGraph from '../DependencyGraph'
import { GitFork } from 'lucide-react'

export default function DependencyDetailView({ clauseDetail = null }) {
  if (!clauseDetail) return null

  const dependencies = clauseDetail.dependencies || []

  return (
    <div className="space-y-5">
      {/* Full Width Visual Graph */}
      <DependencyGraph dependencies={dependencies} isExpanded={true} />

      {/* Dependency Relations Table */}
      <div className="bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3.5">
          <GitFork className="w-4 h-4 text-[#1E4333]" />
          <h3 className="text-[14.5px] font-bold text-[#112117]">
            Syntactic Dependency Relations
          </h3>
        </div>

        <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-[#E2EAE0] text-[11px] uppercase tracking-wider text-[#6C7E72] bg-[#FAFBF9] sticky top-0">
                <th className="py-2 px-3 font-semibold w-12">#</th>
                <th className="py-2 px-3 font-semibold">Token</th>
                <th className="py-2 px-3 font-semibold">POS</th>
                <th className="py-2 px-3 font-semibold">Dependency</th>
                <th className="py-2 px-3 font-semibold">Head Word</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4EE]">
              {dependencies.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-2 px-3 text-[#86978C] font-mono text-[11px]">{d.id + 1}</td>
                  <td className="py-2 px-3 font-bold text-[#112117]">{d.text}</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-[11.5px]">{d.pos}</td>
                  <td className="py-2 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                      {d.dep}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#132E22] font-semibold">{d.head_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
