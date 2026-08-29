import pytest
from app.detection.feature_extractor import extract_features
from app.detection.rule_engine import rule_engine


def test_rule_engine_clean_url():
    url = "https://www.wikipedia.org/wiki/Main_Page"
    features = extract_features(url)
    res = rule_engine.evaluate(features)

    assert res["rule_score"] == 0
    assert len(res["triggered_rules"]) == 0


def test_rule_engine_ip_rule():
    url = "http://192.168.1.50/login"
    features = extract_features(url)
    res = rule_engine.evaluate(features)

    triggered_ids = [r["rule_id"] for r in res["triggered_rules"]]
    assert "RULE-001" in triggered_ids  # IP Host Rule
    assert res["rule_score"] > 0


def test_rule_engine_brand_spoof_rule():
    url = "http://paypal-security-account-verification.com/login"
    features = extract_features(url)
    res = rule_engine.evaluate(features)

    triggered_ids = [r["rule_id"] for r in res["triggered_rules"]]
    assert "RULE-006" in triggered_ids  # Brand Impersonation Rule
    assert res["rule_score"] >= 50
