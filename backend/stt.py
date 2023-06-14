import logging
import os
import shutil
import time
import uuid

import ffmpeg
import openai
from whispercpp import Whisper

w = Whisper.from_pretrained("base.en")

LANGUAGE = os.getenv("LANGUAGE", "en")


def delete_file(filepath: str):
    os.remove(filepath)


async def transcribe(audio):
    start_time = time.time()
    initial_filepath = f"/tmp/{uuid.uuid4()}{audio.filename}"

    with open(initial_filepath, "wb+") as file_object:
        shutil.copyfileobj(audio.file, file_object)

    converted_filepath = f"/tmp/ffmpeg-{uuid.uuid4()}{audio.filename}"

    logging.debug("running through ffmpeg")
    (
        ffmpeg
        .input(initial_filepath)
        .output(converted_filepath, loglevel="error")
        .run()
    )
    logging.debug("ffmpeg done")

    delete_file(initial_filepath)

    # read_file = open(converted_filepath, "rb")

    logging.debug("calling whisper")
    # transcription = (await openai.Audio.atranscribe("whisper-1", read_file, language=LANGUAGE))["text"]
    transcription = w.transcribe_from_file(converted_filepath)
    logging.info("STT response received from whisper in %s %s", time.time() - start_time, 'seconds')
    logging.info('user prompt: %s', transcription)

    delete_file(converted_filepath)

    return transcription
