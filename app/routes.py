from flask import Blueprint, render_template, request, jsonify
from app.services.whisper_service import transcribe_audio
from app.services.sentiment_service import analyze_sentiment

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files.get("audio")

    if not file:
        return jsonify({"error": "No file"}), 400

    text = transcribe_audio(file)
    sentiment = analyze_sentiment(text)

    return jsonify({
        "text": text,
        "sentiment": sentiment
    })