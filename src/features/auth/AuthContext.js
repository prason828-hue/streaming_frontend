import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, logoutUser } from "./authApi";
import { getMyProfile } from "../user/userApi";
import {
  setAccessToken,
  clearAccessToken,
  setRefreshToken,
  clearRefreshToken,
  getRefreshToken,
} from "../../shared/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!getRefreshToken()) {
      setLoading(false);
      return;
    }

    getMyProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) {
          clearAccessToken();
          clearRefreshToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(credentials) {
    setLoading(true);
    try {
      const loginData = await loginUser(credentials);

      if (loginData?.accessToken) setAccessToken(loginData.accessToken);
      if (loginData?.refreshToken) setRefreshToken(loginData.refreshToken);

      const profile = await getMyProfile();
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    return registerUser(payload);
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      await logoutUser(refreshToken);
    } finally {
      clearAccessToken();
      clearRefreshToken();
      setUser(null);
    }
  }

  const value = { user, setUser, loading, setLoading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
