import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Phone, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logo from "@/assets/images/Login/Logo.jpg";
import Footer from "@/components/Footer";

const Register = () => {
  const [formData, setFormData] = useState({
    student_name: "",
    student_phone_number: "",
    parent_phone_number: "",
    student_password: "",
    student_password_confirmation: "",
    account_type: "online",
    group_code: "",
    student_image: null as File | null,
  });

  const [groups, setGroups] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as any;
    if (type === "file" && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchGroups = async (type: string) => {
    try {
      const res = await fetch(
        `https://apis.mr-biology.com/student/getGroups?group_type=${type}`
      );
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setGroups(data.groups);
      } else {
        toast.error("فشل في جلب المجموعات");
        setGroups([]);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل المجموعات");
      console.error(error);
    }
  };

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    fetchGroups(e.target.value);
  };

  const validateForm = () => {
    const {
      student_name,
      student_phone_number,
      parent_phone_number,
      student_password,
      student_password_confirmation,
      group_code,
      account_type,
      student_image,
    } = formData;

    if (
      !student_name ||
      !student_phone_number ||
      !parent_phone_number ||
      !student_password ||
      !student_password_confirmation ||
      !group_code ||
      (account_type === "center" && !student_image)
    ) {
      toast.error("يرجى ملء جميع الحقول بشكل صحيح");
      return false;
    }

    if (student_password !== student_password_confirmation) {
      toast.error("كلمات المرور غير متطابقة");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value as any);
    });

    try {
      const res = await fetch("https://apis.mr-biology.com/student/register", {
        method: "POST",
        body: formDataToSend,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "فشل التسجيل");

      toast.success("تم إنشاء الحساب بنجاح ✅");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء العملية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center lg:justify-end gap-4 px-6 py-4">
        <Link to="/">
          <img
            src={logo}
            alt="Mr. Biology"
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
        <div className="w-full max-w-5xl bg-primary p-8 sm:p-12 rounded-2xl shadow-lg space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم الطالب */}
            <div>
              <label className="block text-white mb-2">اسم الطالب</label>
              <div className="relative">
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  placeholder="أدخل اسم الطالب"
                  className="input-field w-full pr-12 rounded-xl bg-white/20 text-white placeholder:text-gray-200"
                  required
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            {/* هواتف */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">هاتف الطالب</label>
                <div className="relative">
                  <input
                    type="text"
                    name="student_phone_number"
                    value={formData.student_phone_number}
                    onChange={handleChange}
                    placeholder="أدخل رقم الطالب"
                    className="input-field w-full pr-12 rounded-xl bg-white/20 text-white placeholder:text-gray-200"
                    required
                  />
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">هاتف ولي الأمر</label>
                <div className="relative">
                  <input
                    type="text"
                    name="parent_phone_number"
                    value={formData.parent_phone_number}
                    onChange={handleChange}
                    placeholder="أدخل رقم ولي الأمر"
                    className="input-field w-full pr-12 rounded-xl bg-white/20 text-white placeholder:text-gray-200"
                    required
                  />
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>

            {/* كلمات المرور */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-white mb-2">كلمة المرور</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="student_password"
                  value={formData.student_password}
                  onChange={handleChange}
                  className="input-field w-full pr-12 pl-12 rounded-xl bg-white/20 text-white placeholder:text-gray-200"
                  placeholder="كلمة المرور"
                  required
                />
                <Lock className="absolute right-4 top-1/2  text-gray-300" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2  text-gray-300"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-white mb-2">تأكيد كلمة المرور</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="student_password_confirmation"
                  value={formData.student_password_confirmation}
                  onChange={handleChange}
                  className="input-field w-full pr-12 pl-12 rounded-xl bg-white/20 text-white placeholder:text-gray-200"
                  placeholder="تأكيد كلمة المرور"
                  required
                />
                <Lock className="absolute right-4 top-1/2  text-gray-300" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2  text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* نوع الحساب */}
            <div className="flex justify-center gap-8">
              {["online", "center"].map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer px-6 py-3 rounded-2xl border-2 transition 
                    ${formData.account_type === type
                      ? "border-primary-light bg-white/20 text-white shadow-lg"
                      : "border-gray-400 text-white hover:border-primary-light hover:text-primary-light"
                    }`}
                >
                  <input
                    type="radio"
                    name="account_type"
                    value={type}
                    checked={formData.account_type === type}
                    onChange={handleAccountTypeChange}
                    className="hidden"
                  />
                  {type === "online" ? "أونلاين" : "سنتر"}
                </label>
              ))}
            </div>

            {/* صورة الطالب لو سنتر */}
            {formData.account_type === "center" && (
              <div>
                <label className="block text-white mb-3">صورة الطالب</label>
                <label
                  htmlFor="student_image"
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20"
                >
                  <Upload className="w-10 h-10 text-gray-300 mb-2" />
                  <span className="text-gray-200">اسحب الصورة أو اضغط للرفع</span>
                  <input
                    id="student_image"
                    type="file"
                    name="student_image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
                {formData.student_image && (
                  <img
                    src={URL.createObjectURL(formData.student_image)}
                    alt="صورة الطالب"
                    className="mt-4 w-28 h-28 rounded-xl object-cover"
                  />
                )}
              </div>
            )}

            {/* اختيار المجموعة */}
            <div>
              <label className="block text-white mb-3">اختر المجموعة</label>
              <div className="relative">
                <select
                  name="group_code"
                  value={formData.group_code}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl bg-primary-dark text-white px-4 py-3"
                  required
                >
                  <option value="">-- اختر المجموعة --</option>
                  {groups.map((group) => (
                    <option key={group.group_code} value={group.group_code}>
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* زر */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-primary-dark rounded-xl py-3 font-bold hover:bg-gray-100 transition disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </motion.button>

            <div className="text-center text-gray-200">
              هل لديك حساب بالفعل؟
              <Link to="/login" className="mr-2 underline text-primary-dark hover:text-primary-light">
                تسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </motion.div>

      <Footer showLinks={false} />
    </div>
  );
};

export default Register;
