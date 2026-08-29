from typing import Dict, Any, List, Tuple
from app.detection.rules.base import ALL_RULES, BaseRule


class RuleEngine:
    def __init__(self, rules: List[BaseRule] = None):
        self.rules = rules or ALL_RULES

    def evaluate(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate all security rules against the URL's extracted features.
        Returns:
            - evaluations: Full list of all rules with triggered status
            - triggered_rules: Only triggered rules
            - raw_rule_score: Sum of triggered rule scores
            - rule_score: Clamped 0-100 normalized score
            - indicators: List of triggered explanation strings
        """
        evaluations = []
        triggered_rules = []
        raw_score = 0
        indicators = []

        for rule in self.rules:
            is_triggered = rule.evaluate(features)
            explanation = rule.get_explanation(features) if is_triggered else rule.description
            
            rule_eval = {
                "rule_id": rule.rule_id,
                "rule_name": rule.rule_name,
                "severity": rule.severity,
                "description": explanation,
                "score": rule.score_contribution,
                "triggered": is_triggered
            }
            evaluations.append(rule_eval)

            if is_triggered:
                triggered_rules.append(rule_eval)
                raw_score += rule.score_contribution
                indicators.append(f"{rule.rule_name}: {explanation}")

        # Normalize/clamp score to 0-100
        # If any CRITICAL rule triggered (e.g. brand impersonation), ensure min score of 50
        has_critical = any(r["severity"] == "CRITICAL" for r in triggered_rules)
        has_high = any(r["severity"] == "HIGH" for r in triggered_rules)
        
        normalized_score = min(raw_score, 100)
        if has_critical and normalized_score < 60:
            normalized_score = 60
        elif has_high and len(triggered_rules) >= 2 and normalized_score < 45:
            normalized_score = 45

        return {
            "evaluations": evaluations,
            "triggered_rules": triggered_rules,
            "raw_rule_score": raw_score,
            "rule_score": normalized_score,
            "indicators": indicators,
            "triggered_count": len(triggered_rules)
        }


# Global singleton instance
rule_engine = RuleEngine()
