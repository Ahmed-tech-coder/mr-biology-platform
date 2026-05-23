import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, XCircle, Users, Layers } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AddGroup = () => {
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("online");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("❌ يجب إدخال اسم المجموعة");
      return;
    }

    if (!adminToken) {
      toast.error("⚠️ غير مسموح (Token مفقود)");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("admin_token", adminToken);
      data.append("group_name", groupName);
      data.append("group_type", groupType);

      const response = await fetch(
        "https://apis.mr-biology.com/admin/groups/addGroup",
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
        toast.success("✅ تمت إضافة المجموعة بنجاح!");
        setGroupName("");
        setGroupType("online");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(result.message || "❌ حدث خطأ أثناء الإضافة.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("❌ خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const groupTypes = [
    { value: "online", label: "أونلاين", color: "bg-blue-100 text-blue-700" },
    { value: "center", label: "سنتر", color: "bg-green-100 text-green-700" },
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
          إضافة مجموعة جديدة
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* اسم المجموعة */}
          <div>
            <label className=" mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> اسم المجموعة
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="أدخل اسم المجموعة"
              className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* نوع المجموعة */}
          <div>
            <label className=" mb-4 text-primary-light font-arabic-medium flex items-center gap-2">
              <Layers className="w-4 h-4" /> نوع المجموعة
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupTypes.map((type) => (
                <label
                  key={type.value}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition 
                    ${
                      groupType === type.value
                        ? `${type.color} border-primary shadow-md scale-105`
                        : "bg-white/5 border-gray-300 hover:border-primary/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="group_type"
                    value={type.value}
                    checked={groupType === type.value}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-bold">{type.label}</span>
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
                  <Loader2 className="w-5 h-5 animate-spin" /> جاري الإضافة...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> إضافة
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

export default AddGroup;
