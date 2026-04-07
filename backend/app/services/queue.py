from rq import Queue
from rq.job import Job
from redis import Redis

from app.core.config import settings

redis_conn = Redis.from_url(settings.redis_url)
processing_queue = Queue("smartform", connection=redis_conn, default_timeout=600)


def enqueue_document_job(document_id: str, template_id: str, filename: str, mime_type: str, file_b64: str) -> Job:
    return processing_queue.enqueue(
        "app.workers.tasks.process_document_job",
        document_id,
        template_id,
        filename,
        mime_type,
        file_b64,
    )
