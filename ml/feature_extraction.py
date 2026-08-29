"""
PhishGuard - URL Feature Extraction Module
Comprehensive static feature extraction for cybersecurity and phishing analysis.
Does NOT make outbound HTTP connections (strictly offline & safe).
"""

import re
import math
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any, List, Tuple

# Suspicious keywords frequently observed in phishing / credential harvesting attacks
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "verification", "secure", "account", "update", "password",
    "signin", "sign-in", "bank", "payment", "wallet", "confirm", "security",
    "authenticate", "credential", "billing", "support", "recovery", "2fa",
    "webscr", "ebayisapi", "banking", "logon", "validation", "alert", "service",
    "protect", "client", "customer", "portal", "submit", "token", "authorize"
]

# Legitimate major brand domains for impersonation detection
KNOWN_BRANDS = {
    "google": ["google.com", "google.co.uk", "google.ca", "google.com.au", "accounts.google.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com", "outlook.com", "login.microsoftonline.com"],
    "apple": ["apple.com", "icloud.com", "appleid.apple.com"],
    "paypal": ["paypal.com", "paypal-communication.com"],
    "amazon": ["amazon.com", "amazon.co.uk", "amazon.de", "aws.amazon.com"],
    "facebook": ["facebook.com", "fb.com", "meta.com"],
    "instagram": ["instagram.com"],
    "netflix": ["netflix.com"],
    "linkedin": ["linkedin.com"],
    "dropbox": ["dropbox.com"],
    "chase": ["chase.com"],
    "wellsfargo": ["wellsfargo.com"],
    "bankofamerica": ["bankofamerica.com"],
    "dhl": ["dhl.com", "dhl.de"],
    "fedex": ["fedex.com"]
}

# Suspicious or frequently abused Top-Level Domains (TLDs)
SUSPICIOUS_TLDS = {
    "tk", "ml", "ga", "cf", "gq", "top", "xyz", "club", "work", "buzz",
    "cam", "fit", "rest", "surf", "monster", "icu", "bar", "kim", "country"
}

# Common open redirect query parameter names
REDIRECT_PARAMS = {"redirect", "url", "next", "dest", "destination", "r", "return_to", "goto", "target"}

# IPv4 regex pattern
IPV4_PATTERN = re.compile(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
# Hexadecimal IP pattern (e.g., 0x7f.0.0.1 or 0x7f000001)
HEX_IP_PATTERN = re.compile(r"^0x[0-9a-fA-F]+(?:\.0x[0-9a-fA-F]+)*$")


def calculate_entropy(text: str) -> float:
    """
    Calculate Shannon Entropy of a string: H(X) = -sum(p(x) * log2(p(x)))
    Higher entropy indicates random/algorithmically generated domains (DGA).
    """
    if not text:
        return 0.0
    text_lower = text.lower()
    length = len(text_lower)
    freq = {}
    for char in text_lower:
        freq[char] = freq.get(char, 0) + 1
    
    entropy = 0.0
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    
    return round(entropy, 4)


def normalize_url(url: str) -> Tuple[str, Any]:
    """
    Normalize raw URL string and parse into urllib components.
    Prepend 'http://' if no scheme is provided.
    """
    url_clean = url.strip()
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+\-.]*://", url_clean):
        url_clean = "http://" + url_clean
    parsed = urlparse(url_clean)
    return url_clean, parsed


def is_ip_address(netloc: str) -> int:
    """Check if host is an IPv4, IPv6, or Hexadecimal IP address."""
    host = netloc.split(":")[0].strip("[]")
    if IPV4_PATTERN.match(host):
        return 1
    if HEX_IP_PATTERN.match(host):
        return 1
    # Check for IPv6
    if ":" in host and not host.endswith(".com") and not host.endswith(".net"):
        # Simple heuristic IPv6 check
        parts = host.split(":")
        if len(parts) >= 3:
            return 1
    return 0


def detect_brand_impersonation(domain: str, full_url: str) -> Tuple[int, List[str]]:
    """
    Detect if URL/domain impersonates known legitimate brands without being the official domain.
    Returns: (is_impersonation: 0 or 1, list of impersonated brand names)
    """
    domain_lower = domain.lower()
    url_lower = full_url.lower()
    impersonated = []

    for brand, legit_domains in KNOWN_BRANDS.items():
        # If domain IS the official brand domain, it's not impersonation
        is_official = False
        for legit in legit_domains:
            if domain_lower == legit or domain_lower.endswith("." + legit):
                is_official = True
                break
        
        if is_official:
            continue
        
        # If brand name is in the domain name (e.g. paypal-security.com or paypal.update.xyz)
        if brand in domain_lower:
            impersonated.append(brand)
        # Or brand name is combined with auth keyword in URL path
        elif brand in url_lower and any(kw in url_lower for kw in ["login", "verify", "secure", "account", "update"]):
            impersonated.append(brand)

    return (1 if impersonated else 0), impersonated


