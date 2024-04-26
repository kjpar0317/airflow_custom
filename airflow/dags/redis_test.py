from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
from airflow.contrib.sensors.redis_key_sensor import RedisKeySensor
from airflow.utils.trigger_rule import TriggerRule
from airflow.providers.redis.hooks.redis import RedisHook

import redis
import pendulum
import logging
from datetime import datetime, timedelta

log = logging.getLogger(__name__)
# timezone 한국시간으로 변경
kst = pendulum.timezone("Asia/Seoul")

# DAG 설정
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1, tzinfo=kst),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'redis_key_sensor_test',
    default_args=default_args,
    schedule_interval=timedelta(minutes=5),
    catchup=False,
)

# Task 1: 시작
start_task = DummyOperator(
    task_id='start_task',
    dag=dag,
)

# Task 2: RedisKeySensor (특정 키의 값이 변경되는 것을 캐치)
redis_key_sensor_task = RedisKeySensor(
    task_id='redis_key_sensor_task',
    redis_conn_id='redis_default',
    key='test',    # 캐치할 Redis 키
    mode='poke',  # poke 모드: 주기적으로 Redis 키를 확인
    timeout=600,  # 타임아웃 설정 (초)
    dag=dag,
)

# Task 3: 끝
end_task = DummyOperator(
    task_id='end_task',
    trigger_rule=TriggerRule.ALL_DONE,
    dag=dag,
)

# Redis 연결 정보
# redis_host = 'redis'
# redis_port = 6379
# redis_db = 0
# redis_passwd = 'qwe1212!Q'

def extract_redis_value(**kwargs):
    # Redis 연결
    # r = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db, password= redis_passwd)

    # 특정 키의 값을 가져옴
    # key = 'test'
    # value = r.get(key)

    redis_hook = RedisHook(redis_conn_id="redis_default")
    rdb = redis_hook.get_conn()

    key = 'test'
    value = rdb.get(key)
    
    # 로그에 값 출력
    log.info(f"Value for key '{key}': {value}")

# PythonOperator로 Redis 값 추출
extract_value_task = PythonOperator(
    task_id='extract_value_task',
    python_callable=extract_redis_value,
    provide_context=True,
    dag=dag,
)

# Task 실행 순서 설정
start_task >> redis_key_sensor_task >> extract_value_task >> end_task