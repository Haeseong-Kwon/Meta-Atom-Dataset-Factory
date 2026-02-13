import React from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Clock,
    AlertCircle,
    BarChart3,
    Layers
} from 'lucide-react';

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
        <div className="space-y-8">
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

            {/* Main Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Chart Placeholder */}
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

                {/* Quick Actions / Configuration */}
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
                    </div>
                </div>
            </div>
        </div>
    </div >
  );
}
