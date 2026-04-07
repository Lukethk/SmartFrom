from redis import Redis
from rq import Connection, Worker

from app.core.config import settings


def run() -> None:
    redis_conn = Redis.from_url(settings.redis_url)
    with Connection(redis_conn):
        worker = Worker(["smartform"])
        worker.work()


if __name__ == "__main__":
    run()
