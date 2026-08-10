from fastapi import FastAPI

app = FastAPI(
    title="CivicAI API",
    description="AI-powered constituency development planning platform",
    version="0.1.0",
)

@app.get("/")
def root():
    return {
            "message": "CivivAI Backend Running!",
            "version": "0.1.0"
            }