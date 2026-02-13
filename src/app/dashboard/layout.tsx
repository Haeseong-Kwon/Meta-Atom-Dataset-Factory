import React from 'react';
import { LayoutDashboard, Database, Settings, Activity } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-blue-400">Meta-Atom Factory</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/20">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        <Activity size={18} />
                        Simulations
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        <Database size={18} />
                        Dataset
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        <Settings size={18} />
                        Settings
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">System Status:</span>
                        <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Operational
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-300 border border-slate-700">
                            v1.0.0-alpha
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
