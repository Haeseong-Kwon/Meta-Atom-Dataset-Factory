
import os
import h5py
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """환경 변수에서 Supabase 접속 정보를 읽어 클라이언트를 생성합니다."""
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise EnvironmentError("SUPABASE_URL and SUPABASE_KEY 환경 변수를 설정해야 합니다.")
    return create_client(url, key)

def fetch_valid_data(client: Client) -> pd.DataFrame:
    """Supabase에서 유효한 데이터를 조회하여 Pandas DataFrame으로 변환합니다."""
    print("Supabase에서 유효한 데이터를 조회합니다...")
    response = client.table('meta_atom_dataset').select(
        'transmission, phase, frequency, parameters, is_valid'
    ).eq('is_valid', 'true').execute()

    if not response.data:
        print("조회된 데이터가 없습니다.")
        return pd.DataFrame()

    print(f"총 {len(response.data)}개의 유효한 데이터를 조회했습니다.")
    
    df = pd.DataFrame(response.data)

    # 'parameters' 컬럼의 JSON을 별도의 컬럼으로 확장
    parameters_df = df['parameters'].apply(pd.Series)
    
    # 원래 DataFrame과 병합
    df = pd.concat([df.drop('parameters', axis=1), parameters_df], axis=1)
    
    return df

def normalize_data(df: pd.DataFrame):
    """데이터프레임의 입출력 데이터를 정규화합니다."""
    print("데이터 정규화를 시작합니다...")
    
    # 입출력 컬럼 정의 (스키마 및 요구사항 기반)
    input_cols = [col for col in ['radius', 'period', 'frequency'] if col in df.columns]
    output_cols = ['transmission', 'phase']

    if not all(col in df.columns for col in input_cols + output_cols):
        missing = set(input_cols + output_cols) - set(df.columns)
        raise ValueError(f"DataFrame에 필요한 컬럼이 없습니다: {missing}")

    # 정규화 수행
    normalized_df = df.copy()
    stats = {}

    all_cols_to_normalize = input_cols + output_cols
    for col in all_cols_to_normalize:
        # 데이터 타입을 float으로 강제 변환
        normalized_df[col] = pd.to_numeric(normalized_df[col], errors='coerce')
        min_val = normalized_df[col].min()
        max_val = normalized_df[col].max()
        
        # 분모가 0이 되는 경우 방지 (모든 값이 동일)
        if (max_val - min_val) == 0:
            normalized_df[f'{col}_norm'] = 0.5 # 혹은 0 또는 1
        else:
            normalized_df[f'{col}_norm'] = (normalized_df[col] - min_val) / (max_val - min_val)
        
        stats[col] = {
            'min': min_val,
            'max': max_val
        }
    
    # NaN 값이 발생한 경우 처리
    normalized_df.dropna(subset=[f'{col}_norm' for col in all_cols_to_normalize], inplace=True)

    print("데이터 정규화 완료.")
    return normalized_df, input_cols, output_cols, stats


def save_to_hdf5(df: pd.DataFrame, input_cols: list, output_cols: list, filename="meta_atom_dataset.h5"):
    """정규화된 데이터를 HDF5 파일로 저장합니다."""
    print(f"HDF5 파일({filename}) 저장을 시작합니다...")
    
    # 정규화된 컬럼명
    norm_input_cols = [f'{col}_norm' for col in input_cols]
    norm_output_cols = [f'{col}_norm' for col in output_cols]

    inputs_normalized = df[norm_input_cols].values.astype(np.float32)
    outputs_normalized = df[norm_output_cols].values.astype(np.float32)

    with h5py.File(filename, 'w') as f:
        f.create_dataset('inputs', data=inputs_normalized)
        f.create_dataset('outputs', data=outputs_normalized)
    
    print(f"'{filename}' 파일에 데이터 저장을 완료했습니다.")


def print_summary_report(df: pd.DataFrame, stats: dict, input_cols: list, output_cols: list):
    """데이터셋의 통계 요약 리포트를 출력합니다."""
    print("
--- 데이터셋 통계 요약 리포트 ---")
    print(f"총 데이터 개수: {len(df)}")
    
    display_cols = input_cols + output_cols
    summary = df[display_cols].describe().transpose()
    
    print("
[원본 데이터 통계]")
    print(summary[['count', 'mean', 'std', 'min', 'max']])
    
    print("
[정규화 정보 (Min/Max)]")
    for col, values in stats.items():
        if col in display_cols:
            print(f"- {col}: min={values['min']:.4f}, max={values['max']:.4f}")
    print("------------------------------------")


if __name__ == "__main__":
    try:
        supabase_client = get_supabase_client()
        raw_df = fetch_valid_data(supabase_client)

        if not raw_df.empty:
            normalized_df, inputs, outputs, norm_stats = normalize_data(raw_df)
            save_to_hdf5(normalized_df, inputs, outputs)
            print_summary_report(normalized_df, norm_stats, inputs, outputs)
            
            print("
작업이 성공적으로 완료되었습니다.")
            print("생성된 파일: export_dataset.py, requirements.txt, meta_atom_dataset.h5")
            print("
[다음 단계]")
            print("1. Python 가상환경을 생성하고 활성화하세요: python -m venv .venv && source .venv/bin/activate")
            print("2. pip install -r requirements.txt 명령어로 라이브러리를 설치하세요.")
            print("3. .env 파일을 프로젝트 루트에 생성하고 Supabase 접속 정보를 추가하세요.")
            print("   SUPABASE_URL=YOUR_SUPABASE_URL")
            print("   SUPABASE_KEY=YOUR_SUPABASE_KEY")
            print("4. python export_dataset.py 스크립트를 실행하여 HDF5 파일을 생성하세요.")

    except (EnvironmentError, ValueError, Exception) as e:
        print(f"
오류가 발생했습니다: {e}")
