'use client';

import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DataPoint {
    x: number;
    y: number;
    id: string;
}

const mockScatterData: DataPoint[] = Array.from({ length: 50 }, (_, i) => ({
    x: 100 + Math.random() * 100,
    y: Math.random() * Math.PI * 2,
    id: `P-${i}`
}));

export default function DistributionChart() {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Radius"
                        unit="nm"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Phase"
                        unit="rad"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                    />
                    <ZAxis type="category" dataKey="id" name="ID" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Scatter name="Meta-Atoms" data={mockScatterData} fill="#3b82f6" fillOpacity={0.6} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
