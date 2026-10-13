import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.train_classifier import train_and_save_model

if __name__ == "__main__":
    print("=" * 60)
    print("AquaFlow Machine Learning Training Pipeline")
    print("Model: TF-IDF Vectorizer + Multinomial Logistic Regression")
    print("Task: Complaint Category Classification (Leakage / Shortage / Quality)")
    print("=" * 60)
    acc, report = train_and_save_model()
    print("=" * 60)
    print(f"Training successfully completed with accuracy: {acc * 100:.2f}%")
    print("=" * 60)
