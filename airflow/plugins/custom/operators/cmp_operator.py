from airflow.utils.decorators import apply_defaults
from airflow.operators.python_operator import PythonOperator
from airflow.providers.mysql.hooks.mysql import MySqlHook

from typing import Any
from sqlalchemy.orm import sessionmaker, Session

from tabcloudit.hooks.cmp_http_hook import CmpHttpHook

def get_session(conn_id: str) -> Session:
    db_hook = MySqlHook(mysql_conn_id = conn_id)
    engine = db_hook.get_sqlalchemy_engine()
    return sessionmaker(bind = engine)()

class CmpOperator(PythonOperator):
    @apply_defaults
    def __init__(self, conn_id: str, xcom_key: str, *args, **kwargs) -> None:
        self.conn_id = conn_id
        self.xcom_key = xcom_key
        self.args = args
        self.kwargs = kwargs
        super().__init__(*args, **kwargs)

    # def execute_callable(self) -> Any:
    #     context = get_current_context()
    #     params = context['ti'].xcom_pull(key = self.xcom_key)
    #     session = get_session(self.conn_id)
    #     http = CmpHttpHook()

    #     try:
    #         result = self.python_callable(session = session, http = http, params = params)
    #     except Exception:
    #         session.rollback()
    #         raise
    #     session.commit()
    #     return result

    def execute(self, context) -> Any:
        params = context['ti'].xcom_pull(key = self.xcom_key)
        session = get_session(self.conn_id)
        http = CmpHttpHook()

        try:
            result = self.python_callable(session = session, http = http, params = params)
        except Exception:
            session.rollback()
            raise
        session.commit()
        return result   