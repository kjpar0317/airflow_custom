from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.models import Variable
from airflow.hooks.http_hook import HttpHook

import pendulum
import logging
import json
from datetime import datetime

log = logging.getLogger(__name__)
# timezone 한국시간으로 변경
kst = pendulum.timezone("Asia/Seoul")

def get_keycloak_token():   
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

    # keycloak_cron_expression만큼 계속 값 갱신
    Variable.set("keycloak_access_info", keycloak_token)

with DAG(
    dag_id = "set_keyclock_token",
    schedule = Variable.get("keycloak_cron_expression"),
    start_date=datetime(2022, 6, 21, tzinfo=kst),
    catchup=False
) as dag:
    t2 = PythonOperator(
        task_id='get_keycloak_token',
        python_callable=get_keycloak_token,
        provide_context=True,
    )
