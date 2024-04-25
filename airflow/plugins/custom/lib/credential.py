import logging

log = logging.getLogger(__name__)

def get_credential() -> str:
    log.info("get credential")
    return "test"
