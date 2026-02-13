import { SweepParameter, SimulationJob } from '@/types/dataset';

/**
 * Parameter Sweep Manager
 * 모든 가능한 파라미터 조합을 생성하고 시뮬레이션 작업을 관리합니다.
 */
export class SweepManager {
    /**
     * Cartesian Product를 사용하여 모든 파라미터 조합을 생성합니다.
     */
    public static generateCombinations(parameters: SweepParameter[]): Record<string, number>[] {
        if (parameters.length === 0) return [];

        const generate = (index: number, current: Record<string, number>): Record<string, number>[] => {
            if (index === parameters.length) {
                return [current];
            }

            const param = parameters[index];
            const combinations: Record<string, number>[] = [];

            for (let val = param.start; val <= param.end; val += param.step) {
                // 부동 소수점 오차 방지
                const roundedVal = Math.round(val * 1e10) / 1e10;
                combinations.push(...generate(index + 1, { ...current, [param.name]: roundedVal }));
            }

            return combinations;
        };

        return generate(0, {});
    }

    /**
     * 생성된 조합을 시뮬레이션 작업(Queue)으로 변환합니다.
     * 실제 Supabase 연동 로직은 클라이언트 설정 후 구현 가능합니다.
     */
    public static createJobsFromCombinations(combinations: Record<string, number>[]): Partial<SimulationJob>[] {
        return combinations.map(params => ({
            parameters: params,
            status: 'pending',
            progress: 0,
        }));
    }
}
