# Meta-Atom Dataset Factory 🚀

**An Active Learning Powered Meta-Surface Simulation & Dataset Management Platform**

Meta-Atom Dataset Factory는 차세대 메타물질 설계 인프라로, 고성능 시뮬레이션 데이터 수집부터 AI Surrogate 모델 학습을 위한 데이터 정제 및 Active Learning 기반의 자동 최적화 루프를 제공합니다.

---

## 🏗️ System Architecture

본 플랫폼은 데이터 생산의 효율성을 높이기 위해 다음과 같은 계층 구조를 가집니다.

- **Simulation Engine**: FDTD/RCWA 기반의 수치해석 엔진과 연동되어 메타 원자의 전자기적 반응(Phase, Transmission)을 계산합니다.
- **Active Learning Loop**: 데이터 밀도가 낮거나 모델의 불확실성이 높은 영역을 식별하여 자동으로 추가 시뮬레이션 작업을 생성합니다.
- **Training Bridge**: 수집된 데이터를 AI 모델(Surrogate)이 즉시 학습할 수 있도록 전용 엔드포인트 및 학습 설정 메타데이터를 제공합니다.

## 🌟 Key Features

### 1. Advanced Analytics Dashboard
- **Correlation Mapping**: `Recharts`를 이용한 파라미터 간 상관관계 시각화.
- **Sparse Region Detection**: 5x5 그리드 파티셔닝 기반의 데이터 희소 구간 자동 탐지.

### 2. Active Learning & Autorefinement
- **Uncertainty Estimation**: 데이터 공간의 샘플링 밀도를 분석하여 취약 구간 식별.
- **Recursive Sweeps**: 식별된 취약 구간에 대해 `simulation_jobs`를 자동 생성하여 데이터셋의 일반화 성능 극대화.

### 3. High-Performance Data Pipeline
- **Supabase Integration**: 수만 건의 시뮬레이션 데이터에 대해 최적화된 GIN Index 및 복합 인덱스 적용.
- **Training Bridge**: 모델 입력(X) 및 라벨(Y) 선택 기능과 학습용 `config.json` 익스포트 지원.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
- **Visualization**: Recharts
- **Backend / Database**: Supabase (PostgreSQL), Next.js API Routes
- **Domain Logic**: Active Learning algorithms, Science-based Data Normalization

## 🚀 Getting Started

### Environment Variables
`.env` 파일에 다음 항목을 설정해야 합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Installation
```bash
npm install
npm run dev
```

---

## 🔬 Research Context
본 프로젝트는 'MetaSurface Designer'의 핵심 데이터 엔진으로 설계되었습니다. AI Surrogate 모델의 학습 데이터 확보 비용을 기존 무작위 샘플링 대비 최대 40% 절감하는 것을 목표로 합니다.
