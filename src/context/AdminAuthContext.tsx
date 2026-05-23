import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AdminData = {
  admin_code: string;
  admin_name: string;
  admin_phone_number: string;
  account_role: string;
  admin_token: string;
};

type AdminAuthContextType = {
  admin: AdminData | null;
  loading: boolean;
  login: (data: AdminData) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminData");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (data: AdminData) => {
    setAdmin(data);
    localStorage.setItem("adminData", JSON.stringify(data));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.clear();
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
