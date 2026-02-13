# Gemini CLI Execution Protocol (Strict)

이 문서는 Gemini CLI 명령 실행 시 사용자 개입 최소화와 안정성을 극대화하기 위한 엄격한 규칙을 정의합니다.

### 1. 권한 우회 및 즉각 실행 (Permission Bypass)
- **--yolo 플래그 고정**: 모든 `gemini` 명령 실행 시 반드시 `--yolo` (또는 `-y`) 플래그를 접미사로 붙여 실행합니다. 이는 사용자의 "Allow Once" 승인 절차를 생략하고 즉시 실행하기 위함입니다.
- **예시**: `gemini run "task" --model gemini-3.0-pro --yolo`

### 2. 모델 가용성 및 자동 폴백 (Model Availability & Fallback)
- **동적 가용성 대응**: `gemini-3.0-pro` 모델로 시도하는 중 다음 오류가 감지되면 사용자 보고 없이 즉시 폴백을 수행합니다.
  - 감지 키워드: "High Demand", "Quota Exceeded", "Error 429"
- **폴백 순서**:
  1. `gemini-3.0-pro` (실패 시)
  2. `gemini-2.5-flash` (즉시 재시도)
- **자동화 루프**: 결과가 성공적으로 반환될 때까지 사용자에게 다시 묻지 않고 위 프로세스를 자동으로 반복합니다.

### 3. 환경 최적화 (Optimization)
- 실행 지연을 줄이기 위해 가능한 한 명령 간의 결합(`&&`)을 사용하며, 복잡한 단계는 단일 셸 세션 내에서 처리합니다.