def extract_features(url: str) -> Dict[str, Any]:
    """
    Extract comprehensive cybersecurity feature set for static URL analysis and ML inference.
    """
    url_normalized, parsed = normalize_url(url)
    domain = parsed.netloc.split(":")[0] if parsed.netloc else ""
    path = parsed.path
    query = parsed.query

    # 1. Structural Length Features
    url_length = len(url_normalized)
    domain_length = len(domain)
    path_length = len(path)

    # 2. Subdomain Breakdown
    domain_parts = domain.split(".") if domain else []
    if len(domain_parts) > 2:
        subdomain_count = len(domain_parts) - 2
    else:
        subdomain_count = 0

    # 3. Punctuation & Special Characters
    dot_count = url_normalized.count(".")
    domain_dot_count = domain.count(".")
    hyphen_count = url_normalized.count("-")
    domain_hyphen_count = domain.count("-")
    
    special_chars = ["@", "?", "=", "&", "%", "-", "_", "~", "+", ";", "!", "$", "*"]
    special_char_count = sum(url_normalized.count(c) for c in special_chars)

    # 4. IP Host Detection
    has_ip = is_ip_address(parsed.netloc)

    # 5. Protocol (HTTPS vs HTTP)
    has_https = 1 if parsed.scheme.lower() == "https" else 0

    # 6. Suspicious Keywords Analysis
    url_lower = url_normalized.lower()
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    suspicious_keyword_count = len(matched_keywords)

    # 7. Numeric Character Density
    digits_in_url = [c for c in url_normalized if c.isdigit()]
    digit_count = len(digits_in_url)
    digit_ratio = round(digit_count / max(url_length, 1), 4)

    digits_in_domain = [c for c in domain if c.isdigit()]
    domain_digit_count = len(digits_in_domain)
    domain_digit_ratio = round(domain_digit_count / max(domain_length, 1), 4)

    # 8. Domain Entropy (Shannon)
    domain_entropy = calculate_entropy(domain)

    # 9. Brand Impersonation
    brand_impersonation, impersonated_brands = detect_brand_impersonation(domain, url_normalized)

    # 10. URL Encoding (%xx)
    url_encoding_matches = re.findall(r"%[0-9a-fA-F]{2}", url_normalized)
    url_encoding_count = len(url_encoding_matches)

    # 11. Open Redirect Parameters
    qs_params = parse_qs(query)
    redirect_param_matches = [p for p in qs_params.keys() if p.lower() in REDIRECT_PARAMS]
    redirect_param_count = len(redirect_param_matches)

    # 12. TLD Reputation
    tld = domain_parts[-1].lower() if domain_parts else ""
    suspicious_tld_flag = 1 if tld in SUSPICIOUS_TLDS else 0

    # 13. Double Slash in Path (often used for redirect tricks)
    has_double_slash_path = 1 if "//" in path else 0

    # 14. At Symbol in Authority/URL (credential spoofing e.g. legitimate.com@phish.com)
    has_at_symbol = 1 if "@" in url_normalized else 0

    return {
        "url_length": url_length,
        "domain_length": domain_length,
        "path_length": path_length,
        "subdomain_count": subdomain_count,
        "dot_count": dot_count,
        "domain_dot_count": domain_dot_count,
        "hyphen_count": hyphen_count,
        "domain_hyphen_count": domain_hyphen_count,
        "special_char_count": special_char_count,
        "has_ip": has_ip,
        "has_https": has_https,
        "suspicious_keyword_count": suspicious_keyword_count,
        "matched_keywords": matched_keywords,
        "digit_count": digit_count,
        "digit_ratio": digit_ratio,
        "domain_digit_count": domain_digit_count,
        "domain_digit_ratio": domain_digit_ratio,
        "entropy": domain_entropy,
        "brand_keyword": brand_impersonation,
        "impersonated_brands": impersonated_brands,
        "url_encoding_count": url_encoding_count,
        "redirect_param_count": redirect_param_count,
        "redirect_params_found": redirect_param_matches,
        "suspicious_tld": suspicious_tld_flag,
        "tld": tld,
        "has_double_slash_path": has_double_slash_path,
        "has_at_symbol": has_at_symbol,
        "domain": domain,
        "protocol": parsed.scheme.lower() if parsed.scheme else "http",
        "normalized_url": url_normalized
    }


# ML Feature Vector schema (numerical values used by Scikit-Learn model)
ML_FEATURE_COLUMNS = [
    "url_length",
    "domain_length",
    "subdomain_count",
    "dot_count",
    "hyphen_count",
    "special_char_count",
    "has_ip",
    "has_https",
    "suspicious_keyword_count",
    "digit_count",
    "digit_ratio",
    "entropy",
    "brand_keyword",
    "url_encoding_count",
    "redirect_param_count",
    "suspicious_tld"
]


def extract_ml_feature_vector(features: Dict[str, Any]) -> List[float]:
    """Convert extracted feature dict into a flat numeric array for ML model prediction."""
    return [float(features.get(col, 0)) for col in ML_FEATURE_COLUMNS]
