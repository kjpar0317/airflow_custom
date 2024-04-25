from airflow.operators.branch import BaseBranchOperator
from airflow.providers.mysql.hooks.mysql import MySqlHook

from typing import Any
from sqlalchemy.orm import sessionmaker, Session

from tabcloudit.hooks.cmp_http_hook import CmpHttpHook

def get_session(conn_id: str) -> Session:
    db_hook = MySqlHook(mysql_conn_id = conn_id)
    engine = db_hook.get_sqlalchemy_engine()
    return sessionmaker(bind = engine)()

class CmpBranchOperator(BaseBranchOperator):
    def __init__(self, conn_id: str, xcom_key: str, choose_branch: Any, *args, **kwargs) -> None:
        self.conn_id = conn_id
        self.xcom_key = xcom_key
        self.args = args
        self.kwargs = kwargs
        self.choose_branch = choose_branch
        super().__init__(*args, **kwargs)

    def execute(self, context) -> Any:
        params = context['ti'].xcom_pull(key = self.xcom_key)
        session = get_session(self.conn_id)
        http = CmpHttpHook()

        try:
            result = self.choose_branch(session = session, http = http, params = params)
            self.skip_all_except(context["ti"], result)
        except Exception:
            session.rollback()
            raise
        session.commit()
        return result 