import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordStrength from '../../components/common/PasswordStrength';
import type { Role } from '../../types';

const ROLE_PATHS: Record<Role, string> = {
  owner: '/owner/dashboard',
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  learner: '/learner/dashboard',
  employer: '/employer/dashboard',
  mentor: '/mentor/dashboard',
  manager: '/manager/dashboard',
  institute: '/institute/dashboard',
  ydp: '/ydp/dashboard',
};

function BrandMark() {
  return (
    <svg viewBox="0 0 200 230" className="brand-mark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Shield body */}
      <path d="M28 100 L28 154 C28 185 60 210 100 223 C140 210 172 185 172 154 L172 100 L100 80 Z" fill="#0d2a5e"/>

      {/* Mortarboard board — rhombus (top face) */}
      <polygon points="100,18 186,57 100,78 14,57" fill="#133a72"/>
      {/* Board right-face depth */}
      <polygon points="100,78 186,57 186,64 100,85" fill="#0a2555"/>
      {/* Board left-face depth */}
      <polygon points="14,57 100,78 100,85 14,64" fill="#0c2d62"/>

      {/* Cap dome — cylinder under board centre */}
      <ellipse cx="100" cy="79" rx="26" ry="11" fill="#0d2a5e"/>
      <path d="M74 79 L74 96 C74 106 86 113 100 113 C114 113 126 106 126 96 L126 79 Z" fill="#0d2a5e"/>

      {/* Tassel cord from left board corner */}
      <path d="M17 57 C14 70 13 88 17 107" fill="none" stroke="#38c5c9" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Tassel end */}
      <ellipse cx="17" cy="115" rx="7" ry="9" fill="#38c5c9"/>

      {/* Checkmark — bold cyan */}
      <path d="M63 152 L87 176 L140 122" fill="none" stroke="#38c5c9" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already logged in, redirect
  if (user) {
    navigate(ROLE_PATHS[user.role], { replace: true });
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const pw = String(formData.get('password') ?? '');

    if (!pw) { setError('Please enter your password.'); return; }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      const newUser = login(email);
      navigate(ROLE_PATHS[newUser.role], { replace: true });
    }, 700);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-branding">
          <div className="logo-frame">
            <BrandMark />
          </div>
          <div>
            <p className="eyebrow">Learner Assurance</p>
            <h1>Sign in</h1>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input type="email" name="email" placeholder="name@company.com" required autoComplete="email" />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <PasswordStrength password={password} />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="auth-links">
            <Link className="text-button" to="/recover-password">Forgot password?</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
