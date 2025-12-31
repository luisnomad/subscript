import { type ReactElement } from 'react';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConfidenceScoreProps {
  score: number;
}

const PERCENTAGE_MULTIPLIER = 100;
const HIGH_CONFIDENCE_THRESHOLD = 0.8;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.5;

export function ConfidenceScore({
  score,
}: ConfidenceScoreProps): ReactElement {
  const percentage = Math.round(score * PERCENTAGE_MULTIPLIER);

  function getScoreColor(): string {
    if (score >= HIGH_CONFIDENCE_THRESHOLD) {
      return '#2d5f4f';
    }
    if (score >= MEDIUM_CONFIDENCE_THRESHOLD) {
      return '#d4a574';
    }
    return '#c45a5a';
  }

  function getScoreLabel(): string {
    if (score >= HIGH_CONFIDENCE_THRESHOLD) {
      return 'High Confidence';
    }
    if (score >= MEDIUM_CONFIDENCE_THRESHOLD) {
      return 'Medium Confidence';
    }
    return 'Low Confidence';
  }

  function getScoreIcon(): ReactElement {
    if (score >= HIGH_CONFIDENCE_THRESHOLD) {
      return <TrendingUp className="h-3.5 w-3.5" />;
    }
    if (score >= MEDIUM_CONFIDENCE_THRESHOLD) {
      return <Minus className="h-3.5 w-3.5" />;
    }
    return <TrendingDown className="h-3.5 w-3.5" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2"
          style={{ color: getScoreColor() }}
        >
          {getScoreIcon()}
          <p className="font-mono text-xs font-medium">{getScoreLabel()}</p>
        </div>
        <p
          className="font-mono text-sm font-bold"
          style={{ color: getScoreColor() }}
        >
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
