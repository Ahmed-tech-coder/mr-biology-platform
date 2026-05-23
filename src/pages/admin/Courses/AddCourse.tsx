import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Save, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AddCourse = () => {
    const navigate = useNavigate();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [courseTitle, setCourseTitle] = useState("");
    const [coursePrice, setCoursePrice] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [courseStatus, setCourseStatus] = useState("active");
    const [courseType, setCourseType] = useState("free");
    const [courseImage, setCourseImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setCourseImage(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!adminToken) {
            toast.error("❌ غير مسموح (Token مفقود)");
            return;
        }

        const formData = new FormData();
        formData.append("admin_token", adminToken);
        formData.append("course_title", courseTitle);
        formData.append("course_price", courseType === "paid" ? coursePrice : "0");
        formData.append("course_description", courseDescription);
        formData.append("course_status", courseStatus);
        formData.append("course_type", courseType);
        if (courseImage) {
            formData.append("course_image", courseImage);
        }

        try {
            setLoading(true);
            const response = await fetch(
                "https://apis.mr-biology.com/admin/courses/addCourse",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (result.reason === "unauthorized") {
                logout();
                toast.info("⚠️ يرجى تسجيل الدخول مرة أخرى");
                return;
            }

            if (response.ok) {
                toast.success("✅ تم إضافة الكورس بنجاح!");
                navigate(-1);
            } else {
                toast.error(result.message || "❌ حدث خطأ أثناء إضافة الكورس");
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
                className="card-dark max-w-4xl mx-auto"
            >
                <h1 className="text-2xl font-arabic-bold text-primary mb-8 text-center">
                    إضافة كورس جديد
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* اسم الكورس */}
                    <div>
                        <label className="block mb-2 font-arabic-medium">اسم الكورس</label>
                        <input
                            type="text"
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            placeholder="أدخل اسم الكورس"
                            className="input-field w-full"
                            required
                        />
                    </div>

                    {/* وصف الكورس */}
                    <div>
                        <label className="block mb-2 font-arabic-medium">الوصف</label>
                        <textarea
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            placeholder="أدخل وصفاً موجزاً للكورس"
                            className="input-field w-full h-32 resize-none"
                            required
                        />
                    </div>

                    {/* الحالة والنوع */}
                    <div className="flex flex-col lg:flex-row justify-around gap-8">
                        <div>
                            <label className="block mb-2 font-arabic-medium">الحالة</label>
                            <div className="flex gap-6">
                                {[
                                    { value: "active", label: "مفعل" },
                                    { value: "unactive", label: "غير مفعل" },
                                ].map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={opt.value}
                                            checked={courseStatus === opt.value}
                                            onChange={() => setCourseStatus(opt.value)}
                                            className="peer hidden"
                                        />
                                        <span className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary transition">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></span>
                                        </span>
                                        <span className="peer-checked:text-primary-light font-bold transition">
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 font-arabic-medium">النوع</label>
                            <div className="flex gap-6">
                                {[
                                    { value: "free", label: "مجاني" },
                                    { value: "paid", label: "مدفوع" },
                                ].map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={opt.value}
                                            checked={courseType === opt.value}
                                            onChange={() => setCourseType(opt.value)}
                                            className="peer hidden"
                                        />
                                        <span className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary transition">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></span>
                                        </span>
                                        <span className="peer-checked:text-primary-light font-bold transition">
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* السعر */}
                    {courseType === "paid" && (
                        <div>
                            <label className="block mb-2 font-arabic-medium">السعر (جنيه)</label>
                            <input
                                type="text"
                                value={coursePrice}
                                onChange={(e) => setCoursePrice(e.target.value)}
                                placeholder="مثال: 500"
                                className="input-field w-full"
                                required
                            />
                        </div>
                    )}

                    {/* صورة الكورس */}
                    <div>
                        <label className="block mb-2 font-arabic-medium">صورة الكورس</label>
                        <label
                            htmlFor="course_image"
                            className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20"
                        >
                            <Upload className="w-10 h-10 text-gray-300 mb-2" />
                            <span className="text-gray-200">اسحب الصورة أو اضغط للرفع</span>
                            <input
                                id="course_image"
                                type="file"
                                name="course_image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                        {courseImage && (
                            <img
                                src={URL.createObjectURL(courseImage)}
                                alt="صورة الكورس"
                                className="mt-4 w-28 h-28 rounded-xl object-cover"
                            />
                        )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex justify-center gap-4 pt-6">
                        <button
                            type="submit"
                            className="btn-primary flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> حفظ الكورس
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/courses")}
                            className="btn-outline flex items-center gap-2"
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

export default AddCourse;
