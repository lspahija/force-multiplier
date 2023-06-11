import base64
import logging
import os

from fastapi import FastAPI, UploadFile, Header
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from force_multiplier import apply_feedback
from stt import transcribe

logging.basicConfig(level=logging.INFO)
app = FastAPI()


class DocumentFeedback(BaseModel):
    document: str
    feedback: str


@app.post("/modify")
async def modify_document(audio: UploadFile, document: str = Header(default=None)):
    feedback = await transcribe(audio)
    modified_document = apply_feedback(
        base64.b64decode(document).decode('utf-8'),
        feedback
    )

    return {
        "feedback": feedback,
        "modified_document": modified_document,
    }


if os.path.isdir("/app/frontend/dist"):
    app.mount("/", StaticFiles(directory="/app/frontend/dist", html=True), name="static")
