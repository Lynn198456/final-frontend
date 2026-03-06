import { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';

export function UserProvider({ children }) {
  const initialUser = {
    isLoggedIn: false,
    name: '',
    email: '',
    role: 'USER',
    firstname: '',
    lastname: '',
  };

  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(initialUser);

  async function fetchProfile() {
    const result = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!result.ok) {
      throw new Error('Cannot load user profile');
    }

    const profile = await result.json();
    return {
      isLoggedIn: true,
      name: profile.username || profile.firstname || profile.email?.split('@')[0] || '',
      email: profile.email || '',
      role: (profile.role || 'USER').toUpperCase(),
      firstname: profile.firstname || '',
      lastname: profile.lastname || '',
    };
  }

  const login = async (email, password) => {
    if (!API_URL) {
      return { ok: false, message: 'VITE_API_URL is not set' };
    }

    try {
      const result = await fetch(`${API_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!result.ok) {
        const payload = await result.json().catch(() => ({}));
        return { ok: false, message: payload.message || 'Login failed' };
      }

      let newUser;
      try {
        newUser = await fetchProfile();
      } catch (error) {
        newUser = {
          isLoggedIn: true,
          name: email.split('@')[0] || '',
          email,
          role: 'USER',
          firstname: '',
          lastname: '',
        };
      }

      setUser(newUser);
      localStorage.setItem('session', JSON.stringify(newUser));
      return { ok: true, message: '' };
    } catch (error) {
      return { ok: false, message: error?.message || 'Cannot reach backend API' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // No-op. Local logout still proceeds.
    }

    setUser(initialUser);
    localStorage.removeItem('session');
  };

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) {
      return;
    }

    try {
      const parsed = JSON.parse(session);
      if (parsed?.isLoggedIn) {
        setUser(parsed);
      }
    } catch (error) {
      localStorage.removeItem('session');
    }
  }, []);

  return <UserContext.Provider value={{ user, login, logout, API_URL }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
