
import os
import numpy as np
import pandas as pd
from supabase import create_client, Client
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from dotenv import load_dotenv
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data_from_supabase() -> pd.DataFrame | None:
    """
    Supabase의 meta_atom_dataset 테이블에서 데이터를 로드하고 전처리합니다.
    """
    load_dotenv()
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        logging.error("Supabase URL 또는 Key가 .env 파일에 설정되지 않았습니다.")
        return None

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        response = supabase.table("meta_atom_dataset").select("transmission, phase, frequency, parameters").execute()
        
        if response.data:
            logging.info(f"{len(response.data)}개의 데이터를 Supabase에서 로드했습니다.")
            df = pd.DataFrame(response.data)
            parameters_df = df['parameters'].apply(pd.Series)
            df = pd.concat([df.drop(['parameters'], axis=1), parameters_df], axis=1)
            # 데이터 타입이 object일 경우 numeric으로 변환
            for col in parameters_df.columns:
                if df[col].dtype == 'object':
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            df.dropna(inplace=True) # 변환 실패한 행 제거
            return df
        else:
            logging.warning("데이터를 불러오지 못했습니다.")
            return None
    except Exception as e:
        logging.error(f"Supabase 데이터 로드 중 오류 발생: {e}")
        return None

def train_model(df: pd.DataFrame, features: list, target: str) -> tuple[MLPRegressor, StandardScaler] | None:
    """
    주어진 데이터로 MLP 회귀 모델을 학습시킵니다.
    """
    if not all(feature in df.columns for feature in features):
        logging.error(f"데이터에 필요한 모든 특징(features)이 없습니다. 필요: {features}")
        return None
    
    logging.info("모델 학습을 시작합니다...")
    X = df[features]
    y = df[target]

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    mlp = MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42, early_stopping=True, n_iter_no_change=15)
    mlp.fit(X_train_scaled, y_train)

    logging.info(f"모델 학습 완료. 최종 Loss (MSE): {mlp.loss_:.4f}")
    return mlp, scaler

def find_sparse_regions(df: pd.DataFrame, parameters: list, n_bins: int = 5, threshold: int = 1) -> list[dict]:
    """
    파라미터 공간에서 데이터가 희소한 구간을 찾아 중심점을 반환합니다.
    (1)번 요구사항: 데이터 희소 구간 탐색
    """
    logging.info(f"'{parameters}' 파라미터 공간에서 희소 구간 탐색을 시작합니다 (구간 당 데이터 < {threshold}개).")
    
    data = df[parameters].values
    H, edges = np.histogramdd(data, bins=n_bins)

    sparse_bin_indices = np.argwhere(H < threshold)
    
    if len(sparse_bin_indices) == 0:
        logging.info("데이터가 희소한 구간을 찾지 못했습니다.")
        return []

    midpoints = []
    for indices in sparse_bin_indices:
        midpoint = {}
        for i, (param_name, index) in enumerate(zip(parameters, indices)):
            midpoint[param_name] = (edges[i][index] + edges[i][index + 1]) / 2
        midpoints.append(midpoint)
        
    logging.info(f"총 {len(midpoints)}개의 희소 구간을 찾았습니다.")
    return midpoints

def generate_and_insert_jobs(sparse_midpoints: list[dict], n_jobs: int, supabase_client: Client):
    """
    희소 구간의 중심점으로 새로운 시뮬레이션 작업을 생성하여 DB에 삽입합니다.
    (2)번 요구사항: 신규 시뮬레이션 작업 100개 생성 및 삽입
    """
    if not sparse_midpoints:
        logging.info("새로운 작업을 생성할 희소 구간이 없습니다.")
        return

    n_to_generate = min(n_jobs, len(sparse_midpoints))
    # 희소 구간 리스트에서 무작위로 선택하여 다양성 확보
    selected_indices = np.random.choice(len(sparse_midpoints), n_to_generate, replace=False)
    
    new_jobs = [{"parameters": sparse_midpoints[i], "status": "pending"} for i in selected_indices]
    
    logging.info(f"{len(new_jobs)}개의 신규 시뮬레이션 작업을 생성합니다.")

    try:
        supabase_client.table("simulation_jobs").insert(new_jobs).execute()
        logging.info("성공적으로 신규 작업들을 'simulation_jobs' 테이블에 삽입했습니다.")
    except Exception as e:
        logging.error(f"신규 작업 삽입 중 오류 발생: {e}")

