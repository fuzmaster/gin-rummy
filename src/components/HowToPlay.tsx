type Props = {
  onBack: () => void;
};

export default function HowToPlay({ onBack }: Props) {
  return (
    <div className="menu-screen">
      <div className="menu-card menu-card-wide">
        <h1 className="menu-title">How to Play</h1>

        <div className="howto-body">
          <h2>Goal</h2>
          <p>
            Be the first to reach the target score. Each round you try to organise
            your 10 cards into <strong>melds</strong> and keep your leftover
            <strong> deadwood</strong> as low as possible.
          </p>

          <h2>Melds</h2>
          <ul>
            <li><strong>Run</strong> — 3+ cards of the same suit in sequence (e.g. 4♥ 5♥ 6♥).</li>
            <li><strong>Set</strong> — 3 or 4 cards of the same rank (e.g. 7♠ 7♥ 7♣).</li>
          </ul>
          <p>Melded cards are colour-coded in your hand so you can see them at a glance.</p>

          <h2>Each turn</h2>
          <ol>
            <li><strong>Draw</strong> one card — from the stock pile or the top of the discard pile.</li>
            <li><strong>Discard</strong> one card to end your turn.</li>
          </ol>

          <h2>Deadwood &amp; knocking</h2>
          <p>
            Deadwood is the point value of cards not in a meld (Ace = 1, face cards = 10).
            When your deadwood is <strong>10 or less</strong>, you may <strong>Knock</strong> to
            end the round.
          </p>

          <h2>Scoring</h2>
          <ul>
            <li><strong>Knock</strong> — you score the difference between the two hands' deadwood.</li>
            <li><strong>Gin</strong> — knock with zero deadwood for a 25-point bonus.</li>
            <li><strong>Undercut</strong> — if the defender's deadwood is equal or lower, they steal 25 points plus the difference.</li>
          </ul>
        </div>

        <button className="btn btn-primary menu-main-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
