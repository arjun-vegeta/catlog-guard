export interface ListingRequest {
  item_id: str;
  title: str;
  brand?: str;
  product_type: str;
  bullet_points?: str;
  color?: str;
  material?: str;
  item_dimensions?: str;
  api_key?: str;
}

export type str = string;

export interface ListingResponse {
  item_id: string;
  defect_flag: number;
  defect_type: string;
  defect_probability: number;
  quality_score: number;
  compliance_risk: "low" | "medium" | "high" | string;
  reason: string;
  suggested_fix: string;
  latency_ms: number;
}

export interface HealthResponse {
  status: string;
  db_status: boolean;
  classifier_status: boolean;
  regressor_status: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  item_id: string;
  title: string;
  brand: string;
  product_type: string;
  defect_flag: number;
  defect_type: string;
  defect_probability: number;
  quality_score: number;
  compliance_risk: "low" | "medium" | "high";
  reason: string;
  suggested_fix: string;
  latency_ms: number;
  llm_cost_usd: number;
}

export interface OverviewMetrics {
  total_audited: number;
  total_flagged: number;
  defect_flag_rate_pct: number;
  avg_quality_score: number;
  avg_latency_ms: number;
  total_llm_cost_usd: number;
}
