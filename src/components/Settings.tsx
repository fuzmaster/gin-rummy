import { TARGET_SCORES } from "../storage";

type Props = {
  targetScore: number;
  onTargetChange: (score: number) => void;
  onResetStats: () => void;
  onBack: () => void;
};

const TARGET_LABELS: Record<number, string> = {
  50: "Quick",
  100: "Standard",
  250: "Long",
};

export default function Settings({ targetScore, onTargetChange, onResetStats, onBack }: Props) {
  return (
    <div className="menu-screen">
      <div className="menu-card">
        <h1 className="menu-title">Settings</h1>

        <div className="settings-group">
          <div className="settings-label">Target score</div>
          <div className="settings-options">
            {TARGET_SCORES.map((score) => (
              <button
                key={score}
                className={`btn settings-option${score === targetScore ? " settings-option-active" : ""}`}
                onClick={() => onTargetChange(score)}
                aria-pressed={score === targetScore}
              >
                <span className="settings-option-value">{score}</span>
                <span className="settings-option-sub">{TARGET_LABELS[score]}</span>
              </button>
            ))}
          </div>
          <p className="settings-hint">Applies to your next game.</p>
        </div>

        <div className="settings-group">
          <div className="settings-label">Stats</div>
          <button className="btn btn-knock" onClick={onResetStats}>
            Reset lifetime stats
          </button>
        </div>

        <button className="btn btn-primary menu-main-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
