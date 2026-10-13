import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from app.ml.dataset_generator import generate_synthetic_dataset

MODEL_PATH = os.path.join(os.path.dirname(__file__), "complaint_classifier.joblib")

def train_and_save_model():
    print("Generating synthetic complaint dataset...")
    data = generate_synthetic_dataset(samples_per_category=150)  # 450 total samples
    texts = [item[0] for item in data]
    labels = [item[1] for item in data]

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_df=0.95)),
        ('clf', LogisticRegression(C=1.0, max_iter=200, random_state=42))
    ])

    print("Training TF-IDF + Logistic Regression model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)

    print(f"\nModel Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", report)

    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved successfully to {MODEL_PATH}")
    return acc, report

if __name__ == "__main__":
    train_and_save_model()
