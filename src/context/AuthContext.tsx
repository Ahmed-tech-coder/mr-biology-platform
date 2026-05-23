import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

type AdminUser = {
  admin_token: string;
  [key: string]: any;
};

type StudentUser = {
  student_token: string;
  refresh_token: string;
  token_expiry: string;
  refresh_token_expiry: string;
  student_code: string;
  group_code?: string;
  student_name?: string;
  [key: string]: any;
};

type User = AdminUser | StudentUser | null;

type Role = "admin" | "student" | null;

interface AuthContextType {
  isAuth: boolean;
  user: User;
  role: Role;
  studentCode: string | null;
  login: (userData: AdminUser | StudentUser, userRole: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean>(
    !!localStorage.getItem("student_token") ||
    !!localStorage.getItem("admin_token")
  );
  const [user, setUser] = useState<User>(null);
  const [role, setRole] = useState<Role>(null);
  const [studentCode, setStudentCode] = useState<string | null>(
    localStorage.getItem("student_code") || null
  );
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();


  const refreshToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) return;

    try {
      const formData = new FormData();
      formData.append("refresh_token", refresh_token);

      const res = await fetch(
        "https://apis.mr-biology.com/student/account/updateStudentToken",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("student_token", data.new_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("token_expiry", data.token_expiry);
        localStorage.setItem("refresh_token_expiry", data.refresh_token_expiry);

        setUser((prev: any) => ({
          ...prev,
          student_token: data.new_token,
          refresh_token: data.refresh_token,
          token_expiry: data.token_expiry,
          refresh_token_expiry: data.refresh_token_expiry,
          student_name: data.student_name || prev?.student_name,
        }));
      } else {
        console.warn("❌ Failed to refresh token", data.message);
        logout();
      }
    } catch (err) {
      console.error("❌ Error while refreshing token", err);
      logout();
    }
  };


  const checkTokenExpiry = () => {
    if (role !== "student") return;

    const expiry = localStorage.getItem("token_expiry");
    if (!expiry) return;

    const expiryTime = new Date(expiry).getTime();
    const now = Date.now();

    if (expiryTime - now <= 5 * 60 * 1000) {
      refreshToken();
    }
  };


  const startTokenRefreshInterval = () => {
    if (refreshIntervalRef.current || role !== "student") return;
    refreshIntervalRef.current = setInterval(checkTokenExpiry, 60 * 1000);
  };


  const checkAuth = () => {
    const storedAdmin = localStorage.getItem("admin");
    const adminToken = localStorage.getItem("admin_token");
    const storedStudent = localStorage.getItem("student");
    const studentToken = localStorage.getItem("student_token");
    const studentCode = localStorage.getItem("student_code");
    const refreshToken = localStorage.getItem("refresh_token");
    const tokenExpiry = localStorage.getItem("token_expiry");
    const refreshTokenExpiry = localStorage.getItem("refresh_token_expiry");

    if (storedAdmin && adminToken) {
      setUser(JSON.parse(storedAdmin));
      setRole("admin");
      setIsAuth(true);
      return;
    }

    if (
      storedStudent &&
      studentToken &&
      studentCode &&
      refreshToken &&
      tokenExpiry &&
      refreshTokenExpiry
    ) {
      const now = Date.now();
      const refreshTokenExpTime = new Date(refreshTokenExpiry).getTime();

      if (now >= refreshTokenExpTime) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      setUser(JSON.parse(storedStudent));
      setRole("student");
      setStudentCode(studentCode);
      setIsAuth(true);
      startTokenRefreshInterval();
      checkTokenExpiry();
    } else {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    window.addEventListener("storage", checkAuth);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);


  const login = (userData: AdminUser | StudentUser, userRole: Role) => {
    setRole(userRole);
    setIsAuth(true);
    setUser(userData);

    if (userRole === "admin") {
      localStorage.setItem("admin", JSON.stringify(userData));
      localStorage.setItem("admin_token", (userData as AdminUser).admin_token);
    } else if (userRole === "student") {
      const sData = userData as StudentUser;
      localStorage.setItem("student", JSON.stringify(sData));
      localStorage.setItem("student_token", sData.student_token);
      localStorage.setItem("student_code", sData.student_code);
      localStorage.setItem("refresh_token", sData.refresh_token);
      localStorage.setItem("token_expiry", sData.token_expiry);
      localStorage.setItem("refresh_token_expiry", sData.refresh_token_expiry);
      if (sData.group_code) localStorage.setItem("group_code", sData.group_code);
      localStorage.setItem("role", userRole);
      setStudentCode(sData.student_code);
      startTokenRefreshInterval();
      checkTokenExpiry();
    }

    setTimeout(() => setIsAuth(true), 100);
  };


  const logout = () => {
    localStorage.clear()

    setUser(null);
    setRole(null);
    setStudentCode(null);
    setIsAuth(false);

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    localStorage.setItem("logoutEvent", Date.now().toString());
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ isAuth, user, role, studentCode, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};


const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default useAuth;
