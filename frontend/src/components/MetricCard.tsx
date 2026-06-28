import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  badge,
}) => {
  return (
    <div className="panel panel-hover rounded-lg p-3 sm:p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-mono text-[#666666] uppercase tracking-wider">
          {title}
        </span>
        {badge && (
          <span className="text-[9px] sm:text-[10px] font-mono text-[#888888] bg-[#141414] border border-[#222222] px-1.5 sm:px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 sm:mt-3">
        <span className="text-xl sm:text-2xl font-mono font-medium text-white tracking-tight">
          {value}
        </span>
      </div>

      {subtext && (
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#161616] text-[10px] sm:text-[11px] text-[#666666] truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
