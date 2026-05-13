import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  getStoredAuthToken,
  login as loginRequest,
  logout as logoutRequest,
  setAuthToken,
  setUnauthorizedHandler,
  signup as signupRequest,
  type AuthUser,
  type LoginInput,
  type SignupInput,
} from "../lib/regcheck-api";
import { AuthContext, type AuthContextValue } from "./context";

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = getStoredAuthToken();
    if (storedToken === null) {
      setIsLoading(false);
      return;
    }

    setAuthToken(storedToken);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const signup = useCallback(async (input: SignupInput) => {
    const response = await signupRequest(input);
    setAuthToken(response.access_token);
    setUser(response.user);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    setAuthToken(response.access_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Stateless JWT logout should still clear the client session.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signup,
      login,
      logout,
    }),
    [user, isLoading, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
