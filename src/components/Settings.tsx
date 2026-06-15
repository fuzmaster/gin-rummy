import type { Difficulty } from "../game/types";
import { TARGET_SCORES, DIFFICULTIES } from "../storage";

type Props = {
  targetScore: number;
  difficulty: Difficulty;
  soundOn: boolean;
  onTargetChange: (score: number) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSoundChange: (on: boolean) => void;
  onResetStats: () => void;
  onBack: () => void;
};

const TARGET_LABELS: Record<number, string> = {
  50: "Quick",
  100: "Standard",
  250: "Long",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function Settings({
  targetScore,
  difficulty,
  soundOn,
  onTargetChange,
  onDifficultyChange,
  onSoundChange,
  onResetStats,
  onBack,
}: Props) {
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
          <div className="settings-label">CPU difficulty</div>
          <div className="settings-options">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                className={`btn settings-option${level === difficulty ? " settings-option-active" : ""}`}
                onClick={() => onDifficultyChange(level)}
                aria-pressed={level === difficulty}
              >
                <span className="settings-option-value settings-option-value-sm">
                  {DIFFICULTY_LABELS[level]}
                </span>
              </button>
            ))}
          </div>
          <p className="settings-hint">Applies to your next game.</p>
        </div>

        <div className="settings-group">
          <div className="settings-label">Sound effects</div>
          <div className="settings-options">
            <button
              className={`btn settings-option${soundOn ? " settings-option-active" : ""}`}
              onClick={() => onSoundChange(true)}
              aria-pressed={soundOn}
            >
              <span className="settings-option-value settings-option-value-sm">🔊 On</span>
            </button>
            <button
              className={`btn settings-option${!soundOn ? " settings-option-active" : ""}`}
              onClick={() => onSoundChange(false)}
              aria-pressed={!soundOn}
            >
              <span className="settings-option-value settings-option-value-sm">🔇 Off</span>
            </button>
          </div>
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
