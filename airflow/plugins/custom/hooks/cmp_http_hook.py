from airflow.hooks.base import BaseHook
from airflow.hooks.http_hook import HttpHook

from typing import Dict, Any

common_header = {'Content-Type': 'application/json'}

class CmpHttpHook(BaseHook):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
    
    def get(self, url: str, params: Dict[str, Any]) -> Any:
        http_hook = HttpHook(method="GET", http_conn_id="cmp_http")
        response = http_hook.run(url, data=params, headers=common_header)
        return response.json()

    def post(self, url: str, body: Dict[str, Any]) -> Any:
        http_hook = HttpHook(method="POST", http_conn_id="cmp_http")
        response = http_hook.run(url, data=body, headers=common_header)
        return response.json()

    def put(self, url: str, params: Dict[str, Any]) -> Any:
        http_hook = HttpHook(method="PUT", http_conn_id="cmp_http")
        response = http_hook.run(url, data=params, headers=common_header)
        return response.json()

    def delete(self, url: str, params: Dict[str, Any]) -> Any:
        http_hook = HttpHook(method="DELETE", http_conn_id="cmp_http")
        response = http_hook.run(url, data=params, headers=common_header)
        return response.json()