import { SimulationResult } from '@/types/dataset';

/**
 * Data Validator
 * 시뮬레이션 결과의 물리적 정합성을 검증합니다.
 */
export class DataValidator {
    /**
     * 단일 데이터의 유효성을 검사합니다.
     * @param result 시뮬레이션 결과 객체
     * @returns 유효성 검사 결과 및 오류 메시지
     */
    public static validate(result: Partial<SimulationResult>): { isValid: boolean; reason?: string } {
        const { transmission, phase } = result;

        // 1. 투과율(Transmission) 검증: 0 <= T <= 1
        if (transmission !== undefined) {
            if (transmission < 0 || transmission > 1.0) {
                return {
                    isValid: false,
                    reason: `Invalid transmission value: ${transmission}. Must be between 0 and 1.`
                };
            }
        }

        // 2. 위상(Phase) 검증: 보통 0 ~ 2π (0 ~ 6.28...)
        // 시뮬레이션 엔진에 따라 다르지만, 여기서는 기본적인 범위를 체크합니다.
        if (phase !== undefined) {
            if (isNaN(phase) || !isFinite(phase)) {
                return {
                    isValid: false,
                    reason: `Invalid phase value: ${phase}. Must be a finite number.`
                };
            }
        }

        return { isValid: true };
    }

    /**
     * 배치 데이터의 유효성을 일괄 검사합니다.
     */
    public static validateBatch(results: Partial<SimulationResult>[]): Partial<SimulationResult>[] {
        return results.map(result => ({
            ...result,
            isValid: this.validate(result).isValid
        }));
    }
}
