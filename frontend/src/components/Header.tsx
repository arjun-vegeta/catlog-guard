"use client";

import React from "react";
import { Shield } from "lucide-react";
import { HealthResponse } from "../lib/types";

interface HeaderProps {
  activeTab: "analytics" | "auditor" | "tradeoff";
  setActiveTab: (tab: "analytics" | "auditor" | "tradeoff") => void;
  health: HealthResponse | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  health,
}) => {
  const isConnected = health !== null && health.status === "healthy";

  return (
    <header className="sticky top-0 z-50 bg-[#000000] border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-0 sm:h-14 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#111111] border border-[#262626] flex items-center justify-center text-white">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="font-medium text-xs sm:text-sm text-white tracking-tight">
              Catalog Guardian
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-[#777777] bg-[#111111] border border-[#222222] px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#1c1c1c]">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md cursor-pointer transition-colors ${
              activeTab === "analytics"
                ? "bg-[#1f1f1f] text-white"
                : "text-[#888888] hover:text-white"
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setActiveTab("auditor")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md cursor-pointer transition-colors ${
              activeTab === "auditor"
                ? "bg-[#1f1f1f] text-white"
                : "text-[#888888] hover:text-white"
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setActiveTab("tradeoff")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md cursor-pointer transition-colors ${
              activeTab === "tradeoff"
                ? "bg-[#1f1f1f] text-white"
                : "text-[#888888] hover:text-white"
            }`}
          >
            ROI Evaluation
          </button>
        </nav>

        {/* Connection Status */}
        <div className="hidden sm:flex items-center space-x-2 bg-[#0a0a0a] border border-[#1c1c1c] px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-[#0070f3]" : "bg-[#f59e0b]"
            }`}
          />
          <span className="text-[#888888]">
            {isConnected ? "FastAPI Online" : "Local Mode"}
          </span>
        </div>
      </div>
    </header>
  );
};
