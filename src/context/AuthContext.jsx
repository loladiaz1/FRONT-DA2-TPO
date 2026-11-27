import { createContext, useContext, useEffect, useState } from "react";
import {
  clearStoredUser,
  getStoredUser,
  login as apiLogin,
  register as apiRegister,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (username, password) => {
    const loggedUser = await apiLogin(username, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const handleRegister = async (username, password) => {
    const newUser = await apiRegister(username, password);
    return newUser;
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
