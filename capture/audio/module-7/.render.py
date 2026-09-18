
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

kokoro = Kokoro("/Users/waky/.kokoro/kokoro-v1.0.onnx", "/Users/waky/.kokoro/voices-v1.0.bin")
for item in json.loads(sys.stdin.read()):
    samples, rate = kokoro.create(item["text"], voice="af_heart", speed=0.95, lang="en-us")
    sf.write(item["path"], samples, rate)
    print(item["id"], flush=True)
