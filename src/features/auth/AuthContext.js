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

  // On every mount (including page refresh): if a refresh token exists in
  // localStorage, apiClient will silently use it to get a new access token
  // the first time /me returns 401. So we just call /me and let apiClient
  // handle the recovery transparently.
  useEffect(() => {
    let cancelled = false;

    // Only bother calling /me if we have a stored refresh token —
    // otherwise we know for certain the session is gone and can skip
    // the network round-trip entirely.
    if (!getRefreshToken()) {
      setLoading(false);
      return;
    }

    getMyProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        // Refresh token expired / revoked / invalid — session is gone
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

      // Store both tokens from the response body
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
