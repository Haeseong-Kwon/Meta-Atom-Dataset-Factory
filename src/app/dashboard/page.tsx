'use client';

import React, { useState } from 'react';
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
    PieChart as PieChartIcon,
    LayoutDashboard,
    Zap
} from 'lucide-react';
import DistributionChart from '@/components/dashboard/DistributionChart';
import InsightPanel from '@/components/analytics/InsightPanel';
import TrainingBridge from '@/components/factory/TrainingBridge';

type TabType = 'overview' | 'insights' | 'training';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Mock data
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
            {/* Header with Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-100">Dataset Factory</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage simulation sweeps and AI training pipelines.</p>
                </div>

                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <LayoutDashboard size={14} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <PieChartIcon size={14} />
                        Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'training' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Zap size={14} />
                        Training Bridge
                    </button>
                </div>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <stat.icon size={24} className={stat.color} />
                                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-medium text-slate-200 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-blue-400" />
                                    Active Sweep Progress
                                </h3>
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
                                                className={`h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-medium text-slate-200 mb-6 flex items-center gap-2">
                                <Download size={20} className="text-emerald-400" />
                                Quick Export
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                                    <div className="text-[10px] text-slate-500 uppercase font-mono">Current Dataset</div>
                                    <div className="text-sm font-medium text-slate-300">1.2k Valid Samples</div>
                                </div>
                                <a href="/api/export/dataset?format=csv" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors">
                                    <Download size={14} /> Download Latest CSV
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Simple Preview */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-medium text-slate-200 flex items-center gap-2">
                                <PieChartIcon size={20} className="text-purple-400" />
                                Quick Distribution Preview
                            </h3>
                        </div>
                        <DistributionChart />
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <InsightPanel />
                </div>
            )}

            {activeTab === 'training' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <TrainingBridge />
                </div>
            )}
        </div>
    );
}
