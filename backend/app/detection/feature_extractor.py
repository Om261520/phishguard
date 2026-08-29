"""
Backend feature extraction interface mapping directly to core ml.feature_extraction
"""

import sys
import os

# Ensure root path is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from ml.feature_extraction import (
    extract_features,
    extract_ml_feature_vector,
    calculate_entropy,
    normalize_url,
    is_ip_address,
    detect_brand_impersonation,
    ML_FEATURE_COLUMNS,
    SUSPICIOUS_KEYWORDS,
    KNOWN_BRANDS,
    SUSPICIOUS_TLDS,
    REDIRECT_PARAMS
)

__all__ = [
    "extract_features",
    "extract_ml_feature_vector",
    "calculate_entropy",
    "normalize_url",
    "is_ip_address",
    "detect_brand_impersonation",
    "ML_FEATURE_COLUMNS",
    "SUSPICIOUS_KEYWORDS",
    "KNOWN_BRANDS",
    "SUSPICIOUS_TLDS",
    "REDIRECT_PARAMS"
]
