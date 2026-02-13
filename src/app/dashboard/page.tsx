import React from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Clock,
    AlertCircle,
    BarChart3,
    Layers,
    Download,
    Filter,
    PieChart as PieChartIcon
} from 'lucide-react';
import DistributionChart from '@/components/dashboard/DistributionChart';

export default function DashboardPage() {
    // Mock data for initial UI
    const stats = [
        { label: 'Total Jobs', value: '1,280', icon: Layers, color: 'text-blue-400' },
        { label: 'Completed', value: '842', icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'In Progress', value: '32', icon: Clock, color: 'text-amber-400' },
        { label: 'Failed', value: '6', icon: AlertCircle, color: 'text-rose-400' },
    ];

    const currentJobs = [
        { id: 'JOB-001', params: 'R: 120nm, H: 450nm', progress: 85, status: 'Running' },
        { id: 'JOB-002', params: 'R: 130nm, H: 450nm', progress: 45, status: 'Running' },
        { id: 'JOB-003', params: 'R: 140nm, H: 450nm', progress: 0, status: 'Pending' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div>
                <h2 className="text-2xl font-semibold text-slate-100">Simulation Overview</h2>
                <p className="text-slate-400 text-sm mt-1">Real-time monitoring of meta-atom dataset generation sweep.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon size={24} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium text-slate-200 flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-400" />
                            Active Sweep Progress
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                <Pause size={16} />
                            </button>
                            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {currentJobs.map((job) => (
                            <div key={job.id} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-300 font-mono">{job.id} <span className="text-slate-500 ml-2">{job.params}</span></span>
                                    <span className={job.status === 'Running' ? 'text-blue-400' : 'text-slate-500'}>{job.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${job.status === 'Running' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Control Center */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <Play size={20} className="text-emerald-400" />
                        Control Center
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                            <div className="text-xs text-slate-500 uppercase font-mono">Current Config</div>
                            <div className="text-sm font-medium text-slate-300">Sweep Mode: Cartesian</div>
                            <div className="text-sm font-medium text-slate-300">Estimated Time: 4h 20m</div>
                        </div>
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20 active:scale-95">
                            Start New Batch
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Analysis & Export */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution Plot */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium text-slate-200 flex items-center gap-2">
                            <PieChartIcon size={20} className="text-purple-400" />
                            Parameter Distribution (Radius vs Phase)
                        </h3>
                        <button className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
                            <Filter size={14} />
                            Filter
                        </button>
                    </div>
                    <DistributionChart />
                </div>

                {/* Dataset Split & Export */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <Download size={20} className="text-emerald-400" />
                        Dataset Export & Split
                    </h3>
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Train / Val / Test Split</span>
                                <span className="text-xs font-mono text-blue-400">80% / 10% / 10%</span>
                            </div>
                            <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-800">
                                <div className="h-full bg-blue-500" style={{ width: '80%' }} />
                                <div className="h-full bg-purple-500" style={{ width: '10%' }} />
                                <div className="h-full bg-emerald-500" style={{ width: '10%' }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href="/api/export/dataset?format=csv"
                                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors border border-slate-700"
                                download
                            >
                                <Download size={16} />
                                Export CSV
                            </a>
                            <a
                                href="/api/export/dataset?format=jsonl"
                                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors border border-slate-700"
                                download
                            >
                                <Download size={16} />
                                Export JSONL
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
