import logging
import os

from fastapi import FastAPI, UploadFile, Header
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from force_multiplier import apply_feedback
from stt import transcribe

logging.basicConfig(level=logging.INFO)
app = FastAPI()

origins = [
    "http://127.0.0.1",
    "http://localhost",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


class DocumentFeedback(BaseModel):
    document: str
    feedback: str


@app.post("/modify")
async def modify_document(audio: UploadFile, document: str = Header(default=None)):
    feedback = await transcribe(audio)
    modified_document = apply_feedback(document, feedback)

    return {
        "feedback": feedback,
        "modified_document": modified_document,
    }


@app.get("/test")
async def test():
    return "hello world"


@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")


if os.path.isdir("/app/frontend/dist"):
    app.mount("/", StaticFiles(directory="/app/frontend/dist"), name="static")
