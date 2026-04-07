import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
};

type AuthContextType = AuthState & {
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "smartform_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ accessToken: null, refreshToken: null });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setState(JSON.parse(raw) as AuthState);
  }, []);

  const setTokens = (accessToken: string, refreshToken: string) => {
    const next = { accessToken, refreshToken };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const logout = () => {
    setState({ accessToken: null, refreshToken: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  return <AuthContext.Provider value={{ ...state, setTokens, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
