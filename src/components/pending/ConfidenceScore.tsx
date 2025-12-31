import React from "react";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ConfidenceScoreProps {
  score: number;
}

export function ConfidenceScore({
  score,
}: ConfidenceScoreProps): React.ReactElement {
  const percentage = Math.round(score * 100);

  function getScoreColor(): string {
    if (score >= 0.8) {return "#2d5f4f";}
    if (score >= 0.5) {return "#d4a574";}
    return "#c45a5a";
  }

  function getScoreLabel(): string {
    if (score >= 0.8) {return "High Confidence";}
    if (score >= 0.5) {return "Medium Confidence";}
    return "Low Confidence";
  }

  function getScoreIcon(): React.ReactElement {
    if (score >= 0.8) {return <TrendingUp className="h-3.5 w-3.5" />;}
    if (score >= 0.5) {return <Minus className="h-3.5 w-3.5" />;}
    return <TrendingDown className="h-3.5 w-3.5" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: getScoreColor() }}>
          {getScoreIcon()}
          <p className="font-mono text-xs font-medium">{getScoreLabel()}</p>
        </div>
        <p className="font-mono text-sm font-bold" style={{ color: getScoreColor() }}>
          {percentage}%
        </p>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: getScoreColor(),
          }}
        />
      </div>
    </div>
  );
}
