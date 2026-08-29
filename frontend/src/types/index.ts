export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface FeatureItem {
  id?: number;
  feature_name: string;
  feature_value: string;
  risk_contribution?: string;
  significance?: string;
}

export interface DetectionRuleItem {
  id?: number;
  rule_id: string;
  rule_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  score: number;
  triggered: boolean;
}

export interface AnalystNote {
  id: number;
  scan_id: number;
  user_id?: number;
  username: string;
  note: string;
  created_at: string;
}

export interface ContributingFactor {
  factor: string;
  score: number;
  category: string;
}

export interface ExplainableAnalysis {
  summary: string;
  reasons: string[];
  ml_confidence: number;
  benign_probability: number;
  phishing_probability: number;
  rule_risk_score: number;
  contributing_factors: ContributingFactor[];
}

export type ThreatVerdict = 'SAFE' | 'SUSPICIOUS' | 'PHISHING';

export interface ScanDetail {
  id: number;
  url: string;
  domain?: string;
  protocol?: string;
  classification: ThreatVerdict;
  risk_score: number;
  ml_probability: number;
  rule_score: number;
  recommendation?: string;
  executive_summary?: string;
  timestamp: string;
  created_at: string;
  features: FeatureItem[];
  detections: DetectionRuleItem[];
  notes: AnalystNote[];
  explainable_analysis?: ExplainableAnalysis;
  extracted_features_dict?: Record<string, any>;
}

export interface ScanSummary {
  id: number;
  url: string;
  domain?: string;
  classification: ThreatVerdict;
  risk_score: number;
  ml_probability: number;
  rule_score: number;
  timestamp: string;
}

export interface PaginatedScans {
  items: ScanSummary[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CompareFeatureDiff {
  feature: string;
  value_a: any;
  value_b: any;
  verdict: 'EQUAL' | 'A_RISKIER' | 'B_RISKIER' | 'DIFFERENT';
}

export interface ScanCompareResponse {
  scan_a: ScanDetail;
  scan_b: ScanDetail;
  feature_diffs: CompareFeatureDiff[];
  risk_delta: number;
  safer_url: string;
}

export interface ThreatIndicator {
  id: number;
  indicator: string;
  indicator_type: 'URL' | 'DOMAIN' | 'IP' | 'HASH';
  threat_category: string;
  confidence: number;
  first_seen: string;
  last_seen: string;
  source: string;
  is_demo: boolean;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  safe: number;
  suspicious: number;
  phishing: number;
  total: number;
}

export interface TopTriggeredRule {
  rule_id: string;
  rule_name: string;
  count: number;
  severity: string;
}

export interface DashboardStats {
  total_scanned: number;
  safe_count: number;
  suspicious_count: number;
  phishing_count: number;
  avg_risk_score: number;
  high_risk_count: number;
  classification_distribution: CategoryDistribution[];
  risk_distribution: CategoryDistribution[];
  scans_over_time: TimeSeriesDataPoint[];
  top_triggered_rules: TopTriggeredRule[];
  recent_scans: ScanSummary[];
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'error';
  latency_ms: number;
  details?: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  services: Record<string, ServiceHealth>;
  version: string;
  uptime_seconds: number;
}
