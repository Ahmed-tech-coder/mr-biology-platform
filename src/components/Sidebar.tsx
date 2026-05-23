import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Home,
  BookOpen,
  CreditCard,
  Gift,
  User,
  Menu,
  FileQuestion,
  X,
  Video,
  File,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/images/Login/Logo.jpg";
import useAuth from "@/context/AuthContext";
import { toast } from "sonner";

// ================================
// Hook لتحديد الجهاز الحقيقي
// ================================
const useRealDeviceType = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ua = navigator.userAgent.toLowerCase();

      const isTablet =
        /ipad|tablet|android(?!.*mobile)/.test(ua) ||
        (width >= 768 && width <= 1400 && height <= 1200);

      const isRealDesktop = !isTablet && width >= 1024;

      setIsDesktop(isRealDesktop);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isDesktop };
};

const Sidebar = () => {
  const { isDesktop } = useRealDeviceType();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { logout } = useAuth();

  const navigationItems = [
    { to: "/dashboard", label: "الرئيسية", icon: Home },
    { to: "/my-courses", label: "كورساتي", icon: BookOpen },
    { to: "/paid-courses", label: "الكورسات المدفوعة", icon: CreditCard },
    { to: "/free-courses", label: "الكورسات المجانية", icon: Gift },
    { to: "/exam", label: "الإختبارات", icon: FileQuestion },
    { to: "/my-duties", label: "الواجبات", icon: File },
    { to: "/live-classes", label: "الحصص المباشرة", icon: Video },
  ];

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    localStorage.setItem("lastPath", path);
    navigate(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {!isDesktop && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-sidebar text-white shadow-lg"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div className="flex h-screen w-80 bg-black fixed right-0 top-0 flex-col">
          <div className="flex items-center justify-center p-10">
            <button
              onClick={() => {
                localStorage.setItem("lastPath", "/");
                navigate("/");
              }}
            >
              <img src={logo} alt="Mr Biology Education" className="rounded-full w-24 h-24" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-4">
              {navigationItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white text-sidebar"
                          : "text-white border border-white/20 hover:bg-white/10"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xl font-bold">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute right-0 top-0 h-auto w-72 bg-sidebar shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Dropdown */}
              <div className="relative flex items-center justify-center p-8">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all"
                >
                  <img
                    src={logo}
                    alt="User"
                    className="rounded-full w-10 h-10 border border-white/30"
                  />
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-20 bg-white text-sidebar rounded-xl shadow-lg w-48 overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        handleNavigation("/profile");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-right"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">الصفحة الشخصية</span>
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 text-right"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">تسجيل الخروج</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <ul className="space-y-4">
                  {navigationItems.map((item) => (
                    <li key={item.to}>
                      <button
                        onClick={() => handleNavigation(item.to)}
                        className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                          location.pathname === item.to
                            ? "bg-white text-sidebar"
                            : "text-white border border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-lg font-bold">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
