import os
from flask import Flask, request, send_from_directory, jsonify
from werkzeug.utils import secure_filename
import torchaudio
from openunmix import predict
from moviepy.editor import VideoFileClip
import time

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

def extract_audio_from_video(video_path, audio_path):
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)

def load_audio(file_path):
    waveform, sample_rate = torchaudio.load(file_path)
    return waveform, sample_rate

def separate_sources(waveform, sample_rate):
    model = predict.separate(waveform, sample_rate)
    vocals = model['vocals']
    drums = model['drums']
    bass = model['bass']
    other = model['other']
    return vocals, drums, bass, other

def combine_sources(vocals, drums, other):
    combined = vocals + drums + other
    return combined

def save_audio(waveform, sample_rate, file_path):
    torchaudio.save(file_path, waveform, sample_rate)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify(success=False), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Extract audio if the file is an MP4 video
    if filename.endswith('.mp4'):
        audio_path = file_path.rsplit('.', 1)[0] + '.wav'
        extract_audio_from_video(file_path, audio_path)
    else:
        audio_path = file_path

    # Simulate progress
    progress = 0
    for _ in range(10):
        time.sleep(1)  # Simulate work being done
        progress += 10

    waveform, sample_rate = load_audio(audio_path)
    vocals, drums, bass, other = separate_sources(waveform, sample_rate)
    combined_waveform = combine_sources(vocals, drums, other)
    
    processed_filename = 'processed_' + os.path.basename(audio_path)
    processed_file_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
    save_audio(combined_waveform, sample_rate, processed_file_path)

    return jsonify(success=True, filepath=f'/processed/{processed_filename}'), 200

@app.route('/processed/<filename>')
def download_file(filename):
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename)

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(PROCESSED_FOLDER, exist_ok=True)
    app.run(debug=True)
