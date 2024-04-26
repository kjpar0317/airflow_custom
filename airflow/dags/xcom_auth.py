from __future__ import annotations

from airflow import DAG
from airflow.decorators import task
from airflow.models.xcom_arg import XComArg
from airflow.operators.python_operator import PythonOperator
from airflow.hooks.http_hook import HttpHook
from airflow.operators.bash import BashOperator
from airflow.models import Variable

import pendulum
import json
from datetime import datetime

# timezone 한국시간으로 변경
kst = pendulum.timezone("Asia/Seoul")

@task
def get_keycloak_token(ti=None):   
    oauth_list = json.loads(Variable.get('oauth_list'))
    keycloak_info = None

    for oauth_info in oauth_list:
        print(dict(oauth_info))
        if oauth_info['name'] == 'keycloak':
            keycloak_info = oauth_info

    # Keycloak 서버에서 토큰을 가져오는 로직을 작성
    http_hook = HttpHook(method='POST', http_conn_id='keycloak_conn')
    
    form_data = {
        'grant_type': 'client_credentials',
        'client_id': keycloak_info['remote_app']['client_id'],
        'client_secret': keycloak_info['remote_app']['client_secret']
    }

    response = http_hook.run('/token', data= form_data, headers= {'Content-Type': 'application/x-www-form-urlencoded'})

    keycloak_token = response.json()['access_token']

    # XCom을 사용하여 토큰을 다른 DAG와 공유
    ti.xcom_push(key='keycloak_token', value=keycloak_token)

@task
def use_keycloak_token(ti=None):
    keycloak_token = ti.xcom_pull(task_ids='get_keycloak_token', key='keycloak_token')

    print(f'Using Keycloak token: {keycloak_token}')

with DAG(
    'xcom_auth',
    start_date=datetime(2015, 1, 1),
    schedule_interval="@once",
    catchup=False,
    tags=["xcom"]
) as dag:

    use_keycloak_token() << get_keycloak_token()