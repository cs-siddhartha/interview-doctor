from fastapi import FastAPI

from app.routers import api


def create_app() -> FastAPI:
    app = FastAPI(
        title="Interview Doctor API",
        version="0.1.0",
        description="Mock-first API for voice AI interview sessions.",
    )
    app.include_router(api.router)

    return app


app = create_app()
