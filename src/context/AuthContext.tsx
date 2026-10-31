import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  apiClient,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
} from "@/lib/api";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await apiClient.getProfile();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      apiClient.setAccessToken(null);
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    const tryRestore = async () => {
      try {
        await apiClient.refreshAccessToken();
        await refreshUser();
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    };
    tryRestore();
  }, [refreshUser]);

  const login = useCallback(
    async (body: LoginRequest) => {
      await apiClient.login(body);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (body: RegisterRequest) => {
      await apiClient.register(body);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    await apiClient.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
