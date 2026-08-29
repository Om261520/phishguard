import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Scan, Feature, Detection, AnalystNote
from app.schemas.schemas import ScanDetailResponse, FeatureItem, DetectionRuleItem, AnalystNoteResponse, ExplainableAnalysis, ContributingFactor
from app.detection.feature_extractor import extract_features
from app.detection.rule_engine import rule_engine
from app.detection.risk_scorer import RiskScorer
from app.ml.model_service import ml_service


# Feature risk significance mappings for UI tables
FEATURE_SIGNIFICANCE_MAP = {
    "url_length": "High length often conceals destination and credential payload strings.",
    "domain_length": "Abnormal domain lengths may indicate domain squatting or DGA.",
    "subdomain_count": "Deep subdomains (>2) frequently leverage dynamic DNS for deceptive branding.",
    "dot_count": "Excessive dots mimic legit domain hierarchy to bypass user scrutiny.",
    "hyphen_count": "Hyphens are standard in brand-spoofing domains (e.g. paypal-update).",
    "special_char_count": "High special characters obfuscate tokens and script parameters.",
    "has_ip": "Direct IP addressing bypasses DNS reputation filters; major phishing indicator.",
    "has_https": "HTTPS provides transport encryption, NOT legitimacy (70%+ of phish use HTTPS).",
    "suspicious_keyword_count": "Authentication & financial keywords target credential harvesting.",
    "digit_count": "Numeric sequences in hostnames signal automated botnet creation.",
    "digit_ratio": "High digit proportion indicates machine-generated attack hosts.",
    "entropy": "High Shannon entropy indicates algorithmic domain generation (DGA).",
    "brand_keyword": "Targeted brand impersonation spoofing reputable organizations.",
    "url_encoding_count": "Hexadecimal encoding (%xx) evades signature detection filters.",
    "redirect_param_count": "Open redirect parameter facilitates redirect chains.",
    "suspicious_tld": "Low-cost/free TLDs frequently abused by threat actors."
}


