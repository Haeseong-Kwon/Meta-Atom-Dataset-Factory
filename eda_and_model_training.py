
import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_squared_error
import numpy as np
from supabase import create_client, Client

# Manual .env file parsing function
def get_env_vars(env_path='.env'):
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key] = value
    return env_vars

def load_data_from_supabase():
    """
    Supabase의 meta_atom_dataset 테이블에서 데이터를 불러옵니다.
    """
    env_vars = get_env_vars(env_path=os.path.join(os.getcwd(), '.env'))
    supabase_url = env_vars.get("SUPABASE_URL")
    supabase_key = env_vars.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        print("Supabase URL 또는 Key가 .env 파일에 설정되지 않았습니다.")
        return None

    supabase: Client = create_client(supabase_url, supabase_key)
    response = supabase.table("meta_atom_dataset").select("transmission", "phase", "frequency", "parameters").execute()
    
    if response.data:
        df = pd.DataFrame(response.data)
        # parameters 컬럼의 내용을 각각의 컬럼으로 펼치기
        parameters_df = df['parameters'].apply(pd.Series)
        df = pd.concat([df.drop(['parameters'], axis=1), parameters_df], axis=1)
        return df
    else:
        print("데이터를 불러오지 못했습니다.")
        return None

def main():
    """
    데이터 분석 및 모델 학습을 수행하는 메인 함수
    """
    df = load_data_from_supabase()

    if df is None:
        return

    print("### 데이터 샘플 ###")
    print(df.head())
    print()

    # 1. 탐색적 데이터 분석 (EDA)
    print("### 1. 탐색적 데이터 분석 (EDA) ###")
    
    # 히트맵 생성
    plt.figure(figsize=(10, 8))
    sns.heatmap(df.corr(), annot=True, cmap='viridis', fmt='.2f')
    plt.title('Feature Correlation Heatmap')
    plt.savefig('heatmap.png')
    print("- 특징(feature) 간의 상관관계 히트맵을 'heatmap.png' 파일로 저장했습니다.")

    # 반지름(r1)과 위상(phase)의 관계
    if 'r1' in df.columns:
        plt.figure(figsize=(10, 6))
        sns.scatterplot(data=df, x='r1', y='phase')
        plt.title('Phase vs. Radius (r1)')
        plt.xlabel('Radius (r1)')
        plt.ylabel('Phase')
        plt.grid(True)
        plt.savefig('phase_vs_radius.png')
        print("- 반지름(r1)과 위상(phase)의 관계를 'phase_vs_radius.png' 파일로 저장했습니다.")
    print()

    # 2. 데이터 불균형 체크
    print("### 2. 데이터 불균형 체크 ###")
    plt.figure(figsize=(10, 6))
    sns.histplot(df['phase'], bins=30, kde=True)
    plt.title('Phase Distribution')
    plt.xlabel('Phase')
    plt.ylabel('Frequency')
    plt.savefig('phase_distribution.png')
    print("- 위상(phase) 데이터 분포 히스토그램을 'phase_distribution.png' 파일로 저장했습니다.")
    
    # 데이터 쏠림 현상 분석
    phase_min = df['phase'].min()
    phase_max = df['phase'].max()
    if df[(df['phase'] < phase_min + (phase_max - phase_min) * 0.1) | (df['phase'] > phase_max - (phase_max - phase_min) * 0.1)].shape[0] > df.shape[0] * 0.5:
        print("- 제안: 위상 데이터가 특정 구간에 편중되어 있을 수 있습니다. 모델 성능 향상을 위해 SMOTE (Synthetic Minority Over-sampling Technique) 같은 오버샘플링 기법을 고려해볼 수 있습니다.")
    else:
        print("- 위상 데이터 분포가 비교적 균일합니다.")
    print()

    # 3. 학습 가시성 테스트 (간단한 MLP 모델)
    print("### 3. 학습 가시성 테스트 ###")
    
    # Feature와 Target 설정
    # 예시: 반지름(r1, r2)과 간격(l1)으로 위상(phase) 예측
    features = [col for col in ['r1', 'r2', 'l1', 'frequency'] if col in df.columns]
    if not features:
        print("- 모델 학습에 필요한 feature (r1, r2, l1, frequency)가 데이터에 없습니다.")
        return

    X = df[features]
    y = df['phase']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 데이터 스케일링
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # MLP 모델 생성 및 학습
    mlp = MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42, early_stopping=True)
    mlp.fit(X_train_scaled, y_train)

    # 학습 곡선 (Loss Curve)
    plt.figure(figsize=(10, 6))
    plt.plot(mlp.loss_curve_)
    plt.title('MLP Model Learning Curve')
    plt.xlabel('Epochs')
    plt.ylabel('Loss (MSE)')
    plt.grid(True)
    plt.savefig('learning_curve.png')
    print("- MLP 모델의 학습 곡선(Learning Curve)을 'learning_curve.png' 파일로 저장했습니다.")

    # 예측 및 평가
    y_pred = mlp.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    print(f"- 테스트 데이터에 대한 최종 예측 오차 (MSE): {mse:.4f}")
    if len(mlp.loss_curve_) > 1 and mlp.loss_curve_[0] > mlp.loss_curve_[-1]:
        print("- 확인: 모델의 예측 오차(Loss)가 학습을 통해 성공적으로 감소했습니다. 데이터에 학습 가능한 패턴이 존재합니다.")
    else:
        print("- 경고: 모델의 예측 오차가 충분히 감소하지 않았습니다. 데이터, 모델 구조, 또는 하이퍼파라미터를 재검토해야 합니다.")

if __name__ == "__main__":
    main()
