interface PasswordStrengthProps {
  password: string;
}

function score(password: string) {
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

const LEVELS = [
  { label: 'Very weak', color: '#ef4444' },
  { label: 'Weak', color: '#f97316' },
  { label: 'Fair', color: '#f59e0b' },
  { label: 'Strong', color: '#84cc16' },
  { label: 'Very strong', color: '#10b981' },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const s = Math.min(score(password), 4);
  const level = LEVELS[s];

  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {LEVELS.map((l, i) => (
          <div
            key={i}
            className="pw-bar"
            style={{ background: i <= s ? level.color : 'var(--input-border)' }}
          />
        ))}
      </div>
      <span className="pw-label" style={{ color: level.color }}>{level.label}</span>
    </div>
  );
}
