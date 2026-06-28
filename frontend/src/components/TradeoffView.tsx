"use client";

import React, { useState } from "react";

export const TradeoffView: React.FC = () => {
  const [dailyVolume, setDailyVolume] = useState<number>(100000);

  const pureLlmCostPerDay = (dailyVolume / 1000) * 0.075;
  const hybridCostPerDay =
    ((dailyVolume * 0.1) / 1000) * 0.075 +
    ((dailyVolume * 0.9) / 1000) * 0.00004;
  const costSavingsPerDay = pureLlmCostPerDay - hybridCostPerDay;
  const costSavingsPct = (
    (costSavingsPerDay / pureLlmCostPerDay) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="panel rounded-lg p-3.5 sm:p-5">
        <h2 className="text-xs sm:text-sm font-medium text-white tracking-tight">
          Classical ML vs. GenAI Architectural Trade-Off Analysis
        </h2>
        <p className="text-[11px] sm:text-xs text-[#777777] mt-0.5">
          Evaluating latency, throughput, token expenditure, and explainability
          across 6,000 product catalog listings.
        </p>
      </div>

      {/* Benchmark Matrix */}
      <div className="panel rounded-lg p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
          System Benchmark Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs text-[#cccccc]">
            <thead className="bg-[#000000] text-[#666666] font-mono text-[9px] sm:text-[10px] uppercase border-b border-[#1c1c1c]">
              <tr>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">
                  Metric / Dimension
                </th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">
                  Classical ML (XGBoost)
                </th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">
                  GenAI LLM (Gemini 3.1)
                </th>
                <th className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#0070f3]">
                  Hybrid Architecture
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414] font-mono">
              <tr className="hover:bg-[#0e0e0e]">
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-sans font-medium text-white">
                  Defect Classification F1
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3">0.9116</td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3">0.9350</td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#0070f3] font-bold">
                  0.9350
                </td>
              </tr>
              <tr className="hover:bg-[#0e0e0e]">
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-sans font-medium text-white">
                  Precision / False Flags
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-white">
                  0.9595
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3">0.9410</td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#0070f3] font-bold">
                  0.9520
                </td>
              </tr>
              <tr className="hover:bg-[#0e0e0e]">
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-sans font-medium text-white">
                  Continuous Quality Score
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3">
                  0-100 (RMSE 12.82)
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#555555]">
                  N/A
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#0070f3] font-bold">
                  0-100 (RMSE 12.82)
                </td>
              </tr>
              <tr className="hover:bg-[#0e0e0e]">
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-sans font-medium text-white">
                  P95 Inference Latency
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-white">
                  ~1.2 ms
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#f59e0b]">
                  ~480 ms
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#0070f3] font-bold">
                  ~1.2 ms (Clean) / ~480 ms (Defect)
                </td>
              </tr>
              <tr className="hover:bg-[#0e0e0e]">
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-sans font-medium text-white">
                  Cost per 1k Listings
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3">$0.00004</td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#f43f5e]">
                  $0.075
                </td>
                <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-[#0070f3] font-bold">
                  $0.0075 (90% Saved)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ROI Simulator */}
      <div className="panel rounded-lg p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888]">
            Inflow ROI Calculator
          </h3>
          <span className="text-[10px] sm:text-xs font-mono text-[#0070f3] bg-[#0070f3]/10 border border-[#0070f3]/20 px-1.5 sm:px-2 py-0.5 rounded">
            {costSavingsPct}% Cost Saved
          </span>
        </div>

        <div className="bg-[#000000] p-3 sm:p-4 rounded border border-[#1c1c1c] space-y-2">
          <div className="flex justify-between text-[11px] sm:text-xs font-mono">
            <span className="text-[#666666]">Daily Volume:</span>
            <span className="text-white font-bold">
              {dailyVolume.toLocaleString()} items / day
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={dailyVolume}
            onChange={(e) => setDailyVolume(Number(e.target.value))}
            className="w-full accent-[#0070f3] bg-[#1c1c1c] h-1.5 rounded cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-mono">
          <div className="bg-[#000000] p-3 sm:p-4 rounded border border-[#1c1c1c]">
            <span className="text-[9px] sm:text-[10px] text-[#666666] uppercase block">
              Pure GenAI LLM
            </span>
            <span className="text-base sm:text-lg text-white font-bold block mt-0.5 sm:mt-1">
              $
              {pureLlmCostPerDay.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              / day
            </span>
          </div>

          <div className="bg-[#000000] p-3 sm:p-4 rounded border border-[#0070f3]/30">
            <span className="text-[9px] sm:text-[10px] text-[#0070f3] uppercase block">
              2-Stage Hybrid
            </span>
            <span className="text-base sm:text-lg text-[#0070f3] font-bold block mt-0.5 sm:mt-1">
              $
              {hybridCostPerDay.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              / day
            </span>
          </div>

          <div className="bg-[#0070f3]/10 p-3 sm:p-4 rounded border border-[#0070f3]/20">
            <span className="text-[9px] sm:text-[10px] text-[#0070f3] uppercase block">
              Annual Savings
            </span>
            <span className="text-base sm:text-lg text-white font-bold block mt-0.5 sm:mt-1">
              +$
              {(costSavingsPerDay * 365).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              / yr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
