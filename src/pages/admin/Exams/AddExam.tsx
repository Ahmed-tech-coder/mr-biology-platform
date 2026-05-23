import { useState } from "react";
import { motion } from "framer-motion";
import {
    Loader2,
    Save,
    XCircle,
    FileText,
    Calendar,
    Clock,
    BookOpen,
    Target,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AddExam = () => {
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;
    const navigate = useNavigate();

    const [course, setCourse] = useState("#");
    const [examTitle, setExamTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [scorePerQuestion, setScorePerQuestion] = useState("");
    const [duration, setDuration] = useState("");
    const [customCourseCode, setCustomCourseCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!examTitle || !startDate || !endDate || !scorePerQuestion || !duration) {
            toast.error("❌ من فضلك املأ جميع الحقول");
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
            data.append("course", course === "all" ? "all" : customCourseCode);
            data.append("exam_title", examTitle);
            data.append("start_date", startDate);
            data.append("end_date", endDate);
            data.append("score_per_question", scorePerQuestion);
            data.append("duration", duration);

            const response = await fetch(
                "https://apis.mr-biology.com/admin/exams/addExam",
                {
                    method: "POST",
                    body: data,
                }
            );

            const result = await response.json();

            if (result.reason === "unauthorized") {
                logout();
                toast.info("⚠️ يرجي تسجيل الدخول مرة أخرى");
                return;
            }

            if (result.message === "تم إضافة الاختبار بنجاح") {
                toast.success(result.message);
                setTimeout(() => navigate(-1), 1500);
            } else {
                toast.error(result.message || "❌ حدث خطأ أثناء الإضافة.");
            }
        } catch (error) {
            console.error("Error adding exam:", error);
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
                    إضافة اختبار جديد
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* exam title */}
                    <div>
                        <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" /> عنوان الاختبار
                        </label>
                        <input
                            type="text"
                            value={examTitle}
                            onChange={(e) => setExamTitle(e.target.value)}
                            placeholder="أدخل عنوان الاختبار"
                            className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* course */}
                    <div>
                        <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> الكورس
                        </label>
                        <select
                            value={course}
                            onChange={(e) => {
                                setCourse(e.target.value);
                                setCustomCourseCode("");
                            }}
                            className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                        >
                            <option value="#">تحديد الكورس</option>
                            <option value="all">الكل</option>
                            <option value="custom">كورس محدد</option>
                        </select>

                        {course === "custom" && (
                            <input
                                type="text"
                                value={customCourseCode}
                                onChange={(e) => setCustomCourseCode(e.target.value)}
                                placeholder="أدخل كود الكورس"
                                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary mt-3"
                                required
                            />
                        )}
                    </div>

                    {/* dates */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> تاريخ البداية
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> تاريخ الغلق
                            </label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* score + duration */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                                <Target className="w-4 h-4" /> الدرجة لكل سؤال
                            </label>
                            <input
                                type="number"
                                value={scorePerQuestion}
                                onChange={(e) => setScorePerQuestion(e.target.value)}
                                placeholder="مثال: 2"
                                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" /> المدة (بالدقائق)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="مثال: 60"
                                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* buttons */}
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

export default AddExam;
