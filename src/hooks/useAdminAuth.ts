// useAdminAuth.ts
import { useState, useEffect, useCallback } from "react";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/api/auth";

/**
 * Lightweight JWT expiry check (no external dependency).
 * Returns false on any parse error.
 */
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return false;
    // Base64url -> Base64
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    // atob works in browser
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const payload = JSON.parse(json);
    if (payload && payload.exp) {
      // exp is seconds since epoch
      return Date.now() / 1000 < payload.exp;
    }
    // if no exp claim, assume valid (or change to false if you want stricter behavior)
    return true;
  } catch (e) {
    // parse error -> treat token as invalid
    return false;
  }
};

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // initialize
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(Boolean(token) && isTokenValid(token));
    setIsLoading(false);
  }, []);

  // sync across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null) {
        // localStorage cleared
        setIsAuthenticated(false);
        return;
      }
      if (e.key === "umeed_access_token") {
        const token = e.newValue;
        setIsAuthenticated(Boolean(token) && isTokenValid(token));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // login: optionally accept token and store it
  const login = useCallback((token?: string) => {
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(isTokenValid(token));
    } else {
      // If no token provided, assume already stored elsewhere and use that
      const t = getAuthToken();
      setIsAuthenticated(Boolean(t) && isTokenValid(t));
    }
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setIsAuthenticated(false);
    // do a client-side redirect; you can also return a boolean and let the caller redirect
    window.location.href = "/";
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
