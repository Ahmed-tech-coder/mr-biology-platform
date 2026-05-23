import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Save, XCircle, FileText, ImageIcon, Shield, Upload } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AddQuestion: React.FC = () => {
    const navigate = useNavigate();
    const { exam_code } = useParams<{ exam_code: string }>();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [questionType, setQuestionType] = useState<"text" | "image">("text");
    const [questionContent, setQuestionContent] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState<"أ" | "ب" | "ج" | "د">("أ");
    const [questionImage, setQuestionImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setQuestionImage(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminToken || !exam_code) return;

        const formData = new FormData();
        formData.append("admin_token", adminToken);
        formData.append("exam_code", exam_code);
        formData.append("question_type", questionType);
        formData.append(
            "question_content",
            questionType === "text" ? questionContent : ""
        );
        formData.append("option_a", optionA);
        formData.append("option_b", optionB);
        formData.append("option_c", optionC);
        formData.append("option_d", optionD);
        formData.append("correct_answer", correctAnswer);
        if (questionType === "image" && questionImage) formData.append("question_image", questionImage);

        try {
            setLoading(true);
            const res = await fetch(
                "https://apis.mr-biology.com/admin/questions/addQuestion",
                { method: "POST", body: formData }
            );
            const data = await res.json();

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
                return;
            }

            if (data.status === "success") {
                toast.success("تم إضافة السؤال بنجاح!");
                setTimeout(() => navigate(-1), 1500);
            } else {
                toast.error(data.message || "حدث خطأ أثناء الإضافة!");
            }
        } catch (err) {
            console.error(err);
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
                <h1 className="text-3xl font-arabic-bold text-center text-primary mb-10 flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6" />
                    إضافة سؤال جديد
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* نوع السؤال */}
                    <div className="flex flex-col gap-2">
                        <label className="font-arabic-medium text-primary-light mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> نوع السؤال
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "نص", value: "text", color: "bg-blue-500 text-white" },
                                { label: "صورة", value: "image", color: "bg-green-500 text-white" },
                            ].map((item) => (
                                <label
                                    key={item.value}
                                    className={`cursor-pointer rounded-xl border p-4 text-center transition
          ${questionType === item.value
                                            ? `${item.color} border-primary shadow-md scale-105`
                                            : "bg-white/5 border-gray-300 hover:border-primary/50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="question_type"
                                        value={item.value}
                                        checked={questionType === item.value}
                                        onChange={() => setQuestionType(item.value as "text" | "image")}
                                        className="hidden"
                                    />
                                    <span className="font-bold">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* محتوى السؤال */}
                    {questionType === "text" ? (
                        <div className="flex flex-col gap-2">
                            <label className="font-arabic-medium text-primary-light">محتوى السؤال</label>
                            <input
                                type="text"
                                placeholder="أدخل محتوى السؤال"
                                value={questionContent}
                                onChange={(e) => setQuestionContent(e.target.value)}
                                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary p-3"
                                required
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="font-arabic-medium text-primary-light flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" /> رفع صورة السؤال
                            </label>

                            <label
                                htmlFor="question_image"
                                className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20 transition"
                            >
                                <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                <span className="text-gray-200">اسحب الصورة أو اضغط للرفع</span>
                                <input
                                    id="question_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {questionImage && (
                                <img
                                    src={URL.createObjectURL(questionImage)}
                                    alt="صورة السؤال"
                                    className="mt-4 w-28 h-28 rounded-xl object-cover"
                                />
                            )}
                        </div>

                    )}

                    {/* الاختيارات */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "أ", value: optionA, setter: setOptionA },
                            { label: "ب", value: optionB, setter: setOptionB },
                            { label: "ج", value: optionC, setter: setOptionC },
                            { label: "د", value: optionD, setter: setOptionD },
                        ].map((opt) => (
                            <div key={opt.label} className="flex flex-col gap-1">
                                <label className="font-arabic-medium text-primary-light">الاختيار ({opt.label})</label>
                                <input
                                    type="text"
                                    value={opt.value}
                                    onChange={(e) => opt.setter(e.target.value)}
                                    className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary p-3"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    {/* الإجابة الصحيحة */}
                    <div className="flex flex-col gap-2">
                        <label className="font-arabic-medium text-primary-light mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> الإجابة الصحيحة
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["أ", "ب", "ج", "د"].map((ans) => (
                                <label
                                    key={ans}
                                    className={`cursor-pointer rounded-xl border p-4 text-center transition
          ${correctAnswer === ans
                                            ? "bg-primary text-white border-primary shadow-md scale-105"
                                            : "bg-white/5 border-gray-300 hover:border-primary/50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="correct_answer"
                                        value={ans}
                                        checked={correctAnswer === ans}
                                        onChange={() => setCorrectAnswer(ans as "أ" | "ب" | "ج" | "د")}
                                        className="hidden"
                                    />
                                    <span className="font-bold">{ans}</span>
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            إضافة
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

export default AddQuestion;
