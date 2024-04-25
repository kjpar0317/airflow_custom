from airflow.hooks.base import BaseHook

from tabcloudit.lib.credential import get_credential

class VmwareHook(BaseHook):
    def __init__(self, name: str, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.name = name
    
    def get_conn(self) -> None:
        self.log.info("여기다가 vmware instance")
    
    def get_vmware(self) -> str:
        self.log.info("테스트입니다.")
        self.log.info(get_credential())
        return "Done"