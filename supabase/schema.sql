-- Simulation Jobs 테이블
CREATE TABLE IF NOT EXISTS simulation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parameters JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    progress FLOAT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meta-Atom Dataset 테이블
CREATE TABLE IF NOT EXISTS meta_atom_dataset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES simulation_jobs(id),
    transmission FLOAT NOT NULL,
    phase FLOAT NOT NULL,
    frequency FLOAT NOT NULL,
    parameters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 트리거 함수: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simulation_jobs_updated_at
    BEFORE UPDATE ON simulation_jobs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
