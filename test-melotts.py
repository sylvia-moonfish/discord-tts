from melotts.melo.api import TTS

speed = 1.0
device = 'cpu'

text = "안녕하세요! 오늘은 날씨가 정말 좋네요. 영어 알파벳 테스트 ABCD."
model = TTS(language='KR', device=device)
speaker_ids = model.hps.data.spk2id

output_path = 'kr.wav'
model.tts_to_file(text, speaker_ids['KR'], output_path, speed=speed)