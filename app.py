from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/tts")
def tts():
    return jsonify(success=True)