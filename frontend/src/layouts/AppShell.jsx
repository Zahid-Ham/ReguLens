import React, { useState } from 'react'
import Sidebar from '../components/application/Sidebar'
import TopBar from '../components/application/TopBar'

export default function AppShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#19221C] flex flex-row font-sans selection:bg-[#132E22] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <TopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Main Application Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
