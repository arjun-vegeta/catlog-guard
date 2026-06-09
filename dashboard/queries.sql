-- Query 1: High-Level Audit KPI Metrics
SELECT 
    COUNT(*) as total_audited,
    SUM(CASE WHEN defect_flag = 1 THEN 1 ELSE 0 END) as total_flagged,
    ROUND(AVG(defect_flag) * 100.0, 2) as defect_flag_rate_pct,
    ROUND(AVG(quality_score), 2) as avg_quality_score,
    ROUND(AVG(latency_ms), 2) as avg_latency_ms,
    ROUND(SUM(llm_cost_usd), 4) as total_llm_cost_usd
FROM audit_logs;

-- Query 2: Defect Breakdown by Type
SELECT 
    defect_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM audit_logs), 2) as percentage
FROM audit_logs
GROUP BY defect_type
ORDER BY count DESC;

-- Query 3: Compliance Risk Breakdown
SELECT 
    compliance_risk,
    COUNT(*) as count,
    ROUND(AVG(quality_score), 2) as avg_quality_score
FROM audit_logs
GROUP BY compliance_risk
ORDER BY count DESC;

-- Query 4: Quality Score Bucketing
SELECT 
    CASE 
        WHEN quality_score >= 85 THEN '85-100 (High Quality)'
        WHEN quality_score >= 60 THEN '60-84 (Medium Quality)'
        ELSE '0-59 (Low Quality / Defective)'
    END as score_bucket,
    COUNT(*) as listing_count,
    ROUND(AVG(defect_probability), 4) as avg_defect_prob
FROM audit_logs
GROUP BY score_bucket
ORDER BY listing_count DESC;

-- Query 5: Recent Audit Log Stream
SELECT 
    timestamp,
    item_id,
    title,
    product_type,
    defect_flag,
    defect_type,
    quality_score,
    compliance_risk,
    latency_ms
FROM audit_logs
ORDER BY id DESC
LIMIT 50;
