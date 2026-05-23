import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Loader2,
    Trash2,
    Edit,
    Plus,
    AlertCircle,
    ListChecks,
} from "lucide-react";

import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";

type Question = {
    question_code: string;
    question_type: "text" | "image";
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
};

const Questions: React.FC = () => {
    const navigate = useNavigate();
    const { exam_code } = useParams<{ exam_code: string }>();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

    // fetch questions
    const fetchQuestions = useCallback(async () => {
        if (!adminToken || !exam_code) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/questions/getAllQuestions?admin_token=${adminToken}&exam_code=${exam_code}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setQuestions(data.questions);
            } else {
                toast.error(data.message || "فشل في تحميل الأسئلة.");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, exam_code, logout]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // delete question
    const confirmDeleteQuestion = (questionCode: string) => {
        setQuestionToDelete(questionCode);
        setConfirmOpen(true);
    };

    const handleDeleteQuestion = async () => {
        if (!questionToDelete) return;
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("question_code", questionToDelete);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/questions/deleteQuestion",
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await res.json();

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                toast.success("تم حذف السؤال بنجاح!");
                setQuestions((prev) =>
                    prev.filter((q) => q.question_code !== questionToDelete)
                );
            } else {
                toast.error(data.message || "فشل في حذف السؤال.");
            }
        } catch (error) {
            console.error("Error deleting question:", error);
            toast.error("حدث خطأ أثناء حذف السؤال.");
        } finally {
            setConfirmOpen(false);
            setQuestionToDelete(null);
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-center lg:justify-start items-center">
                <h1 className="text-3xl font-arabic-bold text-primary flex items-center gap-2">
                    <ListChecks className="w-7 h-7" />
                    الأسئلة
                </h1>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div />
                <button
                    onClick={() => navigate(`/exams/${exam_code}/questions/add-question`)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة سؤال
                </button>
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : questions.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {questions.map((q) => (
                            <div
                                key={q.question_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-primary">
                                        {q.question_code}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                            onClick={() =>
                                                navigate(`/exams/$${exam_code}/questions/${q.question_code}/edit-question`)
                                            }
                                            title="تعديل"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                            onClick={() => confirmDeleteQuestion(q.question_code)}
                                            title="حذف"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm">
                                    النوع: {q.question_type === "text" ? "نص" : "صورة"}
                                </p>
                                <div className="text-sm">
                                    الاختيارات:{" "}
                                    <select className="border rounded-lg p-1 bg-white/5">
                                        <option>{q.option_a}</option>
                                        <option>{q.option_b}</option>
                                        <option>{q.option_c}</option>
                                        <option>{q.option_d}</option>
                                    </select>
                                </div>
                                <p className="text-sm font-semibold text-green-600">
                                    الإجابة الصحيحة: {q.correct_answer}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block card-dark bg-primary-light overflow-x-auto rounded-xl shadow-sm">
                        <table className="w-full text-sm text-right border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-muted/30 text-foreground/80">
                                    <th className="px-4 py-3">كود السؤال</th>
                                    <th className="px-4 py-3">النوع</th>
                                    <th className="px-4 py-3">الاختيارات</th>
                                    <th className="px-4 py-3">الإجابة الصحيحة</th>
                                    <th className="px-4 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q) => (
                                    <tr
                                        key={q.question_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{q.question_code}</td>
                                        <td className="px-4 py-3">
                                            {q.question_type === "text" ? "نص" : "صورة"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select className="border rounded-lg p-1 bg-white/5">
                                                <option>{q.option_a}</option>
                                                <option>{q.option_b}</option>
                                                <option>{q.option_c}</option>
                                                <option>{q.option_d}</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-green-600">
                                            {q.correct_answer}
                                        </td>
                                        <td className="px-4 py-3 flex items-center justify-center gap-3">
                                            <button
                                                className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                                onClick={() =>
                                                    navigate(`/exams/$${exam_code}/questions/${q.question_code}/edit-question`)
                                                }
                                                title="تعديل"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                                onClick={() => confirmDeleteQuestion(q.question_code)}
                                                title="حذف"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24"
                >
                    <AlertCircle className="w-16 h-16 text-primary-dark mb-6" />
                    <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
                        لا يوجد أسئلة
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        حاول إضافة سؤال جديد لرؤية التحديثات هنا.
                    </p>
                </motion.div>
            )}

            {/* Dialog */}
            <CustomConfirmDialog
                open={confirmOpen}
                message="هل أنت متأكد من حذف هذا السؤال؟"
                onConfirm={handleDeleteQuestion}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default Questions;
