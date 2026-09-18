import { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api, { setAuthToken, clearAuthToken, getAuthToken } from "../../lib/api";

const AdminAuthContext = createContext(null);

export function getStoredCredentials() {
  return [
    {
      email: "subashstudio009@gmail.com",
      password: "subash@2026",
      name: "Subash",
      role: "Studio Director & Founder",
    },
  ];
}

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  // Validate session on mount
  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const data = await api.get("/api/auth/me");
        if (mounted && data?.user) {
          setAdminUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (mounted) {
          clearAuthToken();
          setIsAuthenticated(false);
          setAdminUser(null);
        }
      } finally {
        if (mounted) {
          setInitialChecking(false);
        }
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPassword = (password || "").trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error("Please enter both email and password.");
      }

      const res = await api.post("/api/auth/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!res.success || !res.user) {
        throw new Error(res.error || "Login failed.");
      }

      if (res.token) {
        setAuthToken(res.token);
      }

      setIsAuthenticated(true);
      setAdminUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Fallback
    } finally {
      clearAuthToken();
      setIsAuthenticated(false);
      setAdminUser(null);
    }
  };

  const updateProfile = async (updatedData) => {
    const res = await api.put("/api/auth/profile", updatedData);
    if (res.user) {
      setAdminUser(res.user);
    }
    return res.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const cleanCurrent = (currentPassword || "").trim();
    const cleanNew = (newPassword || "").trim();

    if (!cleanCurrent) {
      throw new Error("Please enter your current password.");
    }
    if (!cleanNew) {
      throw new Error("Please enter a new password.");
    }
    if (cleanNew.length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }

    await api.post("/api/auth/change-password", {
      currentPassword: cleanCurrent,
      newPassword: cleanNew,
    });

    return true;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        loading: loading || initialChecking,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

export function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-3 border-[#C9A669] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
