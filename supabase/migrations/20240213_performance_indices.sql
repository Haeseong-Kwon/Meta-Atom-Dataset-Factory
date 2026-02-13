-- meta_atom_dataset 테이블 성능 최적화를 위한 인덱스 추가
-- 1. 파라미터 기반 조회 성능 향상 (JSONB GIN Index)
CREATE INDEX IF NOT EXISTS idx_meta_atom_parameters ON meta_atom_dataset USING GIN (parameters);

-- 2. 생성 일시 기반 정렬 및 최신 데이터 조회 최적화
CREATE INDEX IF NOT EXISTS idx_meta_atom_created_at ON meta_atom_dataset (created_at DESC);

-- 3. 전송률 및 위상 기반 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_meta_atom_metrics ON meta_atom_dataset (transmission, phase);

-- 4. job_id 기반 외래키 조회 최적화
CREATE INDEX IF NOT EXISTS idx_meta_atom_job_id ON meta_atom_dataset (job_id);

-- 시뮬레이션 작업 테이블 최적화
CREATE INDEX IF NOT EXISTS idx_simulation_jobs_status ON simulation_jobs (status);
CREATE INDEX IF NOT EXISTS idx_simulation_jobs_created_at ON simulation_jobs (created_at DESC);
