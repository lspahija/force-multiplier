import base64
import logging
import os

from fastapi import FastAPI, UploadFile, HTTPException
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

from backend import stt
from force_multiplier import apply_feedback, InadequateFeedbackException

logging.basicConfig(level=logging.INFO)
app = FastAPI()


class DocumentFeedback(BaseModel):
    document: str
    document_is_code: bool
    feedback: str


@app.post("/transcribe")
async def transcribe(audio: UploadFile):
    return {
        "feedback": await stt.transcribe(audio)
    }


@app.post("/modify")
async def modify_document(document_feedback: DocumentFeedback):
    try:
        modified_document = apply_feedback(
            document=_decode(document_feedback.document),
            document_is_code=document_feedback.document_is_code,
            feedback=_decode(document_feedback.feedback)
        )

        return {
            "modified_document": modified_document,
        }

    except InadequateFeedbackException as e:
        raise HTTPException(status_code=400, detail=str(e))


if os.path.isdir("/app/frontend/dist"):
    app.mount("/", StaticFiles(directory="/app/frontend/dist", html=True), name="static")


def _decode(string: str) -> str:
    return base64.b64decode(string).decode('utf-8')
