import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if a session cookie already exists
  useEffect(() => {
    authApi.me().then(({ data }) => {
      setUser(data?.user || null);
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    const { data, error } = await authApi.login({ email, password });
    if (error) return { error };
    setUser(data.user);
    return { error: null };
  }

  async function register(payload) {
    const { data, error } = await authApi.register(payload);
    if (error) return { error };
    setUser(data.user);
    return { error: null };
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  return useContext(AuthContext);
}
