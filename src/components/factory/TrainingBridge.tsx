'use client';

import React, { useState } from 'react';
import { Settings2, Download, Database, Check } from 'lucide-react';

export default function TrainingBridge() {
    const [features, setFeatures] = useState(['radius', 'height']);
    const [labels, setLabels] = useState(['phase']);
    const [isExporting, setIsExporting] = useState(false);

    const toggleFeature = (f: string) => {
        setFeatures(prev => prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]);
    };

    const toggleLabel = (l: string) => {
        setLabels(prev => prev.includes(l) ? prev.filter(item => item !== l) : [...prev, l]);
    };

    const downloadConfig = () => {
        setIsExporting(true);
        const config = {
            project: "Meta-Atom-Factory",
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            training: {
                features,
                labels,
                format: "float32",
                normalization: "min-max"
            },
            source: "/api/v1/training-data"
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'training_config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setTimeout(() => setIsExporting(false), 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configurator */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-6">
                        <Settings2 size={20} className="text-blue-400" />
                        Model Input/Output Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Features Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Features (X)</label>
                            <div className="space-y-2">
                                {['radius', 'height', 'width', 'gap', 'period'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => toggleFeature(f)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${features.includes(f)
                                                ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                    >
                                        <span className="capitalize">{f}</span>
                                        {features.includes(f) && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Labels Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Labels (Y)</label>
                            <div className="space-y-2">
                                {['phase', 'transmission', 'reflection', 'absorption'].map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => toggleLabel(l)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${labels.includes(l)
                                                ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                    >
                                        <span className="capitalize">{l}</span>
                                        {labels.includes(l) && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Surrogate Preview Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-2">
                        <Database size={16} className="text-purple-400" />
                        Surrogate Model Compatibility
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        선택된 필드는 'MetaSurface Designer'의 PyTorch 기반 Surrogate 모델 구조와 완벽히 호환됩니다.
                        익스포트된 <code>config.json</code>은 학습 시작 시 파라미터 맵핑 및 정규화 계수로 활용됩니다.
                    </p>
                </div>
            </div>

            {/* Summary & Download */}
            <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-24">
                    <h3 className="text-sm font-semibold text-slate-100 mb-6 uppercase tracking-wider">Export Summary</h3>
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Selected Features</span>
                            <span className="text-slate-300 font-mono">{features.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Selected Labels</span>
                            <span className="text-slate-300 font-mono">{labels.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Output Format</span>
                            <span className="text-slate-300 font-mono">JSON / FLOAT32</span>
                        </div>
                    </div>

                    <button
                        onClick={downloadConfig}
                        disabled={features.length === 0 || labels.length === 0 || isExporting}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                        {isExporting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Download size={20} />
                                Generate config.json
                            </>
                        )}
                    </button>

                    <p className="mt-4 text-[10px] text-center text-slate-600 italic">
                        This config will bridge the dataset to the surrogate training pipeline.
                    </p>
                </div>
            </div>
        </div>
    );
}
