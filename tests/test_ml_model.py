import pytest
from app.detection.feature_extractor import extract_features
from app.ml.model_service import ml_service


def test_ml_model_status():
    status = ml_service.get_model_status()
    assert status["loaded"] is True
    assert "metrics" in status
    assert status["feature_count"] == 16


def test_ml_prediction_clean_vs_phishing():
    clean_url = "https://github.com/fastapi/fastapi"
    clean_feats = extract_features(clean_url)
    clean_phish_prob, clean_benign_prob = ml_service.predict_phishing_probability(clean_feats)

    assert clean_benign_prob > clean_phish_prob
    assert clean_phish_prob < 0.20

    phish_url = "http://192.168.1.105/login-verify-account.php"
    phish_feats = extract_features(phish_url)
    phish_prob, benign_prob = ml_service.predict_phishing_probability(phish_feats)

    assert phish_prob > benign_prob
    assert phish_prob > 0.70
