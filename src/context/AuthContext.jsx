import { createContext, useContext, useState } from "react";
import {
  clearStoredUser,
  getStoredUser,
  login as apiLogin,
  register as apiRegister,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

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
        loading: false,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Kept in this module so the provider and its context hook share one context instance.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
