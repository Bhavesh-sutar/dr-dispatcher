import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    // Store the token in localStorage for persistent authentication
    localStorage.setItem("token", data.token);

    setUser(data.user);

    return data;
  };

  const signup = async (userData) => {
    const data = await authService.signup(userData);

    localStorage.setItem("token", data.token);

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    setUser(null);
  };

const value = {
  user,
  isAuthenticated: !!user,
  loading,
  login,
  signup,
  logout,
};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
