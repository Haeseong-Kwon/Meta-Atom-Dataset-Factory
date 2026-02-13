
import os
import time
import random
import logging
from multiprocessing import Pool, cpu_count
from dotenv import load_dotenv
from supabase import create_client, Client

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def process_job(job: dict):
    """
    단일 시뮬레이션 작업을 처리하고 결과를 데이터베이스에 저장합니다.
    """
    job_id = job['id']
    parameters = job['parameters']
    process_id = os.getpid()
    logging.info(f"[Process {process_id}] Job {job_id} 처리 시작. 파라미터: {parameters}")

    # 환경 변수에서 Supabase 접속 정보 로드
    # 각 자식 프로세스는 자체 Supabase 클라이언트를 생성해야 합니다.
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        logging.error(f"[Process {process_id}] Supabase URL 또는 Key가 설정되지 않았습니다.")
        return

    supabase: Client = create_client(supabase_url, supabase_key)

    try:
        # 가상 물리 계산 симуляция
        # 실제 계산 로직으로 대체해야 할 부분입니다.
        logging.info(f"[Process {process_id}] Job {job_id}의 물리 응답 계산 중...")
        time.sleep(random.uniform(1, 4))  # 계산에 시간이 걸리는 것을 시뮬레이션

        # 예시: 파라미터(frequency)에 기반한 가상 결과 생성
        frequency = parameters.get('frequency', 1.0)
        transmission = random.uniform(0.1, 0.99) * (1 / (1 + (frequency/10)**2)) # 주파수에 따른 가상 감쇠
        phase = random.uniform(-180, 180) * (1 - frequency/20) # 주파수에 따른 가상 위상 변이

        logging.info(f"[Process {process_id}] Job {job_id} 계산 완료. 결과: Transmission={transmission:.4f}, Phase={phase:.4f}")

        # 1. 계산 결과를 meta_atom_dataset 테이블에 삽입
        result_data = {
            "job_id": job_id,
            "transmission": transmission,
            "phase": phase,
            "frequency": frequency,
            "parameters": parameters
        }
        supabase.table("meta_atom_dataset").insert(result_data).execute()
        logging.info(f"[Process {process_id}] Job {job_id}의 결과를 meta_atom_dataset에 저장했습니다.")

        # 2. 원래 작업의 상태를 'completed'로 업데이트
        supabase.table("simulation_jobs").update({"status": "completed", "progress": 100}).eq("id", job_id).execute()
        logging.info(f"[Process {process_id}] Job {job_id}의 상태를 'completed'로 업데이트했습니다.")

    except Exception as e:
        logging.error(f"[Process {process_id}] Job {job_id} 처리 중 오류 발생: {e}")
        # 오류 발생 시 작업 상태를 'failed'로 업데이트
        try:
            supabase.table("simulation_jobs").update({
                "status": "failed",
                "error_message": str(e)
            }).eq("id", job_id).execute()
        except Exception as update_e:
            logging.error(f"[Process {process_id}] Job {job_id}의 상태를 'failed'로 업데이트하는 중에도 오류 발생: {update_e}")


def main():
    """
    메인 워커 함수. 'pending' 상태의 작업을 가져와 병렬로 처리합니다.
    """
    load_dotenv()
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        logging.error("Supabase URL 또는 Key가 .env 파일에 설정되지 않았습니다. 스크립트를 종료합니다.")
        return

    supabase: Client = create_client(supabase_url, supabase_key)
    logging.info("워커 시작. 'pending' 상태의 시뮬레이션 작업을 확인합니다...")

    while True:
        try:
            # 'pending' 상태인 작업들을 가져옵니다.
            response = supabase.table("simulation_jobs").select("id, parameters").eq("status", "pending").execute()
            pending_jobs = response.data

            if not pending_jobs:
                logging.info("'pending' 상태의 작업이 없습니다. 5초 후 다시 확인합니다.")
                time.sleep(5)
                continue

            logging.info(f"{len(pending_jobs)}개의 'pending' 작업을 찾았습니다. 병렬 처리를 시작합니다.")

            # 찾은 작업을 'running' 상태로 변경하여 다른 워커가 중복으로 가져가지 않도록 합니다.
            job_ids_to_run = [job['id'] for job in pending_jobs]
            supabase.table("simulation_jobs").update({"status": "running"}).in_("id", job_ids_to_run).execute()
            
            # 멀티프로세싱 풀을 사용하여 병렬로 작업 처리
            # 사용할 CPU 코어 수를 조절할 수 있습니다. (예: cpu_count() - 1)
            num_processes = min(len(pending_jobs), cpu_count())
            with Pool(processes=num_processes) as pool:
                pool.map(process_job, pending_jobs)

            logging.info("모든 작업 처리가 완료되었습니다. 다음 사이클을 시작합니다.")
            time.sleep(2) # 다음 루프 전에 잠시 대기

        except Exception as e:
            logging.error(f"메인 루프에서 오류 발생: {e}")
            time.sleep(10) # 오류 발생 시 잠시 대기 후 재시도

if __name__ == "__main__":
    main()
