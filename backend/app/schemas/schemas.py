from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ----------------- Auth Schemas -----------------
class UserLogin(BaseModel):
    username: str
    password: str


class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "analyst"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


# ----------------- Feature & Detection Schemas -----------------
class FeatureItem(BaseModel):
    id: Optional[int] = None
    feature_name: str
    feature_value: str
    risk_contribution: Optional[str] = None
    significance: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DetectionRuleItem(BaseModel):
    id: Optional[int] = None
    rule_id: str
    rule_name: str
    severity: str
    description: str
    score: int
    triggered: bool

    model_config = ConfigDict(from_attributes=True)


class AnalystNoteCreate(BaseModel):
    scan_id: int
    note: str


class AnalystNoteResponse(BaseModel):
    id: int
    scan_id: int
    user_id: Optional[int] = None
    username: str
    note: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ----------------- Scan Schemas -----------------
class ScanCreate(BaseModel):
    url: str = Field(..., description="Target URL for static cybersecurity analysis")


class ContributingFactor(BaseModel):
    factor: str
    score: int
    category: str


class ExplainableAnalysis(BaseModel):
    summary: str
    reasons: List[str]
    ml_confidence: float
    benign_probability: float
    phishing_probability: float
    rule_risk_score: int
    contributing_factors: List[ContributingFactor]


class ScanDetailResponse(BaseModel):
    id: int
    url: str
    domain: Optional[str] = None
    protocol: Optional[str] = None
    classification: str  # SAFE, SUSPICIOUS, PHISHING
    risk_score: int  # 0 - 100
    ml_probability: float  # 0.0 - 1.0
    rule_score: int  # 0 - 100
    recommendation: Optional[str] = None
    executive_summary: Optional[str] = None
    timestamp: datetime
    created_at: datetime
    features: List[FeatureItem] = []
    detections: List[DetectionRuleItem] = []
    notes: List[AnalystNoteResponse] = []
    explainable_analysis: Optional[ExplainableAnalysis] = None
    extracted_features_dict: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ScanSummary(BaseModel):
    id: int
    url: str
    domain: Optional[str] = None
    classification: str
    risk_score: int
    ml_probability: float
    rule_score: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedScansResponse(BaseModel):
    items: List[ScanSummary]
    total: int
    page: int
    limit: int
    pages: int


# ----------------- URL Comparison Schemas -----------------
class ScanCompareRequest(BaseModel):
    url_a: str
    url_b: str


class CompareFeatureDiff(BaseModel):
    feature: str
    value_a: Any
    value_b: Any
    verdict: str  # 'EQUAL', 'A_RISKIER', 'B_RISKIER'


class ScanCompareResponse(BaseModel):
    scan_a: ScanDetailResponse
    scan_b: ScanDetailResponse
    feature_diffs: List[CompareFeatureDiff]
    risk_delta: int
    safer_url: str


# ----------------- Threat Intelligence Schemas -----------------
class ThreatIndicatorItem(BaseModel):
    id: int
    indicator: str
    indicator_type: str  # URL, DOMAIN, IP, HASH
    threat_category: str
    confidence: int
    first_seen: datetime
    last_seen: datetime
    source: str
    is_demo: bool

    model_config = ConfigDict(from_attributes=True)


# ----------------- Dashboard & Stats Schemas -----------------
class TimeSeriesDataPoint(BaseModel):
    date: str
    safe: int
    suspicious: int
    phishing: int
    total: int


class CategoryDistribution(BaseModel):
    name: str
    value: int
    color: str


class TopTriggeredRule(BaseModel):
    rule_id: str
    rule_name: str
    count: int
    severity: str


class DashboardStatsResponse(BaseModel):
    total_scanned: int
    safe_count: int
    suspicious_count: int
    phishing_count: int
    avg_risk_score: float
    high_risk_count: int
    classification_distribution: List[CategoryDistribution]
    risk_distribution: List[CategoryDistribution]
    scans_over_time: List[TimeSeriesDataPoint]
    top_triggered_rules: List[TopTriggeredRule]
    recent_scans: List[ScanSummary]


# ----------------- System Health Schemas -----------------
class ServiceHealth(BaseModel):
    status: str  # 'healthy', 'degraded', 'error'
    latency_ms: float
    details: Optional[str] = None


class SystemHealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, ServiceHealth]
    version: str
    uptime_seconds: float


# ----------------- Report Generation Schemas -----------------
class ReportGenerateRequest(BaseModel):
    scan_id: int
    include_notes: bool = True
    analyst_signature: Optional[str] = "PhishGuard Automated SOC Agent"
