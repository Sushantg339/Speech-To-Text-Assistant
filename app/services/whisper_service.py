import whisper
import tempfile
import os
import subprocess

model = whisper.load_model("base")

def transcribe_audio(file):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        file.save(temp.name)
        input_path = temp.name

    output_path = input_path + ".wav"

    subprocess.run([
        "ffmpeg",
        "-i", input_path,
        "-ac", "1",        
        "-ar", "16000",    
        "-f", "wav",
        output_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    result = model.transcribe(output_path)

    os.remove(input_path)
    os.remove(output_path)

    return result["text"]