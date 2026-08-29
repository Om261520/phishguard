# PhishGuard Platform Architecture

## Executive Overview
**PhishGuard** is an AI-powered static URL cybersecurity analysis and phishing detection platform. It is engineered specifically for Security Operations Center (SOC) analysts, incident responders, and threat hunters to triage suspicious links with zero risk of malware infection or attacker de-anonymization.

---

## High-Level System Architecture

```text
                                 ┌─────────────────────────────────┐
                                 │   SOC Analyst / User (Browser)  │
                                 └────────────────┬────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │     React 18 + Vite Frontend    │
                                 │   Tailwind CSS + Lucide Icons   │
                                 │       Recharts Data Viz         │
                                 └────────────────┬────────────────┘
                                                  │ REST API (Bearer JWT)
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │        FastAPI Backend          │
                                 │    Pydantic + SQLAlchemy ORM    │
                                 └──────┬───────────────────┬──────┘
                                        │                   │
                     ┌──────────────────┴──┐             ┌──┴──────────────────┐
                     ▼                     ▼             ▼                     ▼
          ┌────────────────────┐ ┌────────────────┐ ┌───────────────┐ ┌───────────────┐
          │ Feature Extraction │ │  Rule Engine   │ │  ML Service   │ │ SQLite DB &   │
          │ Entropy, Keywords, │ │ 12 Modular     │ │ Random Forest │ │ Threat Intel  │
          │ IP, Subdomains, etc│ │ Security Rules │ │ (joblib model)│ │ Store         │
          └──────────┬─────────┘ └────────┬───────┘ └───────┬───────┘ └───────────────┘
                     │                    │                 │
                     └────────────────────┼─────────────────┘
                                          ▼
                               ┌─────────────────────┐
                               │ Risk Scoring Engine │
                               │ 0-100 Threat Index  │
                               │ Explainable Factors │
                               └──────────┬──────────┘
                                          ▼
                               ┌─────────────────────┐
                               │ Security Report &   │
                               │ Threat Verdict      │
                               └─────────────────────┘
```

---

## Architectural Layers

### 1. Presentation Layer (Frontend)
* **Framework:** React 18 with TypeScript and Vite.
* **Styling & UI:** Custom Tailwind CSS dark theme inspired by enterprise SOC tools (CrowdStrike Falcon, Splunk Phantom, SentinelOne).
* **Data Visualization:** Interactive Recharts components for multi-day time series trends, verdict donuts, risk tier histograms, and top rule triggers.
* **State Management:** React Context (`AuthContext`) handling JWT lifecycle and Role-Based Access Control (RBAC).

### 2. API & Routing Layer (Backend)
* **Framework:** FastAPI (Python 3.13 ASGI framework).
* **Validation:** Pydantic v2 schemas providing strict compile-time & runtime validation for all requests and responses.
* **Security & Auth:** JWT bearer tokens with standard SHA-256 HMAC signing and bcrypt password hashing.

### 3. Detection & Machine Learning Subsystem
* **Static URL Feature Extractor:** Pure string parsing and lexical decomposition without executing HTTP requests to the target domain.
* **Modular Rule Engine:** Evaluates 12 individual security rules (RULE-001 through RULE-012) with custom severity weighting and explanations.
* **Machine Learning Classifier:** Scikit-learn `RandomForestClassifier` trained on 2,500 balanced samples producing probability distributions.
* **Composite Risk Scorer:** Fuses Rule Engine weights (45%), ML probability (45%), and contextual compounding synergy boosts (10%) into an auditable 0–100 risk score.

### 4. Persistence Layer (Database)
* **Engine:** SQLite with WAL (Write-Ahead Logging) mode support.
* **ORM:** SQLAlchemy 2.0 with relational foreign keys:
  * `User`: Credentials, RBAC roles (`admin`, `analyst`, `viewer`).
  * `Scan`: Core target URL, domain, verdict, risk score, and ML probability.
  * `Feature`: Individual key-value feature records and risk significance.
  * `Detection`: Evaluated security rules and triggered findings.
  * `AnalystNote`: Persistent triage audit comments left by analysts.
  * `ThreatIndicator`: IOC telemetry feed with confidence scores and source attribution.
