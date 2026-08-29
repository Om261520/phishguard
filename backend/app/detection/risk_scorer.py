from typing import Dict, Any, List, Tuple


class RiskScorer:
    """
    Multi-Factor Cyber Threat Risk Scoring Engine (0 - 100)
    Fuses Rule Engine detections, ML Random Forest predictions, and structural signals
    to output an explainable risk score and actionable analyst guidance.
    """

    @staticmethod
    def calculate_risk_score(
        rule_eval_result: Dict[str, Any],
        ml_probability: float,
        features: Dict[str, Any]
    ) -> Tuple[int, str, List[Dict[str, Any]], List[str], str, str]:
        """
        Calculate composite risk score (0-100).
        Returns:
            - final_score: int (0 - 100)
            - classification: str ('SAFE', 'SUSPICIOUS', 'PHISHING')
            - contributing_factors: list of factor dicts
            - explainable_reasons: list of natural language sentences
            - recommendation: actionable guidance string
            - executive_summary: SOC analyst summary
        """
        rule_score = rule_eval_result.get("rule_score", 0)
        triggered_rules = rule_eval_result.get("triggered_rules", [])
        
        # 1. Base Weighted Fusion
        # 45% Rule Engine + 45% ML Model + 10% Contextual Multiplier
        ml_score = int(ml_probability * 100)
        base_score = (rule_score * 0.45) + (ml_score * 0.45)
        
        # 2. Contextual & Multiplier Boosts
        synergy_boost = 0
        contributing_factors = []
        explainable_reasons = []

        # Add contributing factors from triggered rules
        for r in triggered_rules:
            factor_name = f"+{r['score']} {r['rule_name']}"
            contributing_factors.append({
                "factor": factor_name,
                "score": r["score"],
                "category": r["severity"]
            })
            explainable_reasons.append(r["description"])

        # Severe indicators override
        has_ip = features.get("has_ip", 0) == 1
        is_brand_spoof = features.get("brand_keyword", 0) == 1
        high_entropy = features.get("entropy", 0.0) >= 3.8
        keyword_count = features.get("suspicious_keyword_count", 0)

        if has_ip and keyword_count > 0:
            synergy_boost += 15
            contributing_factors.append({
                "factor": "+15 IP Host combined with Credential Keywords",
                "score": 15,
                "category": "CRITICAL"
            })
            explainable_reasons.append("High-risk combination: Direct IP hosting paired with credential submission terms.")

        if is_brand_spoof:
            synergy_boost += 15

        if len(triggered_rules) >= 3:
            synergy_boost += 10
            contributing_factors.append({
                "factor": "+10 Multiple Compounding Risk Signals",
                "score": 10,
                "category": "HIGH"
            })

        # Calculate final composite score (clamped between 0 and 100)
        raw_final = base_score + (synergy_boost * 0.10 * 100)
        final_score = int(min(max(raw_final, 0), 100))

        # Adjust score if ML and rules are both near-zero
        if rule_score == 0 and ml_probability < 0.15:
            final_score = min(final_score, 12)
            if not explainable_reasons:
                explainable_reasons.append("No suspicious structural, entropy, or keyword anomalies detected.")
                explainable_reasons.append("Matches legitimate domain patterns and standard URL formatting.")

        # 3. Determine Threat Classification
        if final_score >= 80 or is_brand_spoof or (has_ip and keyword_count > 0):
            classification = "PHISHING"
            final_score = max(final_score, 80)
        elif final_score >= 45:
            classification = "SUSPICIOUS"
        elif final_score >= 30:
            classification = "SUSPICIOUS"
        else:
            classification = "SAFE"

        # 4. Actionable Recommendation
        if classification == "PHISHING":
            recommendation = (
                "CRITICAL THREAT: Do NOT open this URL or submit credentials. "
                "Block domain at DNS/firewall perimeter, isolate affected endpoints, "
                "and submit indicator to Threat Intelligence."
            )
            executive_summary = (
                f"URL flagged as high-confidence PHISHING (Risk: {final_score}/100, ML Confidence: {ml_probability*100:.1f}%). "
                "Presents active credential harvesting or brand impersonation characteristics."
            )
        elif classification == "SUSPICIOUS":
            recommendation = (
                "CAUTION: Potential risk detected. Do not enter credentials until domain ownership "
                "and SSL certificate have been independently verified by a security analyst."
            )
            executive_summary = (
                f"URL classified as SUSPICIOUS (Risk: {final_score}/100). Multiple anomalous indicators "
                "were triggered requiring analyst triage."
            )
        else:
            recommendation = (
                "SAFE: URL exhibits standard legitimate structure. Note: Static analysis verifies structural safety; "
                "always exercise standard security vigilance."
            )
            executive_summary = (
                f"URL verified as SAFE (Risk: {final_score}/100, ML Benign Probability: {(1-ml_probability)*100:.1f}%). "
                "No phishing indicators detected."
            )

        return final_score, classification, contributing_factors, explainable_reasons, recommendation, executive_summary
