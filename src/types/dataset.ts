/**
 * 메타 원자 데이터셋 관리를 위한 핵심 타입 정의
 */

export type SimulationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SweepParameter {
    name: string;
    start: number;
    end: number;
    step: number;
    unit: string;
}

export interface MaterialProperty {
    id: string;
    name: string;
    refractiveIndex: number;
    permittivity: number;
    permeability: number;
}

export interface SimulationResult {
    id: string;
    jobId: string;
    transmission: number;
    phase: number;
    frequency: number;
    parameters: Record<string, number>;
    isValid: boolean;
    createdAt: string;
}

export interface SimulationJob {
    id: string;
    parameters: Record<string, number>;
    status: SimulationStatus;
    progress: number;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DatasetStats {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    pendingJobs: number;
    progress: number;
}
