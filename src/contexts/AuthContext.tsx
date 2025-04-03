
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userName: string | null;
  login: (role: string, name: string) => void;
  logout: () => void;
  checkAuthAccess: (requiredRole?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on component mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("username");
    
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUserName(name);
  }, []);

  const login = (role: string, name: string) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", name);
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    navigate("/login");
  };

  const checkAuthAccess = (requiredRole?: string) => {
    if (!isLoggedIn) return false;
    if (!requiredRole) return true;
    
    // If required role is "admin", only admins can access
    if (requiredRole === "admin" && userRole !== "admin") return false;
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, login, logout, checkAuthAccess }}>
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
