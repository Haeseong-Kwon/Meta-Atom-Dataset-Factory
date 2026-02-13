'use client';

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Target, Zap, Clock, TrendingUp } from 'lucide-react';

const mockEfficiencyData = [
    { samples: 0, accuracy: 65, cost: 0 },
    { samples: 100, accuracy: 72, cost: 20 },
    { samples: 250, accuracy: 84, cost: 50 },
    { samples: 500, accuracy: 91, cost: 100 },
    { samples: 800, accuracy: 95, cost: 160 },
    { samples: 1200, accuracy: 97, cost: 240 },
];

export default function EfficiencyReport() {
    const roi = useMemo(() => {
        const last = mockEfficiencyData[mockEfficiencyData.length - 1];
        return (last.accuracy / (last.cost || 1)).toFixed(2);
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Target size={64} className="text-blue-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Model Accuracy</div>
                    <div className="text-3xl font-bold text-blue-400">97.2%</div>
                    <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={12} /> +2.4% from last batch
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap size={64} className="text-amber-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data Generation Efficiency</div>
                    <div className="text-3xl font-bold text-amber-400">{roi} <span className="text-xs text-slate-500 font-normal">Acc/Unit</span></div>
                    <div className="mt-2 text-[10px] text-slate-500 italic">Active Learning is active</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={64} className="text-purple-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Compute Time</div>
                    <div className="text-3xl font-bold text-purple-400">142h <span className="text-xs text-slate-500 font-normal">GPU/CPU</span></div>
                    <div className="mt-2 text-[10px] text-rose-500 italic">Estimated $42.50 saved by AL</div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-6 uppercase tracking-wider">
                    Learning Curve vs. Data Volume
                </h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockEfficiencyData}>
                            <defs>
                                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="samples" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Area
                                type="monotone"
                                dataKey="accuracy"
                                name="Accuracy (%)"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAcc)"
                            />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                name="Relative Cost"
                                stroke="#64748b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="transparent"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
