import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordStrength from '../../components/common/PasswordStrength';

function BrandMark() {
  return (
    <svg viewBox="0 0 220 220" className="brand-mark" aria-hidden="true">
      <defs>
        <linearGradient id="shieldFillR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f3b72" />
          <stop offset="100%" stopColor="#092a52" />
        </linearGradient>
      </defs>
      <path d="M110 18c29 17 54 24 78 26v66c0 48-31 79-78 102C63 189 32 158 32 110V44c24-2 49-9 78-26Z" fill="url(#shieldFillR)" />
      <path d="M78 112l22 22 48-50" fill="none" stroke="#45d0d4" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 55h104l-8 10H66z" fill="#45d0d4" opacity="0.95" />
      <path d="M84 65v-16c0-5 5-9 10-9h36c5 0 10 4 10 9v16" fill="none" stroke="#45d0d4" strokeWidth="11" strokeLinecap="round" />
    </svg>
  );
}

export default function RecoverPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [newPassword, setNewPassword] = useState('');

  function handleRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep('reset');
  }

  function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep('done');
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-branding">
          <div className="logo-frame">
            <BrandMark />
          </div>
          <div>
            <p className="eyebrow">Account recovery</p>
            <h1>Recover password</h1>
            <p className="subtitle">
              {step === 'request' && 'Enter your account email and we will send a reset link.'}
              {step === 'reset' && 'Enter your new password below.'}
              {step === 'done' && 'Your password has been updated.'}
            </p>
          </div>
        </div>

        <div className="auth-form">
          {step === 'request' && (
            <form onSubmit={handleRequest} style={{ display: 'contents' }}>
              <label>
                <span>Email address</span>
                <input type="email" name="email" placeholder="name@company.com" required autoComplete="email" />
              </label>
              <button type="submit" className="primary-button">Send recovery link</button>
              <div className="auth-links">
                <Link className="text-button" to="/login">Back to sign in</Link>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} style={{ display: 'contents' }}>
              <p className="success-message">A reset link was sent. Enter your new password:</p>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Choose a strong password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </label>
              <PasswordStrength password={newPassword} />
              <label>
                <span>Confirm password</span>
                <input type="password" name="confirm" placeholder="Repeat your password" required minLength={8} />
              </label>
              <button type="submit" className="primary-button">Set new password</button>
            </form>
          )}

          {step === 'done' && (
            <>
              <p className="success-message">✓ Password updated successfully.</p>
              <Link className="primary-button" to="/login" style={{ textAlign: 'center' }}>Back to sign in</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
