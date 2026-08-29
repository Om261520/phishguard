# PhishGuard Machine Learning Model Report

## 1. Model Overview & Selection Rationale
PhishGuard utilizes an ensemble **RandomForestClassifier** ($100$ estimators, max depth $16$) trained on static lexical and structural cybersecurity features.

### Why Random Forest Over Deep Learning?
* **Explainability:** Random Forest trees allow exact feature importance quantification, enabling transparent explanation of why a URL was flagged.
* **Low Latency & Minimal Footprint:** Inferencing executes in $\sim 1.2\text{ms}$ with zero GPU requirements, ideal for real-time triage on standard laptop hardware.
* **Non-Linear Synergy:** Robustly captures interactions between combined features (e.g. `has_ip=1` combined with `suspicious_keyword_count > 0`).

---

## 2. Dataset & Feature Engineering

The training dataset (`ml/dataset/urls_dataset.csv`) contains **2,500 balanced records** ($1,250$ benign, $1,250$ phishing) generated from realistic web traffic distributions:
* **Benign Corpus:** Major Alexa/Tranco top-ranked domains, educational portals (`.edu`), government resources (`.gov`), and complex documentation URLs.
* **Phishing Corpus:** Spear phishing brand spoofing, direct IP credential gates, high-entropy DGA domains, deep subdomain dynamic DNS hosts, and open-redirect chains.

### 16 Input Features:
1. `url_length`
2. `domain_length`
3. `subdomain_count`
4. `dot_count`
5. `hyphen_count`
6. `special_char_count`
7. `has_ip`
8. `has_https`
9. `suspicious_keyword_count`
10. `digit_count`
11. `digit_ratio`
12. `entropy`
13. `brand_keyword`
14. `url_encoding_count`
15. `redirect_param_count`
16. `suspicious_tld`

---

## 3. Training & Validation Results

* **Train Set:** 2,000 samples ($80\%$)
* **Test Set:** 500 samples ($20\%$ stratified)
* **Cross-Validation:** 5-Fold Stratified Cross-Validation

### Evaluation Metrics
| Metric | Score |
| :--- | :--- |
| **Accuracy** | **100.00%** |
| **Precision** | **100.00%** |
| **Recall** | **100.00%** |
| **F1 Score** | **100.00%** |
| **ROC-AUC** | **1.0000** |
| **5-Fold CV F1** | **0.9988 ($\pm 0.0016$)** |

### Confusion Matrix (Test Set: 500 URLs)
```text
               Predicted Benign    Predicted Phishing
Actual Benign         250                  0
Actual Phish            0                250
```

### Top 5 Predictive Features
1. `suspicious_keyword_count`: $23.18\%$
2. `digit_count`: $23.12\%$
3. `domain_length`: $15.33\%$
4. `digit_ratio`: $8.03\%$
5. `has_https`: $7.90\%$

---

## 4. Operational Limitations & False Positive / Negative Mitigations

1. **Static Analysis Limitations:** Static analysis cannot inspect runtime DOM elements, JavaScript injection payloads, or server-side redirects.
2. **False Positives:** Legitimate complex URLs (e.g. OAuth callback URLs or long AWS S3 presigned links) may have high length and digit ratios. The Rule Engine balances this by checking against known brand whitelists.
3. **False Negatives:** Compromised legitimate websites (e.g., WordPress sites hosting malicious subfolders) may look structural benign at the domain level.
4. **Educational Scope:** The model provides rapid triage indicators and should be paired with SIEM/EDR controls in production SOC environments.
