import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">Student Management</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Administration Panel</p>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  )
}
