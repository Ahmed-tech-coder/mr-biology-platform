import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '@/context/AuthContext';
import logo from '@/assets/images/Login/Logo.jpg';
import { toast } from "sonner";
import Footer from '@/components/Footer';

const BASE_API = import.meta.env.VITE_BASE_API;


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ student_phone_number: '', student_password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  //  Validation Function
  const validateForm = () => {
    const { student_phone_number, student_password } = formData;

    if (!student_phone_number || !student_password) {
      toast.error("الرجاء إدخال رقم الهاتف وكلمة المرور");
      return false;
    }

    if (student_phone_number.length !== 11) {
      toast.error("رقم الهاتف يجب أن يكون 11 رقمًا");
      return false;
    }

    if (student_password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون على الأقل 6 أحرف");
      return false;
    }
    return true;
  };

  //  Submit Handler

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        "student_phone_number",
        formData.student_phone_number
      );
      formDataToSend.append("student_password", formData.student_password);

      const response = await fetch(
        `${BASE_API}/student/login`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success("تم تسجيل الدخول بنجاح, مرحبا بك في منصة مستر بيولوجي");
        const studentData = {
          student_token: data.new_token,
          refresh_token: data.refresh_token,
          token_expiry: data.token_expiry,
          refresh_token_expiry: data.refresh_token_expiry,
          ...data,
        };

        login(studentData, "student");
        setTimeout(() => {
          navigate(data.reason ? "/" : "/dashboard");
        }, 500);
      } else {
        toast.error(data.message || "فشل تسجيل الدخول، حاول مرة أخرى!");
      }
    } catch (err) {
      console.error("خطأ أثناء الطلب:", err);
      toast.error("❌ حدث خطأ، يرجى المحاولة لاحقًا!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col" >
      {/* Header */}
      <header className="flex items-center justify-center lg:justify-end gap-4 px-6 py-4">
        <Link to="/">
          <img
            src={logo}
            alt="Mr Biology Education"
            className="rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
          />
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-arabic-bold text-white">
          <span className="text-primary-light">Mr. </span>Biology
        </h1>
      </header>

      {/* Form */}
      <motion.div
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-sm sm:max-w-md bg-primary p-6 sm:p-10 md:p-12 lg:p-16 rounded-2xl shadow-lg space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-white font-arabic-medium mb-2">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="text"
                  name="student_phone_number"
                  value={formData.student_phone_number}
                  onChange={handleInputChange}
                  placeholder="سجل رقمك"
                  className="input-field rounded-xl w-full pr-12 bg-white/20 placeholder:text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
                  required
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-arabic-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="student_password"
                  value={formData.student_password}
                  onChange={handleInputChange}
                  placeholder="أدخل كلمة المرور"
                  className="input-field rounded-xl w-full pr-12 pl-12 bg-white/20 placeholder:text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
                  required
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="w-full rounded-xl text-lg sm:text-xl md:text-2xl font-bold bg-white text-primary-dark hover:bg-gray-100 font-arabic-semibold py-2 px-6 transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </motion.button>

            {/* Register */}
            <div className="text-center">
              <span className="text-gray-100 text-sm sm:text-base md:text-lg">هل انت لست مشترك؟&nbsp;&nbsp;</span>
              <Link
                to="/register"
                className="text-sm sm:text-base md:text-lg underline hover:text-primary-light transition-colors font-arabic-medium"
              >
                اشتراك
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
      <hr />
      <Footer showLinks={false} />
    </div>
  );
};

export default Login;
