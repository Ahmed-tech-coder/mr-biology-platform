import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, XCircle, Loader2, User, Phone, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

const EditAdministration = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;
  const { admin_code } = useParams();
  const location = useLocation();
  const adminData = location.state;

  const [formData, setFormData] = useState({
    admin_name: "",
    admin_phone_number: "",
    admin_password: "",
    account_role: "admin",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminData) {
      setFormData({
        admin_name: adminData.admin_name || "",
        admin_phone_number: adminData.admin_phone_number || "",
        admin_password: "",
        account_role: adminData.account_role || "admin",
      });
    } else {
      fetchAdminData();
    }
  }, [adminData]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch(
        `https://apis.mr-biology.com/admin/admins/getAdmins/${admin_code}`
      );
      const result = await response.json();

      if (result.reason === "unauthorized") {
        logout();
        toast.info("⚠️ يرجى تسجيل الدخول مرة أخرى");
        return;
      }

      if (result.status === "success") {
        setFormData({
          admin_name: result.data.admin_name,
          admin_phone_number: result.data.admin_phone_number,
          admin_password: "",
          account_role: result.data.account_role,
        });
      } else {
        toast.error("❌ حدث خطأ أثناء جلب بيانات المسؤول.");
      }
    } catch (error) {
      toast.error("❌ خطأ في الاتصال بالسيرفر");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminToken) {
      toast.error("❌ حدث خطأ (Token مفقود).");
      return;
    }

    const data = new FormData();
    data.append("admin_token", adminToken);
    data.append("admin_code", admin_code || "");
    data.append("admin_name", formData.admin_name);
    data.append("admin_phone_number", formData.admin_phone_number);
    if (formData.admin_password) {
      data.append("admin_password", formData.admin_password);
    }
    data.append("account_role", formData.account_role);

    setLoading(true);
    try {
      const response = await fetch(
        "https://apis.mr-biology.com/admin/admins/updateAdmin",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (result.reason === "unauthorized") {
        logout();
        toast.info("⚠️ يرجى تسجيل الدخول مرة أخرى");
        return;
      }

      if (result.status === "success") {
        toast.success("✅ تم تعديل المسؤول بنجاح!");
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      } else {
        toast.error(result.message || "❌ حدث خطأ أثناء التعديل.");
      }
    } catch (error) {
      toast.error("❌ خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "admin", label: "أدمن", color: "bg-blue-100 text-blue-700" },
    { value: "super_admin", label: "سوبر أدمن", color: "bg-red-100 text-red-700" },
    { value: "corrector", label: "مصحح", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="container-custom section-padding mt-16 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl p-10 max-w-3xl mx-auto border border-white/20"
      >
        <h1 className="text-3xl font-arabic-bold text-center text-primary mb-10">
          تعديل بيانات المسؤول
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* الاسم ورقم الهاتف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                <User className="w-4 h-4" /> الاسم
              </label>
              <input
                type="text"
                name="admin_name"
                value={formData.admin_name}
                onChange={handleChange}
                placeholder="أدخل اسم المسؤول"
                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                <Phone className="w-4 h-4" /> رقم الهاتف
              </label>
              <input
                type="text"
                name="admin_phone_number"
                value={formData.admin_phone_number}
                onChange={handleChange}
                placeholder="أدخل رقم الهاتف"
                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* كلمة المرور */}
          <div>
            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
              <Lock className="w-4 h-4" /> كلمة المرور (اتركها فارغة إذا لم ترد التغيير)
            </label>
            <input
              type="password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* نوع الحساب */}
          <div>
            <label className="mb-4 text-primary-light font-arabic-medium flex items-center gap-2">
              <Shield className="w-4 h-4" /> نوع الحساب
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition 
                    ${formData.account_role === role.value
                      ? `${role.color} border-primary shadow-md scale-105`
                      : "bg-white/5 border-gray-300 hover:border-primary/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="account_role"
                    value={role.value}
                    checked={formData.account_role === role.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="font-bold">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex justify-center gap-6 pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> جاري التعديل...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> تعديل
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-300 transition disabled:opacity-70"
              disabled={loading}
            >
              <XCircle className="w-5 h-5" /> إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditAdministration;
