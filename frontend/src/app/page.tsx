"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "../components/Header";
import { AnalyticsView } from "../components/AnalyticsView";
import { LiveAuditor } from "../components/LiveAuditor";
import { TradeoffView } from "../components/TradeoffView";
import { AuditDetailModal } from "../components/AuditDetailModal";
import {
  AuditRecord,
  HealthResponse,
  ListingRequest,
  ListingResponse,
} from "../lib/types";
import { API_BASE_URL } from "../lib/config";
import {
  INITIAL_AUDIT_LOGS,
  checkBackendHealth,
  calculateMetrics,
} from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "analytics" | "auditor" | "tradeoff"
  >("analytics");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      const res = await checkBackendHealth(API_BASE_URL);
      if (isMounted) setHealth(res);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAuditComplete = (
    result: ListingResponse,
    request: ListingRequest,
  ) => {
    const newRecord: AuditRecord = {
      id: `LOG_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      item_id: result.item_id,
      title: request.title,
      brand: request.brand || "",
      product_type: request.product_type,
      defect_flag: result.defect_flag,
      defect_type: result.defect_type,
      defect_probability: result.defect_probability,
      quality_score: result.quality_score,
      compliance_risk:
        (result.compliance_risk as "low" | "medium" | "high") || "low",
      reason: result.reason,
      suggested_fix: result.suggested_fix,
      latency_ms: result.latency_ms,
      llm_cost_usd: result.defect_flag === 1 ? 0.00025 : 0.0,
    };
    setAuditLogs((prev) => [newRecord, ...prev]);
  };

  const metrics = useMemo(() => calculateMetrics(auditLogs), [auditLogs]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] flex flex-col font-sans selection:bg-[#0070f3] selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {activeTab === "analytics" && (
          <AnalyticsView
            records={auditLogs}
            metrics={metrics}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onNavigateToInspector={() => setActiveTab("auditor")}
          />
        )}
        {activeTab === "auditor" && (
          <LiveAuditor onAuditComplete={handleAuditComplete} />
        )}
        {activeTab === "tradeoff" && <TradeoffView />}
      </main>

      {/* Detail Modal */}
      <AuditDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Footer */}
      <footer className="border-t border-[#1c1c1c] bg-[#000000] py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[#666666]">
          <span>Catalog Guardian Operations Platform</span>
          <span className="font-mono text-[11px] text-[#0070f3]">
            FastAPI + XGBoost + Gemini 3.1 Flash Lite
          </span>
        </div>
      </footer>
    </div>
  );
}
