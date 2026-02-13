-- meta_atom_dataset 테이블에 is_valid 컬럼 추가
ALTER TABLE meta_atom_dataset 
ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT TRUE;

-- 인덱스 추가 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_meta_atom_dataset_is_valid ON meta_atom_dataset(is_valid);

-- COMMENT 추가
COMMENT ON COLUMN meta_atom_dataset.is_valid IS '물리적 정합성 검증 통과 여부';
