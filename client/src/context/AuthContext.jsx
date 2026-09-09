import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import authService from "../services/authService";
import authServiceBridge from "../services/authServiceBridge";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // Register logout with the bridge
  useEffect(() => {
    authServiceBridge.setLogoutHandler(logout);

    return () => {
      authServiceBridge.setLogoutHandler(null);
    };
  }, [logout]);

  // Restore user when application starts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const restoreUser = async () => {
      try {
        const data = await authService.getCurrentUser();
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // Login
  const login = async (credentials) => {
    const data = await authService.login(credentials);

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  // Signup
  const signup = async (userData) => {
    const data = await authService.signup(userData);

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
