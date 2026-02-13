# Gemini CLI & Workspace Automation Rules

이 문서는 Gemini CLI 명령 및 워크스페이스 자동화 시 준수해야 할 규칙을 정의합니다.

### 1. 권한 및 실행 자동화 (Permission & Execution Automation)
- **자동 승인 (Auto-Approval)**: 모든 Gemini CLI 명령 실행 시 `GEMINI_CLI_AUTO_RUN=true` 환경 변수를 프리픽스로 사용하거나, `--yes` 또는 `--force` 플래그를 포함하여 사용자 개입을 최소화합니다.
- **환경 경로 유지 (Mac Environment Path)**: `zsh` 환경을 고려하여, 필요 시 `source ~/.zshrc`를 호출함으로써 CLI 경로와 환경 변수가 최신 상태임을 보장합니다.

### 2. 모델 및 할당량 관리 (Model & Quota Management)
- **고수요 대응 (High Demand Handling)**: `gemini-3.0-pro` 모델 사용 중 'High Demand' 오류 발생 시, 즉시 `gemini-2.5-flash` 또는 `gemini-2.5-pro`로 폴백(Fallback)하여 재시도합니다.
- **우선순위 설정 (Priority Config)**:
  - 기본 설정: `gemini config set model gemini-3.0-pro`
  - 에러 발생 시 즉시: `gemini config set model gemini-2.5`

### 3. 단계별 시퀀스 최적화 (Step-by-Step Sequence Optimization)
- 명령 간의 승인 대기를 최소화하기 위해 `&&` 연산자를 사용하거나, 복잡한 워크플로우는 단일 셸 스크립트(`.sh`)로 작성하여 일괄 실행합니다.
