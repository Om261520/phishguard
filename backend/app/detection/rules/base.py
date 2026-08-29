from typing import Dict, Any, Optional
from abc import ABC, abstractmethod


class BaseRule(ABC):
    rule_id: str
    rule_name: str
    severity: str  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    score_contribution: int
    description: str

    @abstractmethod
    def evaluate(self, features: Dict[str, Any]) -> bool:
        """Return True if the rule is triggered, False otherwise."""
        pass

    def get_explanation(self, features: Dict[str, Any]) -> str:
        """Detailed explanation generated when rule is triggered."""
        return self.description


class Rule001_IPAddressHost(BaseRule):
    rule_id = "RULE-001"
    rule_name = "IP Address Used as Host"
    severity = "HIGH"
    score_contribution = 25
    description = "The URL uses a raw IP address instead of a registered domain name, a hallmark of malicious phishing infrastructure designed to bypass domain reputation filters."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("has_ip", 0) == 1)


class Rule002_ExcessiveURLLength(BaseRule):
    rule_id = "RULE-002"
    rule_name = "Excessively Long URL"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The URL is unusually long (> 75 characters), frequently employed to obscure the true destination in email clients or hide malicious payload parameters."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("url_length", 0) > 75)


class Rule003_SuspiciousAuthKeywords(BaseRule):
    rule_id = "RULE-003"
    rule_name = "Suspicious Authentication Keywords"
    severity = "HIGH"
    score_contribution = 20
    description = "The URL contains multiple authentication and credential-harvesting keywords (e.g. login, verify, secure, update, 2fa, wallet)."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("suspicious_keyword_count", 0) >= 2)

    def get_explanation(self, features: Dict[str, Any]) -> str:
        kw = features.get("matched_keywords", [])
        if kw:
            return f"Contains sensitive authentication keywords: [{', '.join(kw[:5])}]."
        return self.description


class Rule004_HighSpecialCharCount(BaseRule):
    rule_id = "RULE-004"
    rule_name = "High Special Character Density"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The URL contains an unusually high count of special characters (@, ?, =, &, %, -, _) often used to confuse URL parsers or chain obfuscated redirect tokens."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("special_char_count", 0) >= 6)


class Rule005_MultiLevelSubdomains(BaseRule):
    rule_id = "RULE-005"
    rule_name = "Suspicious Multi-Tier Subdomain Structure"
    severity = "HIGH"
    score_contribution = 20
    description = "The domain possesses 3 or more nested subdomain levels, commonly used on free dynamic DNS hosts to craft misleading domain hierarchies."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("subdomain_count", 0) >= 2)


class Rule006_BrandImpersonation(BaseRule):
    rule_id = "RULE-006"
    rule_name = "Brand Impersonation & Target Spoofing"
    severity = "CRITICAL"
    score_contribution = 30
    description = "The domain or URL path attempts to impersonate a well-known brand (e.g., PayPal, Microsoft, Apple, Google) while hosted on an unverified domain."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("brand_keyword", 0) == 1)

    def get_explanation(self, features: Dict[str, Any]) -> str:
        brands = features.get("impersonated_brands", [])
        if brands:
            return f"Potential brand impersonation detected for: {', '.join(brands).title()}."
        return self.description


class Rule007_HighDomainEntropy(BaseRule):
    rule_id = "RULE-007"
    rule_name = "High Domain Shannon Entropy (DGA Pattern)"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The domain exhibits high Shannon character entropy (> 3.8), suggesting an algorithmically generated domain (DGA) or pseudo-random staging host."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("entropy", 0.0) >= 3.8)


class Rule008_SuspiciousURLEncoding(BaseRule):
    rule_id = "RULE-008"
    rule_name = "Excessive Hexadecimal URL Encoding"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The URL contains multiple percent-encoded hexadecimal characters (%xx), often used to evade static keyword filters and string signatures."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("url_encoding_count", 0) >= 2)


class Rule009_InsecureHTTPProtocol(BaseRule):
    rule_id = "RULE-009"
    rule_name = "Insecure Plaintext HTTP Protocol"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The URL uses unencrypted HTTP protocol while containing sensitive authentication or credential submission terms."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        has_http = features.get("has_https", 0) == 0
        has_keywords = features.get("suspicious_keyword_count", 0) > 0
        return bool(has_http and (has_keywords or features.get("has_ip", 0) == 1))


class Rule010_SuspiciousDomainPunctuation(BaseRule):
    rule_id = "RULE-010"
    rule_name = "Suspicious Hyphen & Dot Density in Domain"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The domain name has multiple hyphens or excessive dots, a common technique for crafting deceptive lookalike domain names."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        hyphens = features.get("domain_hyphen_count", 0)
        dots = features.get("domain_dot_count", 0)
        return bool(hyphens >= 2 or dots >= 3)


class Rule011_OpenRedirectParams(BaseRule):
    rule_id = "RULE-011"
    rule_name = "Potential Open Redirect Parameter"
    severity = "MEDIUM"
    score_contribution = 15
    description = "The query string contains parameters commonly used for open URL redirection (e.g. redirect, next, dest, url)."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("redirect_param_count", 0) > 0)


class Rule012_HighNumericDensity(BaseRule):
    rule_id = "RULE-012"
    rule_name = "High Numeric Density in Domain"
    severity = "LOW"
    score_contribution = 10
    description = "The domain name contains a high ratio of numerical digits, commonly observed in automated botnet phishing kits."

    def evaluate(self, features: Dict[str, Any]) -> bool:
        return bool(features.get("domain_digit_ratio", 0.0) >= 0.25 and features.get("domain_digit_count", 0) >= 4)


ALL_RULES = [
    Rule001_IPAddressHost(),
    Rule002_ExcessiveURLLength(),
    Rule003_SuspiciousAuthKeywords(),
    Rule004_HighSpecialCharCount(),
    Rule005_MultiLevelSubdomains(),
    Rule006_BrandImpersonation(),
    Rule007_HighDomainEntropy(),
    Rule008_SuspiciousURLEncoding(),
    Rule009_InsecureHTTPProtocol(),
    Rule010_SuspiciousDomainPunctuation(),
    Rule011_OpenRedirectParams(),
    Rule012_HighNumericDensity()
]
