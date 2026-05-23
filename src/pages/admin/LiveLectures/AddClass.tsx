import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Video, Type, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AddClass: React.FC = () => {
    const navigate = useNavigate();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [formData, setFormData] = useState({
        class_title: "",
        class_link: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.class_title || !formData.class_link) {
            toast.error("❌ من فضلك املأ كل الحقول");
            return;
        }

        if (!adminToken) {
            toast.error("⚠️ غير مسموح (Token مفقود)");
            return;
        }

        const data = new FormData();
        data.append("admin_token", adminToken);
        data.append("class_title", formData.class_title);
        data.append("class_link", formData.class_link);

        try {
            setLoading(true);
            const response = await fetch(
                "https://apis.mr-biology.com/admin/live-classes/addLiveClass",
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
                toast.success("✅ تم إضافة الحصة بنجاح!");
                setTimeout(() => navigate(-1), 1200);
            } else {
                toast.error(result.message || "❌ فشل في إضافة الحصة");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("❌ خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom section-padding mt-16 lg:mt-0">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl p-10 max-w-3xl mx-auto border border-white/20"
            >
                <h1 className="text-3xl font-arabic-bold text-center text-primary mb-10">
                    إضافة حصة جديدة
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* عنوان الحصة */}
                    <div>
                        <label className=" mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                            <Type className="w-4 h-4" /> عنوان الحصة
                        </label>
                        <input
                            type="text"
                            name="class_title"
                            value={formData.class_title}
                            onChange={handleChange}
                            placeholder="أدخل عنوان الحصة"
                            className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* رابط الحصة */}
                    <div>
                        <label className=" mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                            <Video className="w-4 h-4" /> رابط الحصة
                        </label>
                        <input
                            type="text"
                            name="class_link"
                            value={formData.class_link}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                            required
                        />
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

export default AddClass;
