import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FilePlus2,
  Clock,
  BookOpen,
  Lightbulb,
  Network,
  Files,
  Settings,
  HelpCircle,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react'
import BrandMark from '../BrandMark'

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const location = useLocation()

  const mainNavItems = [
    {
      name: 'New Analysis',
      path: '/analysis/new',
      icon: FilePlus2,
      active: location.pathname === '/analysis/new' || location.pathname === '/',
    },
    {
      name: 'Analysis History',
      path: '/analysis/history',
      icon: Clock,
      active:
        location.pathname === '/analysis/history' ||
        location.pathname === '/analyses' ||
        location.pathname.startsWith('/analysis/results') ||
        location.pathname.startsWith('/analysis/clause'),
    },
    {
      name: 'Regulations Library',
      path: '/regulations',
      icon: BookOpen,
      active: location.pathname === '/regulations',
    },
    {
      name: 'Insights',
      path: '/insights',
      icon: Lightbulb,
      active: location.pathname === '/insights',
    },
    {
      name: 'NLP Explorer',
      path: '/nlp-explorer',
      icon: Network,
      active: location.pathname === '/nlp-explorer',
    },
    {
      name: 'My Documents',
      path: '/documents',
      icon: Files,
      active: location.pathname === '/documents',
    },
  ]

  const bottomNavItems = [
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      active: location.pathname === '/settings',
    },
    {
      name: 'Help & Support',
      path: '/help',
      icon: HelpCircle,
      active: location.pathname === '/help',
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAFBF9] border-r border-[#EAEFE8] select-none">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-[#EAEFE8] flex-shrink-0">
        <Link to="/" className="flex items-center">
          <BrandMark showTagline={true} />
        </Link>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-[#48594F] hover:bg-[#EEF3EC] focus:outline-none"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 px-3.5 py-5 overflow-y-auto space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] transition-colors duration-150 relative group ${
                item.active
                  ? 'bg-[#EBF3EC] text-[#132E22] font-semibold shadow-xs'
                  : 'text-[#4A5D51] hover:bg-[#F2F6F1] hover:text-[#112117] font-medium'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  item.active ? 'text-[#132E22]' : 'text-[#5C6E63] group-hover:text-[#112117]'
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-3.5 border-t border-[#EAEFE8] flex-shrink-0 space-y-3.5">
        {/* Settings & Help */}
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] transition-colors ${
                  item.active
                    ? 'bg-[#EBF3EC] text-[#132E22] font-semibold'
                    : 'text-[#5C6E63] hover:bg-[#F2F6F1] hover:text-[#112117] font-medium'
                }`}
              >
                <Icon className="w-[17px] h-[17px] flex-shrink-0 text-[#67796E]" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Brand Mission Statement Card */}
        <div className="bg-[#EDF4ED]/85 border border-[#DCE8DC] rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#DEECE0] flex items-center justify-center flex-shrink-0 text-[#132E22] mt-0.5">
            <Sprout className="w-4 h-4 text-[#1E4333]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-[#132E22] leading-snug">
              Smarter Regulations
            </span>
            <span className="text-[11px] text-[#4A5D51] leading-tight">
              A Safer Tomorrow.
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-68 flex-shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B150F]/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#FAFBF9] z-50 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
