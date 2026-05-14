import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NOTIFICATIONS } from '../../data/mockData';
import type { Role, NavItem } from '../../types';

const NAV: Record<Role, NavItem[]> = {
  owner: [
    { label: 'Overview', path: '/owner/dashboard', icon: '⊞' },
    { label: 'Cohorts', path: '/owner/cohorts', icon: '🧩' },
    { label: 'Users', path: '/owner/users', icon: '👥' },
    { label: 'Permissions', path: '/owner/permissions', icon: '🔑' },
    { label: 'Executive Report', path: '/owner/reports', icon: '📊' },
    { label: 'Programmes', path: '/owner/programmes', icon: '🎓' },
    { label: 'Partners', path: '/owner/partners', icon: '🤝' },
    { label: 'Approvals', path: '/owner/approvals', icon: '✅' },
    { label: 'Compliance', path: '/owner/compliance', icon: '🛡' },
    { label: 'Interventions', path: '/owner/interventions', icon: '⚠' },
    { label: 'Communications', path: '/owner/communications', icon: '📣' },
    { label: 'Audit Log', path: '/owner/audit-log', icon: '🧾' },
    { label: 'Settings', path: '/owner/settings', icon: '⚙' },
    { label: 'Integrations', path: '/owner/integrations', icon: '🔌' },
  ],
  admin: [
    { label: 'Overview', path: '/admin/dashboard', icon: '⊞' },
    { label: 'Learners', path: '/admin/learners', icon: '🎓' },
    { label: 'Attendance', path: '/admin/attendance', icon: '📋' },
    { label: 'Coaching', path: '/admin/coaching', icon: '💬' },
    { label: 'Reviews', path: '/admin/reviews', icon: '📝' },
    { label: 'Appraisals', path: '/admin/appraisals', icon: '⭐' },
    { label: 'Goals', path: '/admin/goals', icon: '🎯' },
    { label: 'Interventions', path: '/admin/interventions', icon: '⚠' },
    { label: 'Evidence', path: '/admin/evidence', icon: '📁' },
    { label: 'Operations', path: '/admin/operations', icon: '📈' },
  ],
  coach: [
    { label: 'Overview', path: '/coach/dashboard', icon: '⊞' },
    { label: 'My Learners', path: '/coach/learners', icon: '🎓' },
    { label: 'Sessions', path: '/coach/coaching', icon: '💬' },
    { label: 'Reviews', path: '/coach/reviews', icon: '📝' },
    { label: 'Interventions', path: '/coach/interventions', icon: '⚠' },
  ],
  learner: [
    { label: 'My Dashboard', path: '/learner/dashboard', icon: '⊞' },
    { label: 'Attendance', path: '/learner/attendance', icon: '📋' },
    { label: 'Goals', path: '/learner/goals', icon: '🎯' },
    { label: 'Evidence', path: '/learner/evidence', icon: '📁' },
    { label: 'Reviews', path: '/learner/reviews', icon: '📝' },
  ],
  employer: [
    { label: 'Overview', path: '/employer/dashboard', icon: '⊞' },
    { label: 'Learner Progress', path: '/employer/learners', icon: '🎓' },
    { label: 'Reports', path: '/employer/reports', icon: '📊' },
  ],
  mentor: [
    { label: 'Overview', path: '/mentor/dashboard', icon: '⊞' },
    { label: 'My Learners', path: '/mentor/learners', icon: '🎓' },
    { label: 'Sessions', path: '/mentor/coaching', icon: '💬' },
    { label: 'Reviews', path: '/mentor/reviews', icon: '📝' },
    { label: 'Goals', path: '/mentor/goals', icon: '🎯' },
  ],
  manager: [
    { label: 'Overview', path: '/manager/dashboard', icon: '⊞' },
    { label: 'Team Learners', path: '/manager/learners', icon: '🎓' },
    { label: 'Attendance', path: '/manager/attendance', icon: '📋' },
    { label: 'Interventions', path: '/manager/interventions', icon: '⚠' },
    { label: 'Reports', path: '/manager/reports', icon: '📊' },
  ],
  institute: [
    { label: 'Overview', path: '/institute/dashboard', icon: '⊞' },
    { label: 'All Learners', path: '/institute/learners', icon: '🎓' },
    { label: 'Attendance', path: '/institute/attendance', icon: '📋' },
    { label: 'Compliance', path: '/institute/operations', icon: '📈' },
    { label: 'Reports', path: '/institute/reports', icon: '📊' },
  ],
  ydp: [
    { label: 'My Dashboard', path: '/ydp/dashboard', icon: '⊞' },
    { label: 'My Profile', path: '/ydp/profile', icon: '👤' },
    { label: 'Attendance', path: '/ydp/attendance', icon: '📋' },
    { label: 'Progress', path: '/ydp/progress', icon: '📈' },
    { label: 'Resources', path: '/ydp/resources', icon: '📚' },
  ],
};

