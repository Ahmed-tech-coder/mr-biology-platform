import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  Home,
  BookOpen,
  CreditCard,
  FileQuestion,
  User,
  CircleUserRound,
  Menu,
  X,
  Video,
  Group,
  GitPullRequestArrow,
  File,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/images/Login/Logo.jpg";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { logout } = useAdminAuth();

  const navigationSections = [
    {
      title: "الرئيسية",
      items: [
        { to: "/admin", label: "الرئيسية", icon: Home },
        { to: "/users", label: "المستخدمين", icon: User },
        { to: "/administration", label: "المسؤولين", icon: CircleUserRound },
      ],
    },
    {
      title: "المحتوى",
      items: [
        { to: "/courses", label: "الكورسات", icon: BookOpen },
        { to: "/exams", label: "الاختبارات", icon: FileQuestion },
        { to: "/duties", label: "الواجبات", icon: File },
        { to: "/live-lectures", label: "حصص مباشرة", icon: Video },
      ],
    },
    {
      title: "الإدارة",
      items: [
        { to: "/groups", label: "المجموعات", icon: Group },
        { to: "/payments", label: "المدفوعات", icon: CreditCard },
        { to: "/requests", label: "طلبات الانضمام", icon: GitPullRequestArrow },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const renderNavSections = () =>
    navigationSections.map((section) => (
      <div key={section.title} className="mb-3">
        {/* Section Header */}
        <button
          onClick={() =>
            setOpenSection(openSection === section.title ? null : section.title)
          }
          className="flex justify-between items-center w-full px-4 py-3 text-white rounded-lg hover:bg-white/10 transition"
        >
          <span className="font-medium">{section.title}</span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              openSection === section.title ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Items */}
        <AnimatePresence>
          {openSection === section.title && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 space-y-2 mt-2"
            >
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-white text-black font-semibold"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    ));

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-sidebar text-white shadow-lg"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-72 bg-black fixed right-0 top-0 flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-center p-6 border-b border-white/10 mb-6">
            <Link to="/">
              <img
                src={logo}
                alt="Mr Biology Education"
                className="rounded-full w-16 h-16"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav>{renderNavSections()}</nav>
        </div>

        {/* Logout */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="lg:hidden fixed inset-0 bg-black/80 z-40"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="absolute right-0 top-0 h-full w-72 bg-sidebar shadow-xl flex flex-col justify-between p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Logo */}
                <div className="flex items-center justify-center p-6 border-b border-white/10 mb-6">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <img
                      src={logo}
                      alt="Mr Biology Education"
                      className="rounded-full w-16 h-16"
                    />
                  </Link>
                </div>

                {/* Navigation */}
                <nav>{renderNavSections()}</nav>
              </div>

              {/* Logout */}
              <div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
