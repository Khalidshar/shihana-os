from fastapi import FastAPI, HTTPException, UploadFile, File
import os
import shutil
import tempfile
from pydantic import BaseModel

app = FastAPI(title="ShihanaOS Saudi Speech Hub", version="0.2.0")

class AudioSynthesizeRequest(BaseModel):
    text: str
    voice_profile: str = "shihana_saudi_dialect"

@app.get("/status")
def speech_status():
    gemini = bool(os.getenv("GEMINI_API_KEY"))
    piper = shutil.which("piper")
    whisper = False
    try:
        import faster_whisper
        whisper = True
    except Exception:
        pass
    markitdown = False
    try:
        import markitdown
        markitdown = True
    except Exception:
        pass
    return {
        "status": "active",
        "dialect": "saudi",
        "assistant": "شيهانة",
        "stt": "faster-whisper" if whisper else "not_connected",
        "tts": "gemini" if gemini else ("piper" if piper else "text_only"),
        "whisper": whisper,
        "markitdown": markitdown,
    }

@app.post("/v1/audio/speak")
def speak_response(req: AudioSynthesizeRequest):
    piper = shutil.which("piper")
    if piper:
        raise HTTPException(status_code=501, detail="Piper installed but voice rendering is not configured")
    if os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=501, detail="Gemini TTS adapter requires provider configuration")
    raise HTTPException(status_code=501, detail="Text only: no TTS provider is configured")


@app.post("/v1/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        raise HTTPException(status_code=501, detail="STT not configured: faster-whisper is not installed") from exc
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        input_path = tmp.name
    try:
        model_name = os.getenv("SHIHANA_WHISPER_MODEL", "small")
        model = WhisperModel(model_name, device=os.getenv("SHIHANA_WHISPER_DEVICE", "cpu"),
                              compute_type=os.getenv("SHIHANA_WHISPER_COMPUTE", "int8"))
        segments, info = model.transcribe(input_path,
                                          language=None if os.getenv("SHIHANA_WHISPER_LANGUAGE", "auto") == "auto" else os.getenv("SHIHANA_WHISPER_LANGUAGE"),
                                          beam_size=5,
                                          vad_filter=True)
        return {
            "text": "".join(segment.text for segment in segments).strip(),
            "language": info.language,
            "language_probability": info.language_probability,
            "model": model_name,
        }
    finally:
        os.unlink(input_path)


@app.post("/v1/convert")
async def convert_document(file: UploadFile = File(...)):
    try:
        from markitdown import MarkItDown
    except Exception as exc:
        raise HTTPException(status_code=501, detail="Document conversion not configured: MarkItDown is not installed") from exc
    suffix = os.path.splitext(file.filename or "document")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        input_path = tmp.name
    try:
        result = MarkItDown().convert(input_path)
        return {"text": result.text_content, "source": file.filename}
    finally:
        os.unlink(input_path)
