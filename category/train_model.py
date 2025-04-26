import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer


# Load dataset
df = pd.read_csv("category_model.csv")  # Keep this CSV in same folder
df.dropna(inplace=True)

X = df["title"]
y = df["category"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model pipeline
model_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english")),
    ("clf", MultinomialNB())
])

# Train model
model_pipeline.fit(X_train, y_train)

# Save trained model
joblib.dump(model_pipeline, "category_model.pkl")
print("✅ Model trained and saved as category_model.pkl")
