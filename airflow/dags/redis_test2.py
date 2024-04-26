# 예제 DAG 파일 (my_dag.py)

from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
from celery import Celery
from airflow.providers.redis.hooks.redis import RedisHook

import redis
import logging
import pendulum
from datetime import datetime, timedelta

log = logging.getLogger(__name__)
# timezone 한국시간으로 변경
kst = pendulum.timezone("Asia/Seoul")

# Celery 설정
app = Celery('redis_test2', broker='redis://localhost:6379/0')

# Redis 클라이언트 설정
# redis_client = redis.StrictRedis(host='redis', port=6379, db=0, password='qwe1212!Q')

# DAG 설정
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1, tzinfo=kst),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'redis_test2',
    default_args=default_args,
    schedule_interval=timedelta(days=1),
    catchup=False,
)

# Task 1: 시작
start_task = DummyOperator(
    task_id='start_task',
    dag=dag,
)

# Task 2: Python 함수 실행
def my_python_function():
    # Redis에 메시지 보내기
    # redis_client.set('test2', 'Hello from my Python function!')
    # log.info(redis_client.get('test'))
    redis_hook = RedisHook(redis_conn_id="redis_default")
    rdb = redis_hook.get_conn()

    rdb.set('test2', 'Hello from my Python function!')
    log.info(rdb.get('test'))

python_task = PythonOperator(
    task_id='python_task',
    python_callable=my_python_function,
    dag=dag,
)

# Task 3: 끝
end_task = DummyOperator(
    task_id='end_task',
    dag=dag,
)

# Task 순서 정의
start_task >> python_task >> end_task
