import logging
from time import perf_counter

from dotenv import load_dotenv
from fastapi import FastAPI, Request

from app.routers import api

load_dotenv()


# Configures the application logger independently from Uvicorn so lifecycle
# messages remain visible under the development server and direct app runners.
def configure_application_logging() -> None:
    application_logger = logging.getLogger("interview_doctor")
    application_logger.setLevel(logging.INFO)
    application_logger.propagate = False

    if application_logger.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s",
        )
    )
    application_logger.addHandler(handler)


configure_application_logging()
logger = logging.getLogger("interview_doctor.api")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Interview Doctor API",
        version="0.1.0",
        description="API for configurable voice AI interview sessions.",
    )
    app.include_router(api.router)

    @app.middleware("http")
    async def log_request(request: Request, call_next):
        """Log one summary line for every backend HTTP request."""
        started_at = perf_counter()
        logger.info(
            "[backend.http] request started method=%s path=%s",
            request.method,
            request.url.path,
        )

        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "[backend.http] request failed method=%s path=%s duration_ms=%.1f",
                request.method,
                request.url.path,
                (perf_counter() - started_at) * 1000,
            )
            raise

        logger.info(
            "[backend.http] request completed method=%s path=%s "
            "status=%s duration_ms=%.1f",
            request.method,
            request.url.path,
            response.status_code,
            (perf_counter() - started_at) * 1000,
        )
        return response

    return app


app = create_app()
