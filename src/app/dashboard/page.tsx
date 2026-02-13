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
    Zap,
    Activity,
    BrainCircuit
} from 'lucide-react';
import DistributionChart from '@/components/dashboard/DistributionChart';
import InsightPanel from '@/components/analytics/InsightPanel';
import TrainingBridge from '@/components/factory/TrainingBridge';
import EfficiencyReport from '@/components/factory/EfficiencyReport';
import { ActiveLearningManager } from '@/lib/factory/active-learning';

type TabType = 'overview' | 'insights' | 'training' | 'performance';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isALRunning, setIsALRunning] = useState(false);
    const [alStatus, setAlStatus] = useState<string | null>(null);

    const handleStartAL = async () => {
        setIsALRunning(true);
        setAlStatus('Analysing dataset for refinement...');

        try {
            const result = await ActiveLearningManager.triggerRefinementLoop();
            if (result.success) {
                setAlStatus(result.jobsCreated ? `Queued ${result.jobsCreated} refinement jobs.` : 'Dataset is optimal.');
            }
        } catch (err) {
            setAlStatus('Failed to start Active Learning.');
        } finally {
            setTimeout(() => {
                setIsALRunning(false);
                setAlStatus(null);
            }, 3000);
        }
    };

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
                    <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-3">
                        Dataset Factory
                        {isALRunning && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 animate-pulse">
                                <BrainCircuit size={10} /> Active Learning ON
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Manage simulation sweeps and AI training pipelines.</p>
                </div>

                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <LayoutDashboard size={14} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <PieChartIcon size={14} />
                        Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'training' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Zap size={14} />
                        Training Bridge
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'performance' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Activity size={14} />
                        Performance
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
                                <BrainCircuit size={20} className="text-blue-400" />
                                Active Learning Master
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                                    <div className="text-[10px] text-slate-500 uppercase font-mono">Status</div>
                                    <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isALRunning ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
                                        {alStatus || (isALRunning ? 'Active' : 'Standby')}
                                    </div>
                                </div>
                                <button
                                    onClick={handleStartAL}
                                    disabled={isALRunning}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                    <Play size={14} /> Start Autorefinement
                                </button>
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

            {activeTab === 'performance' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <EfficiencyReport />
                </div>
            )}
        </div>
    );
}
