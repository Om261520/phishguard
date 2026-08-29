import pytest
from ml.feature_extraction import (
    extract_features,
    calculate_entropy,
    is_ip_address,
    detect_brand_impersonation,
    extract_ml_feature_vector
)


def test_ip_detection():
    assert is_ip_address("192.168.1.1") == 1
    assert is_ip_address("10.0.0.1:8080") == 1
    assert is_ip_address("google.com") == 0
    assert is_ip_address("paypal-security.com") == 0


def test_entropy_calculation():
    # Low entropy (repetitive characters)
    low_entropy = calculate_entropy("aaaaaaa")
    # High entropy (random generated string)
    high_entropy = calculate_entropy("q7w8e9r0t1y2u3i4o5p6")
    
    assert low_entropy == 0.0
    assert high_entropy > 3.5


def test_brand_impersonation_detection():
    # Impersonated domains
    is_imp, brands = detect_brand_impersonation("paypal-security-update.com", "http://paypal-security-update.com")
    assert is_imp == 1
    assert "paypal" in brands

    is_imp, brands = detect_brand_impersonation("appleid-verify-portal.net", "https://appleid-verify-portal.net/auth")
    assert is_imp == 1
    assert "apple" in brands

    # Legitimate official brand domains should NOT be flagged as impersonation
    is_imp_legit, _ = detect_brand_impersonation("paypal.com", "https://paypal.com/signin")
    assert is_imp_legit == 0

    is_imp_legit2, _ = detect_brand_impersonation("google.com", "https://google.com/search")
    assert is_imp_legit2 == 0


def test_feature_extraction_integrity():
    url = "http://192.168.1.1/login-verify-account.php?token=123%20abc&redirect=https://google.com"
    feats = extract_features(url)

    assert feats["has_ip"] == 1
    assert feats["has_https"] == 0
    assert feats["suspicious_keyword_count"] >= 2
    assert "login" in feats["matched_keywords"] or "verify" in feats["matched_keywords"]
    assert feats["url_encoding_count"] >= 1
    assert feats["redirect_param_count"] >= 1

    vec = extract_ml_feature_vector(feats)
    assert len(vec) == 16
