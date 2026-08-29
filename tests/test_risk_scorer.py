import pytest
from app.detection.feature_extractor import extract_features
from app.detection.rule_engine import rule_engine
from app.detection.risk_scorer import RiskScorer


def test_safe_risk_score():
    url = "https://www.python.org/downloads/"
    features = extract_features(url)
    rule_eval = rule_engine.evaluate(features)
    ml_prob = 0.02

    score, classification, factors, reasons, rec, summary = RiskScorer.calculate_risk_score(
        rule_eval, ml_prob, features
    )
    assert classification == "SAFE"
    assert score < 30


def test_phishing_risk_score():
    url = "http://paypal-verification-update-center.xyz/login.php"
    features = extract_features(url)
    rule_eval = rule_engine.evaluate(features)
    ml_prob = 0.95

    score, classification, factors, reasons, rec, summary = RiskScorer.calculate_risk_score(
        rule_eval, ml_prob, features
    )
    assert classification == "PHISHING"
    assert score >= 80
    assert len(factors) > 0
    assert len(reasons) > 0
