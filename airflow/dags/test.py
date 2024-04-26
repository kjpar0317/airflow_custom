import pendulum
import logging

from datetime import datetime
from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
from airflow.models import Variable
from tabcloudit.hooks.vmware_hook import VmwareHook

# timezone 한국시간으로 변경
kst = pendulum.timezone("Asia/Seoul")

log = logging.getLogger(__name__)

# 기본 args 생성
default_args = {
    'owner' : 'Hello World',
    'email' : ['airflow@airflow.com'],
    'email_on_failure': False,
}

# DAG 생성 
# 2022/06/21 @once 한번만 실행하는 DAG생성
with DAG(
    dag_id='ex_hello_world',
    start_date=datetime(2022, 6,21, tzinfo=kst),
    catchup=False,
    schedule_interval='@once',
) as dag:

    # python Operator에서 사용할 함수 정의
    def print_hello():
        # ti는 task_instance의 줄임
        log.info(f'receive access token {Variable.get("keycloak_access_info")}')

        vmware_hook= VmwareHook("test_name")
        vmware_hook.get_vmware()

        log.info("end")
  
    t1 = DummyOperator(
        task_id='dummy_task_id',
        retries=5,
    )

    t2 = PythonOperator(
        task_id='Hello_World',
        python_callable=print_hello,
        provide_context=True,
    )

    t1 >> t2