function BrandMark() {
  return (
    <svg viewBox="0 0 200 230" className="sidebar-logo" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Shield body */}
      <path d="M28 100 L28 154 C28 185 60 210 100 223 C140 210 172 185 172 154 L172 100 L100 80 Z"
        fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>

      {/* Mortarboard board — rhombus (top face) */}
      <polygon points="100,18 186,57 100,78 14,57" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      {/* Board right-face depth */}
      <polygon points="100,78 186,57 186,64 100,85" fill="rgba(255,255,255,0.1)"/>

      {/* Cap dome */}
      <ellipse cx="100" cy="79" rx="26" ry="11" fill="rgba(255,255,255,0.18)"/>
      <path d="M74 79 L74 96 C74 106 86 113 100 113 C114 113 126 106 126 96 L126 79 Z"
        fill="rgba(255,255,255,0.14)"/>

      {/* Tassel cord */}
      <path d="M17 57 C14 70 13 88 17 107" fill="none" stroke="#38c5c9" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="17" cy="115" rx="7" ry="9" fill="#38c5c9"/>

      {/* Checkmark */}
      <path d="M63 152 L87 176 L140 122" fill="none" stroke="#38c5c9" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role ?? 'learner';
  const navItems = NAV[role];
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  // Close dropdowns on outside click
  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div ref={shellRef} className={`shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <nav className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <BrandMark />
          {sidebarOpen && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Learner</span>
              <span className="sidebar-brand-name">Assurance</span>
            </div>
          )}
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} title={!sidebarOpen ? 'Sign out' : undefined}>
            <span className="sidebar-icon">⏻</span>
            {sidebarOpen && <span className="sidebar-label">Sign out</span>}
          </button>
        </div>
      </nav>

      {/* Content area */}
      <div className="shell-content">
        {/* Header */}
        <header className="shell-header">
          <button
            className="header-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            ☰
          </button>

          <div className="header-right">
            {/* Dark mode toggle */}
            <button className="header-icon-btn" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
              {dark ? '☀' : '🌙'}
            </button>

            {/* Notifications */}
            <div className="notif-wrapper">
              <button
                className="header-icon-btn notif-btn"
                onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                🔔
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown" role="menu">
                  <p className="notif-title">Notifications</p>
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`notif-item notif-${n.type} ${n.read ? 'notif-read' : ''}`}>
                      <span>{n.message}</span>
                      <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="user-menu-wrapper">
              <button
                className="user-avatar-btn"
                onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <span className="user-avatar">{user?.name?.[0] ?? '?'}</span>
                {sidebarOpen && <span className="user-name">{user?.name}</span>}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <p className="user-dropdown-name">{user?.name}</p>
                  <p className="user-dropdown-email">{user?.email}</p>
                  <hr className="user-dropdown-divider" />
                  <button className="user-dropdown-item" onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="shell-main">
          {children}
        </main>
      </div>
    </div>
  );
}
