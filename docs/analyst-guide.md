# PhishGuard SOC Analyst Investigation Guide

## Standard Operating Procedure: Phishing Incident Triage

### 1. Incident Ingestion
When a suspicious link is reported by a user, email gateway, or SIEM alert:
1. Navigate to **URL Scanner** (`/scanner`).
2. Paste the target URL into the input field and click **"Analyze URL"**.
3. PhishGuard will extract features and output an initial **Threat Verdict** and **Risk Score (0–100)**.

---

### 2. Verdict Interpretation Matrix

| Verdict | Risk Score | Recommended Action |
| :--- | :--- | :--- |
| **SAFE** | $0 - 29$ | Standard benign profile. Verify if user was targeted with spear phishing context before closure. |
| **SUSPICIOUS** | $30 - 59$ | Perform manual checklist verification. Check WHOIS domain age and SSL issuer. |
| **HIGH RISK** | $60 - 79$ | Likely malicious staging or redirector. Contact user to confirm credentials were not entered. |
| **PHISHING** | $80 - 100$ | Active threat. Add DNS/firewall block rule, reset user credentials, and submit IOC to Threat Intel. |

---

### 3. Investigation Playbook

#### Step 1: Examine Explainable Indicators
* Review the **Explainable AI & Threat Breakdown** card on the Scan Detail page (`/scan/:id`).
* Check if high-severity rules triggered (e.g. `RULE-001: IP Host`, `RULE-006: Brand Impersonation`).

#### Step 2: Perform Comparative Inspection
* If the URL mimics a company service (e.g., `paypal-security-update.com`), use **URL Comparison** (`/compare`) against the authentic domain (`paypal.com`) to quantify feature divergence.

#### Step 3: Complete the SOC Checklist
* Complete all tasks on the **Investigation Checklist**:
  * [x] Verify domain registration age via WHOIS.
  * [x] Check SSL certificate Subject Alternative Names (SAN).
  * [x] Cross-reference against Threat Intel IOCs.
  * [x] Determine if credentials or MFA tokens were submitted.

#### Step 4: Record Analyst Notes & Export Report
1. Use the **Analyst Notes** card on the scan detail page to log forensic remarks (e.g., *"Confirmed PayPal credential harvester on Russian bulletproof host. Domain block submitted to firewall team."*).
2. Click **"Executive Report (Print/PDF)"** or **"Export JSON"** to generate the incident artifact for ticketing/SIEM handoff.