class ScanService:
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format."""
        if not url or len(url.strip()) < 3:
            return False
        clean = url.strip()
        # Basic regex check
        pattern = re.compile(
            r"^(?:https?://)?"  # optional scheme
            r"(?:[a-zA-Z0-9\-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9\-._~%!$&'()*+,;=]*)?@)?"  # user:pass
            r"(?:(?:[a-zA-Z0-9\-._~%]+)|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:\[[0-9a-fA-F:]+\]))"  # domain or IP
            r"(?::[0-9]+)?"  # port
            r"(?:/[a-zA-Z0-9\-._~%!$&'()*+,;=:@/]*)*"  # path
            r"(?:\?[a-zA-Z0-9\-._~%!$&'()*+,;=:@/?]*)?"  # query
            r"(?:#[a-zA-Z0-9\-._~%!$&'()*+,;=:@/?]*)?$",  # fragment
            re.IGNORECASE
        )
        return bool(pattern.match(clean))

    @classmethod
    def scan_url(cls, db: Session, url: str) -> ScanDetailResponse:
        """Execute complete static analysis pipeline and persist results."""
        clean_url = url.strip()
        
        # 1. Feature Extraction
        features = extract_features(clean_url)
        
        # 2. Rule-Based Security Engine
        rule_eval = rule_engine.evaluate(features)
        
        # 3. Machine Learning Classification
        phish_prob, benign_prob = ml_service.predict_phishing_probability(features)
        
        # 4. Composite Risk Scoring & Explainability
        (
            risk_score,
            classification,
            contributing_factors,
            explainable_reasons,
            recommendation,
            executive_summary
        ) = RiskScorer.calculate_risk_score(rule_eval, phish_prob, features)

        # 5. Persist Scan Record in Database
        scan_record = Scan(
            url=features["normalized_url"],
            domain=features["domain"],
            protocol=features["protocol"],
            classification=classification,
            risk_score=risk_score,
            ml_probability=phish_prob,
            rule_score=rule_eval["rule_score"],
            recommendation=recommendation,
            executive_summary=executive_summary,
            timestamp=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc)
        )
        db.add(scan_record)
        db.flush()  # Flush to get scan_record.id

        # 6. Persist Extracted Features
        feature_records = []
        feature_items_for_response = []
        for feat_name, significance in FEATURE_SIGNIFICANCE_MAP.items():
            val = str(features.get(feat_name, "N/A"))
            feat_obj = Feature(
                scan_id=scan_record.id,
                feature_name=feat_name,
                feature_value=val,
                risk_contribution=f"{val}",
                significance=significance
            )
            feature_records.append(feat_obj)
            db.add(feat_obj)
            feature_items_for_response.append(
                FeatureItem(
                    feature_name=feat_name,
                    feature_value=val,
                    risk_contribution=f"{val}",
                    significance=significance
                )
            )

        # 7. Persist Detection Rule Evaluations
        detection_records = []
        detection_items_for_response = []
        for r in rule_eval["evaluations"]:
            det_obj = Detection(
                scan_id=scan_record.id,
                rule_id=r["rule_id"],
                rule_name=r["rule_name"],
                severity=r["severity"],
                description=r["description"],
                score=r["score"],
                triggered=r["triggered"]
            )
            detection_records.append(det_obj)
            db.add(det_obj)
            detection_items_for_response.append(
                DetectionRuleItem(
                    rule_id=r["rule_id"],
                    rule_name=r["rule_name"],
                    severity=r["severity"],
                    description=r["description"],
                    score=r["score"],
                    triggered=r["triggered"]
                )
            )

        db.commit()
        db.refresh(scan_record)

        # Build Explainable Analysis Object
        explainable = ExplainableAnalysis(
            summary=executive_summary,
            reasons=explainable_reasons,
            ml_confidence=round(max(phish_prob, benign_prob) * 100, 1),
            benign_probability=benign_prob,
            phishing_probability=phish_prob,
            rule_risk_score=rule_eval["rule_score"],
            contributing_factors=[
                ContributingFactor(factor=cf["factor"], score=cf["score"], category=cf["category"])
                for cf in contributing_factors
            ]
        )

        return ScanDetailResponse(
            id=scan_record.id,
            url=scan_record.url,
            domain=scan_record.domain,
            protocol=scan_record.protocol,
            classification=scan_record.classification,
            risk_score=scan_record.risk_score,
            ml_probability=scan_record.ml_probability,
            rule_score=scan_record.rule_score,
            recommendation=scan_record.recommendation,
            executive_summary=scan_record.executive_summary,
            timestamp=scan_record.timestamp,
            created_at=scan_record.created_at,
            features=feature_items_for_response,
            detections=detection_items_for_response,
            notes=[],
            explainable_analysis=explainable,
            extracted_features_dict=features
        )

    @classmethod
    def get_scan_by_id(cls, db: Session, scan_id: int) -> Optional[ScanDetailResponse]:
        """Fetch scan with its features, detections, and notes."""
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return None

        features = [FeatureItem.model_validate(f) for f in scan.features]
        detections = [DetectionRuleItem.model_validate(d) for d in scan.detections]
        notes = [AnalystNoteResponse.model_validate(n) for n in scan.notes]

        # Re-derive explainable factors from stored detections
        triggered = [d for d in scan.detections if d.triggered]
        factors = [
            ContributingFactor(factor=f"+{d.score} {d.rule_name}", score=d.score, category=d.severity)
            for d in triggered
        ]
        reasons = [d.description for d in triggered]
        if not reasons:
            reasons = ["No malicious heuristic or structural signals triggered during static inspection."]

        benign_prob = round(1.0 - scan.ml_probability, 4)
        explainable = ExplainableAnalysis(
            summary=scan.executive_summary or f"Scan classification: {scan.classification}",
            reasons=reasons,
            ml_confidence=round(max(scan.ml_probability, benign_prob) * 100, 1),
            benign_probability=benign_prob,
            phishing_probability=scan.ml_probability,
            rule_risk_score=scan.rule_score,
            contributing_factors=factors
        )

        return ScanDetailResponse(
            id=scan.id,
            url=scan.url,
            domain=scan.domain,
            protocol=scan.protocol,
            classification=scan.classification,
            risk_score=scan.risk_score,
            ml_probability=scan.ml_probability,
            rule_score=scan.rule_score,
            recommendation=scan.recommendation,
            executive_summary=scan.executive_summary,
            timestamp=scan.timestamp,
            created_at=scan.created_at,
            features=features,
            detections=detections,
            notes=notes,
            explainable_analysis=explainable,
            extracted_features_dict={f.feature_name: f.feature_value for f in scan.features}
        )
