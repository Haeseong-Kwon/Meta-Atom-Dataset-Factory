# Gemini CLI Automation Protocol (Strict)

이 문서는 Gemini CLI 명령 실행 시 사용자 개입 최소화와 안정성을 극대화하기 위한 엄격한 규칙을 정의합니다.

### 1. 자동 실행 및 권한 우회 (Auto-Execution)
- **명령 플래그 고정**: 모든 `gemini` 명령은 반드시 `-y -p` 플래그를 포함하여 실행합니다. (예: `gemini run "task" -y -p`)
- 이는 사용자의 승인 절차를 생략하고 즉시 프롬프트를 처리하기 위함입니다.

### 2. 고부하 대응 및 자동 모델 전환 (High Demand Handling)
- **실시간 오류 감지**: 실행 결과에 다음 문구가 포함되면 즉시 현재 작업을 중단하고 모델을 전환합니다.
  - 감지 키워드: `"high demand"`, `"Keep trying"`, `"Quota Exceeded"`, `"Error 429"`
- **모델 전환 전략**:
  - 기존 모델이 실패할 경우, 즉시 `gemini-2.5-flash` 또는 `gemini-1.5-pro` 모델로 변경하여 동일한 명령을 재시도합니다.
  - 예시: `gemini -p "코드 리뷰해줘" --model gemini-1.5-pro -y`

### 3. 연속 워크플로우 (Continuous Workflow)
- **무중단 프로세스**: 모델 전환 과정에서 사용자에게 허락을 구하지 말고, 최종 결과가 나올 때까지 자동으로 단계를 진행합니다.
- 실행 지연을 줄이기 위해 명령 간의 결합(`&&`)을 적극 활용합니다.
