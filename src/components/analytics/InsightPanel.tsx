'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
import { AlertTriangle, TrendingUp, Info, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InsightData {
    radius: number;
    height: number;
    phase: number;
    transmission: number;
}

export default function InsightPanel() {
    const [data, setData] = useState<InsightData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: results, error } = await supabase
                .from('meta_atom_dataset')
                .select('transmission, phase, parameters')
                .limit(500);

            if (results && !error) {
                const formatted = results.map(r => ({
                    radius: r.parameters.radius || 0,
                    height: r.parameters.height || 0,
                    phase: r.phase,
                    transmission: r.transmission
                }));
                setData(formatted);
            } else {
                // Fallback to mock data if no real data exists or error occurs
                const mock = Array.from({ length: 150 }, (_, i) => ({
                    radius: 100 + Math.random() * 200,
                    height: 400 + Math.random() * 200,
                    phase: Math.random() * Math.PI * 2,
                    transmission: 0.5 + Math.random() * 0.5
                }));
                setData(mock);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Sparse Region Detection Logic: Partition space into grid and find low-density areas
    const sparseRegions = useMemo(() => {
        if (data.length < 50) return [];

        const radiusBins = 5; // Divide 100-300 into 5 bins
        const heightBins = 5; // Divide 400-600 into 5 bins
        const grid: number[][] = Array.from({ length: radiusBins }, () => Array(heightBins).fill(0));

        data.forEach(d => {
            const rIdx = Math.floor(((d.radius - 100) / 200) * radiusBins);
            const hIdx = Math.floor(((d.height - 400) / 200) * heightBins);
            if (rIdx >= 0 && rIdx < radiusBins && hIdx >= 0 && hIdx < heightBins) {
                grid[rIdx][hIdx]++;
            }
        });

        const regions = [];
        const threshold = 5; // Alert if less than 5 samples in a grid cell

        for (let r = 0; r < radiusBins; r++) {
            for (let h = 0; h < heightBins; h++) {
                if (grid[r][h] < threshold) {
                    const rRange = `[${100 + (r * 200) / radiusBins}-${100 + ((r + 1) * 200) / radiusBins}nm]`;
                    const hRange = `[${400 + (h * 200) / heightBins}-${400 + ((h + 1) * 200) / heightBins}nm]`;
                    regions.push({
                        target: `R: ${rRange}, H: ${hRange}`,
                        count: grid[r][h]
                    });
                }
            }
        }
        // Limit to top 3 most sparse to avoid UI clutter
        return regions.sort((a, b) => a.count - b.count).slice(0, 3);
    }, [data]);

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                <RefreshCw className="text-blue-500 animate-spin" size={32} />
            </div>
        );
    }

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
                                <XAxis type="number" dataKey="radius" name="Radius" unit="nm" domain={[100, 300]} stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Radius (nm)" offset={-10} position="insideBottom" fill="#64748b" fontSize={10} />
                                </XAxis>
                                <YAxis type="number" dataKey="phase" name="Phase" unit="rad" domain={[0, 6.28]} stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Phase" angle={-90} position="insideLeft" fill="#64748b" fontSize={10} style={{ textAnchor: 'middle' }} />
                                </YAxis>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Scatter data={data} fill="#3b82f6" fillOpacity={0.5} />
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
                                <XAxis type="number" dataKey="height" name="Height" unit="nm" domain={[400, 600]} stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Height (nm)" offset={-10} position="insideBottom" fill="#64748b" fontSize={10} />
                                </XAxis>
                                <YAxis type="number" dataKey="transmission" name="Transmission" domain={[0, 1]} stroke="#64748b" fontSize={11} tickLine={false}>
                                    <Label value="Transmission" angle={-90} position="insideLeft" fill="#64748b" fontSize={10} style={{ textAnchor: 'middle' }} />
                                </YAxis>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Scatter data={data} fill="#10b981" fillOpacity={0.5} />
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
                            다음 파라미터 구간에서 데이터 밀도가 부족합니다. Surrogate 모델의 일반화 성능 확보를 위해 추가 스윕이 필요합니다:
                        </p>
                        <ul className="mt-3 space-y-2">
                            {sparseRegions.map((region, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-amber-200/90 font-mono">
                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                    {region.target}: {region.count} samples
                                </li>
                            ))}
                        </ul>
                        <button className="mt-4 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-xs font-bold transition-colors">
                            Queue Adaptive Sweep
                        </button>
                    </div>
                </div>
            )}

            {/* Analytics Insights Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-4">
                    <Info size={16} className="text-blue-400" />
                    Dataset Quality Index
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Coverage</div>
                        <div className="text-lg font-bold text-slate-200">{Math.round((1 - sparseRegions.length / 25) * 100)}%</div>
                    </div>
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Sampling Density</div>
                        <div className="text-lg font-bold text-slate-200">{(data.length / 25).toFixed(1)} samples/bin</div>
                    </div>
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Target Version</div>
                        <div className="text-lg font-bold text-slate-200">Surrogate v2.4</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
