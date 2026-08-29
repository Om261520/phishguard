"""
PhishGuard - Machine Learning Model Training & Evaluation
Trains a Random Forest classifier on static URL cybersecurity features,
evaluates precision/recall/F1/confusion matrix, and exports model artifacts.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.feature_extraction import ML_FEATURE_COLUMNS
from ml.dataset.dataset_generator import generate_dataset


def train_phishing_model():
    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "dataset/urls_dataset.csv"))
    
    # 1. Load or Generate Dataset
    if not os.path.exists(dataset_path):
        print("[*] Dataset not found, generating new balanced dataset...")
        df = generate_dataset(num_samples=2500, output_path=dataset_path)
    else:
        print(f"[*] Loading dataset from {dataset_path}...")
        df = pd.read_csv(dataset_path)
        
    print(f"[+] Total samples: {len(df)} (Benign: {(df['label'] == 0).sum()}, Phishing: {(df['label'] == 1).sum()})")
    
    # 2. Extract X and y
    X = df[ML_FEATURE_COLUMNS].values
    y = df["label"].values
    
    # 3. Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[+] Train set: {len(X_train)} samples | Test set: {len(X_test)} samples")
    
    # 4. Train Model
    print("[*] Training RandomForestClassifier (n_estimators=100)...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    # 5. Evaluate Performance
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)
    
    # Cross Validation Score
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring="f1")
    
    # Feature Importances
    importances = clf.feature_importances_
    feature_ranking = sorted(
        [{"feature": ML_FEATURE_COLUMNS[i], "importance": round(float(importances[i]), 4)}
         for i in range(len(ML_FEATURE_COLUMNS))],
        key=lambda x: x["importance"],
        reverse=True
    )
    
    print("\n" + "="*50)
    print("           MODEL EVALUATION RESULTS")
    print("="*50)
    print(f" Accuracy:       {acc * 100:.2f}%")
    print(f" Precision:      {prec * 100:.2f}%")
    print(f" Recall:         {rec * 100:.2f}%")
    print(f" F1 Score:       {f1 * 100:.2f}%")
    print(f" ROC-AUC:        {roc_auc:.4f}")
    print(f" 5-Fold CV F1:   {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print("\nConfusion Matrix:")
    print(f" [[TN={cm[0][0]}, FP={cm[0][1]}]")
    print(f"  [FN={cm[1][0]}, TP={cm[1][1]}]]")
    print("\nTop 5 Predictive Features:")
    for item in feature_ranking[:5]:
        print(f" - {item['feature']}: {item['importance'] * 100:.2f}%")
    print("="*50 + "\n")
    
    # 6. Save Model Artifacts
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "phishing_model.joblib")
    joblib.dump(clf, model_path)
    print(f"[+] Serialized model saved to: {model_path}")
    
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "features": ML_FEATURE_COLUMNS,
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "cv_f1_mean": round(float(cv_scores.mean()), 4),
            "confusion_matrix": {
                "true_negative": int(cm[0][0]),
                "false_positive": int(cm[0][1]),
                "false_negative": int(cm[1][0]),
                "true_positive": int(cm[1][1])
            }
        },
        "feature_importances": feature_ranking
    }
    
    metadata_path = os.path.join(models_dir, "feature_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Model metadata and metrics saved to: {metadata_path}")
    
    return clf, metadata


if __name__ == "__main__":
    train_phishing_model()
