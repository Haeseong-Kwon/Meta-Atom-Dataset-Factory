'use client';

import React, { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Label
} from 'recharts';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface InsightData {
    radius: number;
    height: number;
    phase: number;
    transmission: number;
}

const mockAnalyticsData: InsightData[] = Array.from({ length: 100 }, (_, i) => ({
    radius: 100 + Math.random() * 200,
    height: 400 + Math.random() * 200,
    phase: Math.random() * Math.PI * 2,
    transmission: 0.5 + Math.random() * 0.5
}));

export default function InsightPanel() {
    // Sparse Region Detection Logic (Mock)
    const sparseRegions = useMemo(() => {
        // Simple logic: If radius is between 200-250, check density
        const criticalZone = mockAnalyticsData.filter(d => d.radius > 200 && d.radius < 250);
        return criticalZone.length < 10 ? [{ target: 'Radius [200nm - 250nm]', count: criticalZone.length }] : [];
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Correlation: Radius vs Phase */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-400" />
                            Radius vs Phase Correlation
                        </h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis type="number" dataKey="radius" name="Radius" unit="nm" stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Radius (nm)" offset={-10} position="insideBottom" fill="#64748b" fontSize={10} />
                                </XAxis>
                                <YAxis type="number" dataKey="phase" name="Phase" unit="rad" stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Phase" angle={-90} position="insideLeft" fill="#64748b" fontSize={10} style={{ textAnchor: 'middle' }} />
                                </YAxis>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Scatter data={mockAnalyticsData} fill="#3b82f6" fillOpacity={0.5} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Correlation: Height vs Transmission */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-400" />
                            Height vs Transmission
                        </h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis type="number" dataKey="height" name="Height" unit="nm" stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Height (nm)" offset={-10} position="insideBottom" fill="#64748b" fontSize={10} />
                                </XAxis>
                                <YAxis type="number" dataKey="transmission" name="Transmission" stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Transmission" angle={-90} position="insideLeft" fill="#64748b" fontSize={10} style={{ textAnchor: 'middle' }} />
                                </YAxis>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Scatter data={mockAnalyticsData} fill="#10b981" fillOpacity={0.5} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sparse Region Alerts */}
            {sparseRegions.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
                    <AlertTriangle className="text-amber-500 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-semibold text-amber-200">Sparse Regions Detected</h4>
                        <p className="text-xs text-amber-500/80 mt-1">
                            다음 구간에서 데이터 밀도가 부족하여 Surrogate 모델의 정확도가 떨어질 수 있습니다:
                        </p>
                        <ul className="mt-3 space-y-2">
                            {sparseRegions.map((region, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-amber-200/90 font-mono">
                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                    {region.target}: {region.count} samples (Recommended: {'>'}20)
                                </li>
                            ))}
                        </ul>
                        <button className="mt-4 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-xs font-bold transition-colors">
                            Queue Focused Sweep
                        </button>
                    </div>
                </div>
            )}

            {/* Analytics Insights Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-4">
                    <Info size={16} className="text-blue-400" />
                    Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Max Stability</div>
                        <div className="text-lg font-bold text-slate-200">R: 150-180nm</div>
                    </div>
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Phase Variance</div>
                        <div className="text-lg font-bold text-slate-200">Low (σ=0.12)</div>
                    </div>
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Top Material</div>
                        <div className="text-lg font-bold text-slate-200">TiO2 (Ref: 2.45)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
