import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import logo from "@/assets/images/Login/Logo.jpg";
import { useAdminAuth } from "@/context/AdminAuthContext";

const BASE_API = import.meta.env.VITE_BASE_API;

interface FormDataType {
  admin_phone_number: string;
  admin_password: string;
}

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    admin_phone_number: "",
    admin_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const { admin_phone_number, admin_password } = formData;
    if (!admin_phone_number || !admin_password) {
      toast.error("الرجاء إدخال رقم الهاتف وكلمة المرور");
      return false;
    }
    if (admin_phone_number.length !== 11 || isNaN(Number(admin_phone_number))) {
      toast.error("رقم الهاتف يجب أن يكون 11 رقمًا");
      return false;
    }
    if (admin_password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون على الأقل 6 أحرف");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("admin_phone_number", formData.admin_phone_number);
      dataToSend.append("admin_password", formData.admin_password);

      const res = await fetch(`${BASE_API}/admin/login`, {
        method: "POST",
        body: dataToSend,
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success("تم تسجيل الدخول بنجاح ");

        const adminData = {
          admin_code: data.admin_code,
          admin_name: data.admin_name,
          admin_phone_number: data.admin_phone_number,
          account_role: data.account_role,
          admin_token: data.admin_token,
        };


        localStorage.setItem("adminData", JSON.stringify(adminData));


        login(adminData);

        navigate("/admin");
      } else {
        toast.error(data.message || "فشل تسجيل الدخول، حاول مرة أخرى!");
      }

    } catch (err) {
      console.error("Login Error:", err);
      toast.error("❌ حدث خطأ، يرجى المحاولة لاحقًا!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-end gap-4 px-6 py-4">
        <img
          src={logo}
          alt="Mr Biology"
          className="rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          <span className="text-primary-light">Mr </span>Biology
        </h1>
      </header>

      {/* Form */}
      <motion.div
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-sm sm:max-w-md bg-primary p-6 sm:p-10 rounded-2xl shadow-lg space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone */}
            <div>
              <label className="block text-white font-medium mb-2">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="text"
                  name="admin_phone_number"
                  placeholder="أدخل رقم الهاتف"
                  value={formData.admin_phone_number}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-white/20 text-white placeholder-gray-200 pr-12 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-light"
                  required
                />
                <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="admin_password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.admin_password}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-white/20 text-white placeholder-gray-200 pr-12 pl-12 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-light"
                  required
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-primary-light"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl text-lg sm:text-xl md:text-2xl font-bold bg-white text-primary-dark hover:bg-gray-100 py-2 px-6 transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </motion.button>
          </form>
        </div>
      </motion.div>

      <hr className="border-gray-600" />
      <Footer showLinks={false} />
    </div>
  );
};

export default AdminLogin;
