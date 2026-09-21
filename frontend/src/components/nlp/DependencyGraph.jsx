import React, { useState } from 'react'

export default function DependencyGraph({ dependencies = [], isExpanded = false }) {
  const [hoveredNode, setHoveredNode] = useState(null)

  // Find root node safely
  const rootItem =
    dependencies.find((d) => d.is_root || d.dep?.toLowerCase() === 'root') ||
    dependencies.find((d) => d.head_id === d.id) ||
    dependencies[0]

  // Build tree hierarchy for clean top-down layout
  const buildHierarchy = () => {
    if (!dependencies || dependencies.length === 0) return null

    const nodeMap = new Map()
    dependencies.forEach((d) => {
      nodeMap.set(d.id, { ...d, childNodes: [] })
    })

    let root = null
    const visited = new Set()

    // Assign root
    if (rootItem && nodeMap.has(rootItem.id)) {
      root = nodeMap.get(rootItem.id)
    }

    // Attach children to parents
    dependencies.forEach((d) => {
      const node = nodeMap.get(d.id)
      const isThisRoot = root && node.id === root.id
      if (isThisRoot) return

      if (d.head_id !== undefined && d.head_id !== d.id && nodeMap.has(d.head_id)) {
        const parent = nodeMap.get(d.head_id)
        parent.childNodes.push(node)
      } else if (root && node.id !== root.id) {
        // Fallback: attach unparented nodes to root
        root.childNodes.push(node)
      }
    })

    return root || (dependencies.length > 0 ? nodeMap.get(dependencies[0].id) : null)
  }

  const rootHierarchy = buildHierarchy()

  // Color styles matching reference image
  const getNodeStyle = (dep, pos, isRoot) => {
    const cleanDep = (dep || '').toLowerCase()
    if (isRoot || cleanDep === 'root') {
      return {
        bg: 'bg-[#EFF6FF]',
        border: 'border-[#93C5FD]',
        text: 'text-[#1D4ED8]',
        badgeBg: 'bg-[#DBEAFE]',
        badgeText: 'text-[#1E40AF]',
      }
    }
    if (cleanDep.includes('subj') || cleanDep.includes('obj') || cleanDep === 'nsubj' || cleanDep === 'dobj') {
      return {
        bg: 'bg-[#F0FDF4]',
        border: 'border-[#86EFAC]',
        text: 'text-[#15803D]',
        badgeBg: 'bg-[#DCFCE7]',
        badgeText: 'text-[#166534]',
      }
    }
    if (cleanDep.includes('aux') || cleanDep.includes('cop')) {
      return {
        bg: 'bg-[#FEF2F2]',
        border: 'border-[#FECACA]',
        text: 'text-[#DC2626]',
        badgeBg: 'bg-[#FEE2E2]',
        badgeText: 'text-[#991B1B]',
      }
    }
    if (cleanDep.includes('prep') || cleanDep.includes('pobj')) {
      return {
        bg: 'bg-[#ECFDF5]',
        border: 'border-[#A7F3D0]',
        text: 'text-[#047857]',
        badgeBg: 'bg-[#D1FAE5]',
        badgeText: 'text-[#065F46]',
      }
    }
    if (cleanDep.includes('xcomp') || cleanDep.includes('ccomp') || cleanDep.includes('verb')) {
      return {
        bg: 'bg-[#F5F3FF]',
        border: 'border-[#DDD6FE]',
        text: 'text-[#6D28D9]',
        badgeBg: 'bg-[#EDE9FE]',
        badgeText: 'text-[#5B21B6]',
      }
    }
    return {
      bg: 'bg-[#F8FAFC]',
      border: 'border-[#E2E8F0]',
      text: 'text-[#334155]',
      badgeBg: 'bg-[#F1F5F9]',
      badgeText: 'text-[#475569]',
    }
  }

  // Recursive tree renderer
  const renderTreeNode = (node, depth = 0) => {
    if (!node) return null
    const isRoot = node.is_root || node.dep?.toLowerCase() === 'root' || (rootItem && node.id === rootItem.id)
    const style = getNodeStyle(node.dep, node.pos, isRoot)
    const isHovered = hoveredNode === node.id

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Edge label above node (if not root) */}
        {!isRoot && (
          <span className="text-[9px] font-mono font-semibold text-[#64748B] mb-0.5 tracking-tight">
            {node.dep}
          </span>
        )}

        {/* Node Box */}
        <div
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`flex flex-col items-center px-3 py-1 rounded-xl border ${style.bg} ${style.border} transition-all duration-150 shadow-2xs relative z-10 cursor-pointer ${
            isHovered ? 'scale-105 shadow-sm ring-2 ring-[#132E22]/20' : ''
          }`}
        >
          {isRoot && (
            <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-[#1D4ED8] -mt-0.5 mb-0.5">
              root
            </span>
          )}
          <span className={`text-[12px] font-bold leading-tight ${style.text}`}>
            {node.text}
          </span>
          <span className="text-[8.5px] text-[#64748B] font-mono leading-none mt-0.5">
            {node.pos}
          </span>
        </div>

        {/* Children Branches */}
        {node.childNodes && node.childNodes.length > 0 && (
          <div className="flex flex-col items-center w-full mt-1.5">
            {/* Vertical stem down from parent */}
            <div className="w-px h-3 bg-[#CBD5E1]" />

            {/* Horizontal branch bar across siblings */}
            {node.childNodes.length > 1 && (
              <div className="w-[88%] h-px bg-[#CBD5E1]" />
            )}

            {/* Sibling Nodes Container */}
            <div className="flex items-start justify-center gap-2 sm:gap-3.5 w-full pt-1.5">
              {node.childNodes.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Stem into child */}
                  <div className="w-px h-2 bg-[#CBD5E1]" />
                  {renderTreeNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white border border-[#E2EAE0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between ${isExpanded ? 'min-h-[480px]' : 'h-full'}`}>
      {/* Step Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-5 h-5 rounded-full bg-[#132E22] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
          3
        </div>
        <div>
          <h3 className="text-[14.5px] font-bold text-[#112117]">
            Dependency Parse
          </h3>
          <p className="text-[11.5px] text-[#55675C]">
            Syntactic structure and relationships between tokens.
          </p>
        </div>
      </div>

      {/* Tree Canvas - Pinned to top so Root is always visible */}
      <div className="overflow-x-auto overflow-y-auto max-h-[260px] min-h-[200px] my-auto py-3 px-2 flex items-start justify-center border border-[#F0F4EE] rounded-xl bg-[#FAFCFA]">
        {rootHierarchy ? (
          <div className="min-w-fit px-3 pt-1 pb-2">
            {renderTreeNode(rootHierarchy)}
          </div>
        ) : (
          <div className="text-center text-[12px] text-[#86978C] py-8 my-auto">
            No syntactic dependency tree generated.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 mt-2 border-t border-[#F0F4EE] flex items-center justify-between text-[11px] text-[#55675C]">
        <span>Root: <strong className="text-[#132E22]">{rootItem?.text || 'None'}</strong> ({rootItem?.pos || ''})</span>
        <span className="font-medium text-[#1E4333]">Universal Dependencies (spaCy)</span>
      </div>
    </div>
  )
}