def report_high_error_parameters(model: MLPRegressor, scaler: StandardScaler, df: pd.DataFrame, features: list, target: str, top_percent: int = 10):
    """
    모델의 예측 오차가 가장 큰 상위 N% 데이터의 파라미터 범위를 리포트합니다.
    (3)번 요구사항: 오차 상위 10% 파라미터 범위 리포트
    """
    logging.info(f"모델 예측 오차 상위 {top_percent}%의 파라미터 범위 분석을 시작합니다.")
    
    X = df[features]
    y_true = df[target]

    X_scaled = scaler.transform(X)
    y_pred = model.predict(X_scaled)
    
    df['error'] = np.abs(y_true - y_pred)
    
    error_threshold = df['error'].quantile(1 - (top_percent / 100))
    
    high_error_df = df[df['error'] >= error_threshold]
    
    if high_error_df.empty:
        logging.warning("오차 상위 데이터가 없습니다. 오차 임계값을 확인하세요.")
        return

    logging.info(f"총 {len(high_error_df)}개의 오차 상위 데이터를 분석했습니다.")
    
    print("\n--- AI 모델 예측 오차 상위 10% 파라미터 범위 리포트 ---")
    print(high_error_df[features].describe())
    print("----------------------------------------------------\n")


def main():
    """
    (4)번 요구사항: 정보 획득 효율 극대화를 위한 자동화 파이프라인
    """
    # --- 파이프라인 설정 ---
    PARAMETER_FEATURES = [col for col in ['r1', 'r2', 'l1', 'frequency']]
    TARGET_VARIABLE = 'phase'
    N_BINS_FOR_SPARSITY_CHECK = 5  # 파라미터 공간을 나눌 구간 수
    SPARSITY_THRESHOLD = 2         # 셀 당 데이터 개수 임계값
    N_NEW_JOBS_TO_GENERATE = 100   # 생성할 신규 작업 수
    # ---------------------

    logging.info("정보 획득 자동화 파이프라인을 시작합니다.")
    
    # 1. 데이터 로드
    df = load_data_from_supabase()
    if df is None or df.empty:
        logging.error("데이터가 없어 파이프라인을 중단합니다.")
        return
    
    # PARAMETER_FEATURES가 df의 컬럼에 있는지 확인
    valid_parameter_features = [f for f in PARAMETER_FEATURES if f in df.columns]
    if len(valid_parameter_features) != len(PARAMETER_FEATURES):
        logging.error(f"데이터에 필요한 파라미터 컬럼이 부족합니다. 필요: {PARAMETER_FEATURES}, 사용 가능: {valid_parameter_features}")
        return

    # 2. 모델 학습
    model, scaler = train_model(df, features=valid_parameter_features, target=TARGET_VARIABLE)
    if model is None:
        logging.error("모델 학습에 실패하여 파이프라인을 중단합니다.")
        return

    # 3. 희소 구간 분석 (요구사항 1)
    sparse_midpoints = find_sparse_regions(
        df, 
        parameters=valid_parameter_features, 
        n_bins=N_BINS_FOR_SPARSITY_CHECK,
        threshold=SPARSITY_THRESHOLD
    )

    # 4. 신규 작업 생성 및 삽입 (요구사항 2)
    load_dotenv()
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if supabase_url and supabase_key:
        supabase_client = create_client(supabase_url, supabase_key)
        generate_and_insert_jobs(sparse_midpoints, N_NEW_JOBS_TO_GENERATE, supabase_client)
    else:
        logging.error("Supabase 클라이언트를 초기화할 수 없어 신규 작업을 생성하지 못했습니다.")

    # 5. 오차 상위 파라미터 리포트 (요구사항 3)
    report_high_error_parameters(
        model, 
        scaler, 
        df, 
        features=valid_parameter_features, 
        target=TARGET_VARIABLE, 
        top_percent=10
    )

    logging.info("정보 획득 자동화 파이프라인 실행이 완료되었습니다.")


if __name__ == "__main__":
    main()
