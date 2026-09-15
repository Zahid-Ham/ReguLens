import React, { useState } from 'react'
import { Search, Bell, ChevronDown, Menu, UserCheck, ShieldCheck } from 'lucide-react'

export default function TopBar({ onOpenMobileSidebar = () => {} }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  return (
    <header className="h-20 bg-[#FAFBF9]/95 backdrop-blur-md border-b border-[#EAEFE8] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-[#334238] hover:bg-[#EEF3EC] focus:outline-none"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Field */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718277]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search regulations, documents, or insights..."
            className="w-full pl-10 pr-20 py-2 text-[13px] bg-white border border-[#DCE4DA] rounded-lg text-[#112117] placeholder-[#76877D] focus:outline-none focus:ring-1 focus:ring-[#132E22] focus:border-[#132E22] transition-colors shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-[#5B6E62] bg-[#F0F4EE] border border-[#D6E0D5] rounded shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-full text-[#4E5F54] hover:text-[#112117] hover:bg-[#EEF3EC] transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2C634D] rounded-full ring-2 ring-[#FAFBF9]" />
        </button>

        <div className="h-6 w-px bg-[#E2EAE0] hidden sm:block" />

        {/* User Profile Area */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-1 sm:px-2 py-1.5 rounded-lg hover:bg-[#EEF3EC] transition-colors text-left focus:outline-none"
            aria-expanded={profileDropdownOpen}
          >
            {/* Initials Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#132E22] text-[#FAFBF9] flex items-center justify-center text-xs font-semibold tracking-tight shadow-xs">
              ZH
            </div>

            {/* User Details */}
            <div className="hidden sm:flex flex-col">
              <span className="text-[13px] font-semibold text-[#112117] leading-tight">
                Zahid Hamdule
              </span>
              <span className="text-[11px] text-[#63756A] leading-tight">
                Student
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#63756A] hidden sm:block ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCE4DA] rounded-xl shadow-lg py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#EEF3EC]">
                <p className="text-[13px] font-semibold text-[#112117]">Zahid Hamdule</p>
                <p className="text-[11px] text-[#63756A]">zahid@regulens.internal</p>
              </div>
              <div className="py-1">
                <a
                  href="#profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-[12.5px] text-[#3E4F44] hover:bg-[#F2F6F1] hover:text-[#112117]"
                  onClick={(e) => {
                    e.preventDefault()
                    setProfileDropdownOpen(false)
                  }}
                >
                  <UserCheck className="w-4 h-4 text-[#5A6C61]" />
                  User Profile
                </a>
                <a
                  href="#compliance-scope"
                  className="flex items-center gap-2.5 px-4 py-2 text-[12.5px] text-[#3E4F44] hover:bg-[#F2F6F1] hover:text-[#112117]"
                  onClick={(e) => {
                    e.preventDefault()
                    setProfileDropdownOpen(false)
                  }}
                >
                  <ShieldCheck className="w-4 h-4 text-[#5A6C61]" />
                  Role & Permissions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
