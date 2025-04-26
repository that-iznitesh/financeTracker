from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load trained pipeline
model = joblib.load("category_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    title = data.get("title", "")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    # Predict probabilities
    probs = model.predict_proba([title])[0]
    max_prob = max(probs)
    prediction = model.classes_[probs.argmax()]

    # 👇 Confidence threshold logic
    if max_prob < 0.5:
        prediction = "Other"

    return jsonify({
        "category": prediction
        # "confidence": round(max_prob, 2)
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)