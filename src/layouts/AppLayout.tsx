import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={drawerOpen} onNavigate={() => setDrawerOpen(false)} />
      {drawerOpen && (
        <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden />
      )}
      <div className="app-main">
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <main className="app-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
