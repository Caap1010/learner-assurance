import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_MAP: Record<string, Role> = {
  'owner@learnerassurance.com': 'owner',
  'admin@learnerassurance.com': 'admin',
  'coach@learnerassurance.com': 'coach',
  'learner@learnerassurance.com': 'learner',
  'employer@learnerassurance.com': 'employer',
  'mentor@learnerassurance.com': 'mentor',
  'manager@learnerassurance.com': 'manager',
  'institute@learnerassurance.com': 'institute',
  'ydp@learnerassurance.com': 'ydp',
};

const NAME_MAP: Record<string, string> = {
  'owner@learnerassurance.com': 'Platform Owner',
  'admin@learnerassurance.com': 'Alex Admin',
  'coach@learnerassurance.com': 'Chris Coach',
  'learner@learnerassurance.com': 'Jordan Learner',
  'employer@learnerassurance.com': 'Emma Employer',
  'mentor@learnerassurance.com': 'Maya Mentor',
  'manager@learnerassurance.com': 'Mark Manager',
  'institute@learnerassurance.com': 'Institute Admin',
  'ydp@learnerassurance.com': 'Yuki YDP Candidate',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('la_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  function login(email: string): User {
    const role = ROLE_MAP[email] ?? 'learner';
    const name = NAME_MAP[email] ?? email.split('@')[0];
    const newUser: User = { id: crypto.randomUUID(), email, role, name };
    setUser(newUser);
    localStorage.setItem('la_user', JSON.stringify(newUser));
    return newUser;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('la_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
