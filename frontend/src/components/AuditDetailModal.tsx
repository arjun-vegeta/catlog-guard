"use client";

import React, { useState } from "react";
import { AuditRecord } from "../lib/types";
import { formatTimeString } from "../lib/api";
import { X, Copy, Check } from "lucide-react";

interface AuditDetailModalProps {
  record: AuditRecord | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  record,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 animate-in fade-in">
      <div
        className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg max-w-xl w-full overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1c1c1c] bg-[#000000]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-[#0070f3] bg-[#0070f3]/10 border border-[#0070f3]/20 px-2 py-0.5 rounded">
                {record.item_id}
              </span>
              <span className="text-xs text-[#666666] font-mono">
                {formatTimeString(record.timestamp)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-white mt-1 line-clamp-1">
              {record.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#777777] hover:text-white bg-[#111111] hover:bg-[#1f1f1f] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Verdict Banner */}
          <div className="flex items-center justify-between p-3.5 rounded bg-[#000000] border border-[#1c1c1c]">
            <div>
              <span
                className={`text-xs font-bold uppercase ${
                  record.defect_flag === 1 ? "text-[#f43f5e]" : "text-[#0070f3]"
                }`}
              >
                {record.defect_flag === 1
                  ? `Defect: ${record.defect_type}`
                  : "Catalog Compliant"}
              </span>
              <p className="text-[10px] text-[#666666] mt-0.5">
                Defect Prob: {(record.defect_probability * 100).toFixed(1)}% |
                Latency: {record.latency_ms} ms
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#666666] block uppercase">
                Quality Score
              </span>
              <span className="text-sm font-bold text-white">
                {record.quality_score} / 100
              </span>
            </div>
          </div>

          {/* Gemini CoT Reasoning */}
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-mono text-[#0070f3] uppercase block">
              Gemini CoT Reasoning
            </span>
            <div className="bg-[#000000] p-3.5 rounded border border-[#1c1c1c] text-xs text-[#cccccc] leading-relaxed">
              {record.reason}
            </div>
          </div>

          {/* Fix */}
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-mono text-[#f59e0b] uppercase block">
              Actionable Fix
            </span>
            <div className="bg-[#000000] p-3.5 rounded border border-[#1c1c1c] text-xs text-[#cccccc] leading-relaxed">
              {record.suggested_fix}
            </div>
          </div>

          {/* Raw JSON */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#666666] uppercase">
                Raw JSON Payload
              </span>
              <button
                onClick={handleCopyJson}
                className="text-xs text-[#888888] hover:text-white flex items-center space-x-1 font-mono cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-[#0070f3]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="bg-[#000000] border border-[#1c1c1c] p-3.5 rounded text-[11px] font-mono text-[#0070f3] overflow-x-auto">
              {JSON.stringify(record, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
