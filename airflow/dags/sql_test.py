from airflow import DAG
from airflow.sensors.sql import SqlSensor

import logging
import pendulum
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from tabcloudit.operators.tabcloudit_db_operator import TabclouditDbOperator

# timezone 한국시간으로 변경
kst = pendulum.timezone("Asia/Seoul")

log = logging.getLogger(__name__)

# 기본 args 생성
default_args = {
    'owner' : 'Hello World',
    'email' : ['airflow@airflow.com'],
    'email_on_failure': False,
}

dag = DAG(
    'sql_test',
    default_args=default_args,
    start_date=datetime(2022, 6,21, tzinfo=kst),
    schedule_interval=timedelta(days=1),
    catchup=False,
)

def test_query(session: Session, **kwargs):
    results = session.execute('SELECT ID, IP, STATUS FROM ip_pool_address').fetchall()
    conv_results = [dict(row) for row in results]
    log.info(conv_results)

sql_sensor_task = SqlSensor(
    task_id='sql_sensor_task',
    conn_id='tabcloudit-dev-db',  # 데이터베이스 연결 ID
    sql='SELECT COUNT(*) FROM ip_pool_address',  # 감시할 쿼리
    mode='poke',  # 'poke' 또는 'reschedule' 중 선택
    timeout=600,  # 타임아웃 (초 단위)
    poke_interval=60,  # 'poke' 모드에서 쿼리 감시 간격 (초 단위)
    dag=dag  # Airflow DAG 객체
)

db_task = TabclouditDbOperator(
    task_id='tabclodit_dev_test',
    conn_id='tabcloudit-dev-db',
    python_callable=test_query,
    provide_context=True,
    dag=dag
)

# DAG에 추가 
sql_sensor_task >> db_task