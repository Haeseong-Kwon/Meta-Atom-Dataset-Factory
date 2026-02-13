import { supabase } from '../supabase';

interface SparseRegion {
    target: string;
    radiusRange: [number, number];
    heightRange: [number, number];
    count: number;
}

/**
 * Active Learning Module
 * 불확실성이 높거나 데이터가 부족한 영역(Uncertainty/Sparse Regions)을 식별하고
 * 자동으로 추가 시뮬레이션을 제안/생성합니다.
 */
export const ActiveLearningManager = {
    /**
     * 현재 데이터셋을 분석하여 추가 수집이 필요한 영역을 식별합니다.
     */
    async identifyUncertaintyRegions(): Promise<SparseRegion[]> {
        const { data: results, error } = await supabase
            .from('meta_atom_dataset')
            .select('parameters');

        if (error || !results) return [];

        const data = results.map(r => ({
            radius: r.parameters.radius || 0,
            height: r.parameters.height || 0
        }));

        // 5x5 Grid Analysis (Phase 3에서 사용한 로직 확장)
        const radiusBins = 5;
        const heightBins = 5;
        const grid: number[][] = Array.from({ length: radiusBins }, () => Array(heightBins).fill(0));

        data.forEach(d => {
            const rIdx = Math.floor(((d.radius - 100) / 200) * radiusBins);
            const hIdx = Math.floor(((d.height - 400) / 200) * heightBins);
            if (rIdx >= 0 && rIdx < radiusBins && hIdx >= 0 && hIdx < heightBins) {
                grid[rIdx][hIdx]++;
            }
        });

        const threshold = 10; // Active Learning threshold (더 엄격함)
        const uncertaintyRegions: SparseRegion[] = [];

        for (let r = 0; r < radiusBins; r++) {
            for (let h = 0; h < heightBins; h++) {
                if (grid[r][h] < threshold) {
                    const rStart = 100 + (r * 200) / radiusBins;
                    const rEnd = rStart + 200 / radiusBins;
                    const hStart = 400 + (h * 200) / heightBins;
                    const hEnd = hStart + 200 / heightBins;

                    uncertaintyRegions.push({
                        target: `R: ${rStart}-${rEnd}nm, H: ${hStart}-${hEnd}nm`,
                        radiusRange: [rStart, rEnd],
                        heightRange: [hStart, hEnd],
                        count: grid[r][h]
                    });
                }
            }
        }

        return uncertaintyRegions.sort((a, b) => a.count - b.count);
    },

    /**
     * 식별된 취약 구간에 대해 자동으로 시뮬레이션 작업을 생성합니다. (Auto-Refinement)
     */
    async triggerRefinementLoop() {
        console.log('--- Starting Active Learning Auto-Refinement ---');
        const regions = await this.identifyUncertaintyRegions();

        if (regions.length === 0) {
            console.log('Dataset is dense enough. No refinement needed.');
            return { success: true, message: 'Dataset is sufficient.' };
        }

        // 가장 데이터가 부족한 상위 3개 영역에 대해 추가 샘플링 작업 생성
        const targetRegions = regions.slice(0, 3);
        const newJobs = targetRegions.map(region => ({
            parameters: {
                radius_range: region.radiusRange,
                height_range: region.heightRange,
                samples: 20,
                type: 'focused_sweep'
            },
            status: 'pending',
            progress: 0,
            error_message: null
        }));

        const { error } = await supabase
            .from('simulation_jobs')
            .insert(newJobs);

        if (error) {
            console.error('Failed to trigger refinement jobs:', error);
            return { success: false, error };
        }

        console.log(`Successfully queued ${newJobs.length} refinement jobs for sparse regions.`);
        return { success: true, jobsCreated: newJobs.length };
    }
};
