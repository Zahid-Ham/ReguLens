import React from 'react'
import { Tag, Sparkles, Network } from 'lucide-react'

export default function NLPAnalysisPanel({
  activeTab = 'tokens',
  onTabChange,
  tokens = [],
  selectedToken,
  onSelectToken,
  entities = [],
  dependencies = [],
  clauseClassification,
}) {
  const tabs = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'pos', label: 'POS Tags' },
    { id: 'entities', label: 'Entities' },
    { id: 'dependencies', label: 'Dependencies' },
  ]

  return (
    <div className="bg-white border border-[#E0E8DE] rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
      {/* Panel Header + Interactive Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#EAEFE8]">
        <h4 className="text-[13.5px] font-semibold text-[#112117] tracking-tight">
          NLP Analysis
        </h4>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F2F6F1] rounded-xl border border-[#E1EBE0]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#132E22] text-[#FAFBF9] shadow-2xs'
                    : 'text-[#4F6255] hover:text-[#112117] hover:bg-[#E7EFE6]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TOKENS VIEW */}
      {/* ======================================================== */}
      {activeTab === 'tokens' && (
        <div className="space-y-4 transition-opacity duration-150">
          {tokens.length === 0 ? (
            <div className="p-6 bg-[#FAFBF9] rounded-xl border border-[#E4ECE2] text-center text-xs text-[#63756A]">
              Waiting for Tokenization stage...
            </div>
          ) : (
            <>
              {/* Token Chips */}
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-[#FAFBF9] rounded-xl border border-[#E4ECE2]">
                {tokens.slice(0, 20).map((tok, idx) => {
                  const isSelected = selectedToken && selectedToken.text === tok.text

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectToken(tok)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#132E22] text-white border-[#132E22] shadow-2xs'
                          : tok.isHighlighted
                          ? 'bg-[#D4EBD7] text-[#0E291C] font-semibold border-[#A4D4AB]'
                          : 'bg-white text-[#25362B] border-[#D9E3D8] hover:border-[#CAD8C9] hover:bg-[#F6FAF5]'
                      }`}
                    >
                      {tok.text}
                    </button>
                  )
                })}
                {tokens.length > 20 && (
                  <span className="px-2 py-1 text-xs text-[#8A9C90] font-mono select-none">
                    ...
                  </span>
                )}
              </div>

              {/* Token Details Table */}
              <div className="space-y-2">
                <h5 className="text-[12px] font-bold text-[#55675C] uppercase tracking-wider">
                  Token Details
                </h5>
                <div className="overflow-x-auto rounded-xl border border-[#E0E8DE]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F8F5] border-b border-[#E0E8DE] text-[#55675C] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3.5">Token</th>
                        <th className="py-2.5 px-3.5">Lemma</th>
                        <th className="py-2.5 px-3.5">POS Tag</th>
                        <th className="py-2.5 px-3.5">Entity Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFE8] bg-white font-medium text-[#112117]">
                      <tr>
                        <td className="py-2.5 px-3.5 font-mono text-[#132E22] font-semibold">
                          {selectedToken?.text || tokens[0]?.text || '—'}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[#4A5D51]">
                          {selectedToken?.lemma || tokens[0]?.lemma || selectedToken?.text || '—'}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#EDF4ED] text-[#1E4333] font-mono text-[11px] font-semibold">
                            {selectedToken?.pos || tokens[0]?.pos || 'TOKEN'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          {selectedToken?.entity || tokens[0]?.entity ? (
                            <span className="px-2 py-0.5 rounded bg-[#EBF3FE] text-[#1D4ED8] font-semibold text-[10.5px] border border-[#D5E4FA]">
                              {selectedToken?.entity || tokens[0]?.entity}
                            </span>
                          ) : (
                            <span className="text-[#8D9E92] text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: POS TAGS VIEW */}
      {/* ======================================================== */}
      {activeTab === 'pos' && (
        <div className="space-y-3 transition-opacity duration-150">
          <p className="text-xs text-[#55675C]">
            Part-of-Speech morphological tagging:
          </p>
          {tokens.length === 0 ? (
            <div className="p-6 bg-[#FAFBF9] rounded-xl border border-[#E4ECE2] text-center text-xs text-[#63756A]">
              Waiting for POS Tagging stage...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tokens.slice(0, 15).map((tok, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-[#FAFBF9] rounded-lg border border-[#E2EBE0] flex items-center justify-between"
                >
                  <span className="font-mono text-xs font-semibold text-[#112117] truncate mr-2">
                    {tok.text}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#EDF4ED] text-[#132E22] font-mono text-[10.5px] font-bold flex-shrink-0">
                    {tok.pos || 'NOUN'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DOMAIN ENTITIES VIEW */}
      {/* ======================================================== */}
      {activeTab === 'entities' && (
        <div className="space-y-3 transition-opacity duration-150">
          <p className="text-xs text-[#55675C]">
            Domain Named Entity Recognition (NER):
          </p>
          {entities.length === 0 ? (
            <div className="p-6 bg-[#FAFBF9] rounded-xl border border-[#E4ECE2] text-center text-xs text-[#63756A]">
              No domain entities detected in this clause.
            </div>
          ) : (
            <div className="space-y-2">
              {entities.map((ent, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FAFBF9] rounded-xl border border-[#E2EBE0] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-[#112117] truncate">
                      {ent.text}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#EBF3FE] text-[#1D4ED8] font-semibold text-[10.5px] border border-[#D5E4FA] flex-shrink-0">
                    {ent.type || ent.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DEPENDENCIES VIEW */}
      {/* ======================================================== */}
      {activeTab === 'dependencies' && (
        <div className="space-y-3 transition-opacity duration-150">
          <p className="text-xs text-[#55675C]">
            Syntactic dependency relationships:
          </p>
          {dependencies.length === 0 ? (
            <div className="p-6 bg-[#FAFBF9] rounded-xl border border-[#E4ECE2] text-center text-xs text-[#63756A]">
              No dependency relationships extracted for this clause.
            </div>
          ) : (
            <div className="space-y-2">
              {dependencies.map((dep, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FAFBF9] rounded-xl border border-[#E2EBE0] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#112117]">
                      {dep.subject || dep.head || 'Clause'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#F0F5EF] text-[#2C634D] font-mono text-[10.5px] font-semibold border border-[#D8E6D7]">
                      {dep.relation || dep.dep || 'dep'}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[#55675C]">
                    {dep.description || `Target: ${dep.target || dep.child || 'action'}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
