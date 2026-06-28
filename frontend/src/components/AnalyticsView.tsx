"use client";

import React, { useState, useMemo } from "react";
import { AuditRecord, OverviewMetrics } from "../lib/types";
import { formatTimeString } from "../lib/api";
import { MetricCard } from "./MetricCard";
import { Search, ChevronRight, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface AnalyticsViewProps {
  records: AuditRecord[];
  metrics: OverviewMetrics;
  onSelectRecord: (record: AuditRecord) => void;
  onNavigateToInspector?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  metrics,
  onSelectRecord,
  onNavigateToInspector,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const defectBreakdownData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      if (r.defect_type !== "none") {
        counts[r.defect_type] = (counts[r.defect_type] || 0) + 1;
      }
    });
    return Object.keys(counts).map((type) => ({
      name: type.replace("_", " ").toUpperCase(),
      count: counts[type],
    }));
  }, [records]);

  const qualityScoreBucketsData = useMemo(() => {
    let high = 0;
    let med = 0;
    let low = 0;
    records.forEach((r) => {
      if (r.quality_score >= 85) high++;
      else if (r.quality_score >= 60) med++;
      else low++;
    });
    return [
      { name: "High (85-100)", count: high, color: "#ffffff" },
      { name: "Med (60-84)", count: med, color: "#888888" },
      { name: "Low (0-59)", count: low, color: "#444444" },
    ];
  }, [records]);

  const riskData = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    records.forEach((r) => {
      const riskKey = r.compliance_risk.toLowerCase();
      if (riskKey in counts) counts[riskKey]++;
      else counts["low"]++;
    });
    return [
      { name: "High Risk", value: counts.high, color: "#f43f5e" },
      { name: "Med Risk", value: counts.medium, color: "#f59e0b" },
      { name: "Low Risk", value: counts.low, color: "#0070f3" },
    ];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || r.defect_type === filterType;
      const matchesRisk =
        filterRisk === "all" || r.compliance_risk === filterRisk;

      return matchesSearch && matchesType && matchesRisk;
    });
  }, [records, searchTerm, filterType, filterRisk]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricCard
          title="Total Audited Items"
          value={metrics.total_audited.toLocaleString()}
          subtext="2-Stage ML + LLM Pipeline"
          badge="Live Feed"
        />
        <MetricCard
          title="Defect Flag Rate"
          value={`${metrics.defect_flag_rate_pct}%`}
          subtext={`${metrics.total_flagged} Flagged Items`}
          badge={metrics.defect_flag_rate_pct > 30 ? "High Triage" : "Normal"}
        />
        <MetricCard
          title="Mean Quality Score"
          value={`${metrics.avg_quality_score} / 100`}
          subtext="Continuous Regressor"
          badge="Target 0-100"
        />
        <MetricCard
          title="LLM Cost Expenditure"
          value={`$${metrics.total_llm_cost_usd.toFixed(4)}`}
          subtext={`Avg Latency: ${metrics.avg_latency_ms} ms`}
          badge="90% Cost Saving"
        />
      </div>

      {/* Live Inspector Callout Banner */}
      <div className="panel rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-2 border-l-[#0070f3]">
        <div>
          <h2 className="text-xs sm:text-sm font-medium text-white tracking-tight">
            Audit Product Metadata in Real-Time
          </h2>
          <p className="text-[11px] sm:text-xs text-[#888888] mt-0.5 font-sans">
            Test raw SKU attributes against 2-Stage XGBoost classification &
            Gemini 3.1 Flash Lite Chain-of-Thought reasoning.
          </p>
        </div>

        {onNavigateToInspector && (
          <button
            onClick={onNavigateToInspector}
            className="inline-flex items-center justify-center space-x-1.5 bg-[#0070f3] hover:bg-[#3291ff] text-white text-[11px] sm:text-xs font-medium px-3 sm:px-3.5 py-1.5 rounded transition-colors shadow-sm font-mono whitespace-nowrap cursor-pointer"
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Launch Inspector</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Defect Type Breakdown */}
        <div className="lg:col-span-6 panel rounded-lg p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[#1c1c1c]">
            <div>
              <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
                Defect Type Breakdown
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-[#666666]">
              XGBoost Classifier
            </span>
          </div>

          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={defectBreakdownData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#555555"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis stroke="#555555" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    borderColor: "#222222",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="count" fill="#0070f3" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Score Buckets */}
        <div className="lg:col-span-3 panel rounded-lg p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[#1c1c1c]">
            <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
              Quality Buckets
            </h3>
          </div>
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={qualityScoreBucketsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#555555"
                  fontSize={8}
                  tickLine={false}
                />
                <YAxis stroke="#555555" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    borderColor: "#222222",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {qualityScoreBucketsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Donut */}
        <div className="lg:col-span-3 panel rounded-lg p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[#1c1c1c]">
            <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
              Compliance Tiers
            </h3>
          </div>
          <div className="h-44 sm:h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    borderColor: "#222222",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Stream */}
      <div className="panel rounded-lg p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-white tracking-tight">
              Audit Stream Logs
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#555555] pointer-events-none" />
              <input
                type="text"
                placeholder="Filter SKU or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#000000] border border-[#222222] text-white text-[11px] sm:text-xs pl-8 pr-3 py-1.5 rounded font-mono focus:outline-none focus:border-[#0070f3] w-full sm:w-56"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#000000] border border-[#222222] text-[#888888] text-[11px] sm:text-xs px-2 py-1.5 rounded font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Defect Types</option>
              <option value="none">none (Compliant)</option>
              <option value="category_mismatch">category_mismatch</option>
              <option value="truncated_title">truncated_title</option>
              <option value="missing_attribute">missing_attribute</option>
              <option value="duplicate">duplicate</option>
            </select>

            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-[#000000] border border-[#222222] text-[#888888] text-[11px] sm:text-xs px-2 py-1.5 rounded font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Risk Tiers</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs text-[#cccccc]">
            <thead className="bg-[#000000] text-[#666666] font-mono text-[9px] sm:text-[10px] uppercase border-b border-[#1c1c1c]">
              <tr>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">SKU / Time</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Product Title</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Category</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Defect Type</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Quality Score</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Risk Tier</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Latency</th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-right">
                  Inspect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414] font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-[#555555] text-xs font-mono"
                  >
                    No audit records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-[#0e0e0e] transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 font-mono">
                      <span className="block text-white font-medium">
                        {r.item_id}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[#555555]">
                        {formatTimeString(r.timestamp)}
                      </span>
                    </td>
                    <td
                      className="py-2 px-2.5 sm:py-3 sm:px-3 max-w-[150px] sm:max-w-xs truncate text-[#dddddd]"
                      title={r.title}
                    >
                      {r.title}
                    </td>
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 font-mono text-[#777777]">
                      {r.product_type}
                    </td>
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 font-mono">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-medium border ${
                          r.defect_flag === 1
                            ? "bg-[#1f1013] text-[#f43f5e] border-[#3b1219]"
                            : "bg-[#0d1b2a] text-[#0070f3] border-[#1b3a4b]"
                        }`}
                      >
                        {r.defect_type}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 font-mono font-medium text-white">
                      {r.quality_score}
                    </td>
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 font-mono">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-medium border ${
                          r.compliance_risk === "high"
                            ? "bg-[#1f1013] text-[#f43f5e] border-[#3b1219]"
                            : r.compliance_risk === "medium"
                              ? "bg-[#241a0b] text-[#f59e0b] border-[#422e11]"
                              : "bg-[#0d1b2a] text-[#0070f3] border-[#1b3a4b]"
                        }`}
                      >
                        {r.compliance_risk}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 font-mono text-[#666666]">
                      {r.latency_ms} ms
                    </td>
                    <td className="py-2 px-2.5 sm:py-3 sm:px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(r);
                        }}
                        className="text-[11px] sm:text-xs text-[#0070f3] hover:text-[#3291ff] font-mono inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
