from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.submissions import router as submission_router

app = FastAPI(
    title="CivicAI API",
    description="AI-powered constituency development planning platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submission_router)


@app.get("/")
def root():
    return {
        "message": "CivicAI API is running",
        "version": "0.1.0"
    }