"use client";

import React, { useState } from "react";
import { ListingRequest, ListingResponse } from "../lib/types";
import { checkListing, SAMPLE_PAYLOADS } from "../lib/api";
import { API_BASE_URL } from "../lib/config";
import { RefreshCw, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

interface LiveAuditorProps {
  onAuditComplete?: (result: ListingResponse, request: ListingRequest) => void;
}

export const LiveAuditor: React.FC<LiveAuditorProps> = ({
  onAuditComplete,
}) => {
  const [formData, setFormData] = useState<ListingRequest>({
    ...SAMPLE_PAYLOADS[0].payload,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (payload: ListingRequest) => {
    setFormData({ ...payload });
    setResult(null);
    setError(null);
  };

  const handleChange = (field: keyof ListingRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await checkListing(formData, API_BASE_URL);
      setResult(res);
      if (onAuditComplete) {
        onAuditComplete(res, formData);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to execute catalog audit",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="panel rounded-lg p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs sm:text-sm font-medium text-white tracking-tight">
            Interactive Catalog Inspector
          </h2>
          <p className="text-[11px] sm:text-xs text-[#777777] mt-0.5 font-sans">
            Test product metadata against 2-Stage XGBoost ML triage & Gemini 3.1
            Flash Lite.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[9px] sm:text-[10px] font-mono text-[#666666] uppercase">
            Presets:
          </span>
          {SAMPLE_PAYLOADS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(sample.payload)}
              className="text-[11px] sm:text-xs bg-[#000000] hover:bg-[#161616] text-[#cccccc] hover:text-white px-2 sm:px-2.5 py-1 rounded border border-[#222222] transition-colors font-mono cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Form Column */}
        <div className="lg:col-span-6 panel rounded-lg p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#1c1c1c]">
            <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
              Metadata Payload
            </h3>
            <span className="text-[9px] sm:text-[10px] font-mono text-[#666666]">
              JSON Input
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                  SKU / Item ID
                </label>
                <input
                  type="text"
                  value={formData.item_id}
                  onChange={(e) => handleChange("item_id", e.target.value)}
                  className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#0070f3]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                  Category (product_type)
                </label>
                <select
                  value={formData.product_type}
                  onChange={(e) => handleChange("product_type", e.target.value)}
                  className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#0070f3] cursor-pointer"
                >
                  {[
                    "HARDWARE",
                    "SHOES",
                    "MECHANICAL_COMPONENTS",
                    "SOFA",
                    "HOME_FURNITURE",
                    "ELECTRONICS",
                    "CLOTHING",
                    "BEAUTY",
                    "KITCHEN",
                    "OFFICE_PRODUCTS",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                Product Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white focus:outline-none focus:border-[#0070f3]"
                placeholder="Product title..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand || ""}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white focus:outline-none focus:border-[#0070f3]"
                  placeholder="e.g. ProHardware"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material || ""}
                  onChange={(e) => handleChange("material", e.target.value)}
                  className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white focus:outline-none focus:border-[#0070f3]"
                  placeholder="e.g. Stainless Steel"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                Bullet Points
              </label>
              <textarea
                value={formData.bullet_points || ""}
                onChange={(e) => handleChange("bullet_points", e.target.value)}
                rows={2}
                className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white focus:outline-none focus:border-[#0070f3] resize-none"
                placeholder="Bullet specifications..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color || ""}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white focus:outline-none focus:border-[#0070f3]"
                  placeholder="e.g. Silver"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono text-[#666666] mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.item_dimensions || ""}
                  onChange={(e) =>
                    handleChange("item_dimensions", e.target.value)
                  }
                  className="w-full bg-[#000000] border border-[#222222] rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#0070f3]"
                  placeholder="e.g. 22 x 1.77 in"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0070f3] hover:bg-[#3291ff] text-white font-medium py-2 sm:py-2.5 px-4 rounded text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execute Catalog Audit</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          <div className="panel rounded-lg p-3.5 sm:p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#1c1c1c]">
                <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
                  Audit Result Card
                </h3>
                {result && (
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#0070f3] bg-[#0070f3]/10 border border-[#0070f3]/20 px-2 py-0.5 rounded">
                    {result.latency_ms} ms
                  </span>
                )}
              </div>

              {error && (
                <div className="bg-[#1f1013] border border-[#3b1219] text-[#f43f5e] p-3 rounded text-xs font-mono">
                  {error}
                </div>
              )}

              {!result && !loading && !error && (
                <div className="py-12 sm:py-16 text-center text-[#555555]">
                  <p className="text-xs font-mono">
                    Click &quot;Execute Catalog Audit&quot; to test.
                  </p>
                </div>
              )}

              {loading && (
                <div className="py-12 sm:py-16 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 mx-auto animate-spin text-[#0070f3]" />
                  <p className="text-xs text-[#777777] font-mono">
                    XGBoost ML ➔ Gemini 3.1 Flash Lite
                  </p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-3 sm:space-y-4 font-mono">
                  {/* Verdict */}
                  <div className="flex items-center justify-between p-3 sm:p-3.5 rounded bg-[#000000] border border-[#1c1c1c]">
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      {result.defect_flag === 1 ? (
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#f43f5e]" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0070f3]" />
                      )}
                      <div>
                        <span
                          className={`text-[11px] sm:text-xs font-bold uppercase ${
                            result.defect_flag === 1
                              ? "text-[#f43f5e]"
                              : "text-[#0070f3]"
                          }`}
                        >
                          {result.defect_flag === 1
                            ? `Defect: ${result.defect_type}`
                            : "Catalog Compliant"}
                        </span>
                        <p className="text-[9px] sm:text-[10px] text-[#666666] mt-0.5">
                          Defect Prob:{" "}
                          {(result.defect_probability * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <span className="text-xs sm:text-sm text-white font-bold">
                      {result.quality_score} / 100
                    </span>
                  </div>

                  {/* Gemini CoT Reasoning */}
                  <div className="bg-[#000000] border border-[#1c1c1c] rounded p-3 sm:p-3.5 space-y-1 sm:space-y-1.5 font-sans">
                    <span className="text-[10px] sm:text-[11px] font-mono text-[#0070f3] uppercase block">
                      Gemini CoT Reasoning
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#cccccc] leading-relaxed">
                      {result.reason}
                    </p>
                  </div>

                  {/* Fix Recommendation */}
                  <div className="bg-[#000000] border border-[#1c1c1c] rounded p-3 sm:p-3.5 space-y-1 sm:space-y-1.5 font-sans">
                    <span className="text-[10px] sm:text-[11px] font-mono text-[#f59e0b] uppercase block">
                      Recommended Fix
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#cccccc] leading-relaxed">
                      {result.suggested_fix}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
