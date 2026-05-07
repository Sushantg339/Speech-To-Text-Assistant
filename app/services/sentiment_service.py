from transformers import pipeline

sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

LABELs =  {
    "LABEL_0" : "Negative",
    "LABEL_1" : "Neutral",
    "LABEL_2" : "Positive"
}

def analyze_sentiment(text):
    result = sentiment_pipeline(text)[0]

    return {
        "label": LABELs[result["label"]],
        "confidence": float(result["score"])
    }