import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import {
    Loader2,
    Trash2,
    Edit,
    Eye,
    Plus,
    BookOpen,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type Exam = {
    exam_code: string;
    exam_title: string;
    course: string;
    score_per_question: number;
    duration: number;
    status: "active" | "unactive";
};

const Exams: React.FC = () => {
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;
    const navigate = useNavigate();

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    // fetch exams
    const fetchExams = useCallback(async () => {
        if (!adminToken) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/exams/getAllExams?admin_token=${adminToken}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setExams(data.exams);
            } else {
                setExams([]);
                toast.error(data.message || "فشل في تحميل الاختبارات.");
            }
        } catch (err: any) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, logout]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    // delete exam
    const confirmDeleteExam = (exam: Exam) => {
        setSelectedExam(exam);
        setConfirmOpen(true);
    };

    const handleDeleteExam = async () => {
        if (!selectedExam) return;
        setConfirmOpen(false);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("exam_code", selectedExam.exam_code);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/exams/deleteExam",
                {
                    method: "POST",
                    body: formData,
                }
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                toast.success("تم حذف الاختبار بنجاح.");
                setExams((prev) =>
                    prev.filter((e) => e.exam_code !== selectedExam.exam_code)
                );
            } else {
                toast.error(data.message || "فشل في حذف الاختبار.");
            }
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء الحذف.");
        } finally {
            setLoading(false);
            setSelectedExam(null);
        }
    };

    // update status
    const updateExamStatus = async (examCode: string, status: string) => {
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("exam_code", examCode);
            formData.append("status", status);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/exams/updateExamStatus",
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await res.json();

            if (data.status === "success") {
                toast.success(
                    `تم تحديث حالة الاختبار بنجاح إلى ${status === "active" ? "مفعل" : "غير مفعل"
                    }`
                );
                setExams((prev) =>
                    prev.map((exam) =>
                        exam.exam_code === examCode ? { ...exam, status } : exam
                    )
                );
            } else {
                toast.error("فشل في تحديث الحالة.");
            }
        } catch (error) {
            console.error("Error updating exam status:", error);
            toast.error("خطأ في الاتصال بالسيرفر");
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-center lg:justify-start items-center">
                <h1 className="text-3xl font-arabic-bold text-primary">الاختبارات</h1>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div />
                <button
                    onClick={() => navigate("/exams/add-exam")}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة اختبار
                </button>
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : exams.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {exams.map((exam) => (
                            <div
                                key={exam.exam_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <h3
                                        onClick={() =>
                                            navigate(`/exams/${exam.exam_code}/exam-details`)
                                        }
                                        className="font-bold text-lg text-primary cursor-pointer underline"
                                    >
                                        {exam.exam_title}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 rounded-full hover:bg-primary/10 text-primary transition"
                                            onClick={() =>
                                                navigate(`/exams/${exam.exam_code}/questions`)
                                            }
                                            title="عرض"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                            onClick={() =>
                                                navigate(`/exams/${exam.exam_code}/edit-exam`, {
                                                    state: { exam },
                                                })
                                            }
                                            title="تعديل"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                            onClick={() => confirmDeleteExam(exam)}
                                            title="حذف"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <p className="text-sm text-muted-foreground">
                                    الكود: {exam.exam_code}
                                </p>
                                <p className="text-sm">الكورس: {exam.course}</p>
                                <p className="text-sm">الدرجة لكل سؤال: {exam.score_per_question}</p>
                                <p className="text-sm">المدة: {exam.duration} دقيقة</p>
                                <p
                                    className={`text-sm font-semibold cursor-pointer w-fit px-3 py-1 rounded-full ${exam.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                    onClick={() =>
                                        updateExamStatus(
                                            exam.exam_code,
                                            exam.status === "active" ? "unactive" : "active"
                                        )
                                    }
                                >
                                    {exam.status === "active" ? "مفعل" : "غير مفعل"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block card-dark bg-primary-light overflow-x-auto rounded-xl shadow-sm">
                        <table className="w-full text-sm text-right border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-muted/30 text-foreground/80">
                                    <th className="px-4 py-3">الكود</th>
                                    <th className="px-4 py-3">العنوان</th>
                                    <th className="px-4 py-3">الكورس</th>
                                    <th className="px-4 py-3">الدرجة لكل سؤال</th>
                                    <th className="px-4 py-3">المدة (دقائق)</th>
                                    <th className="px-4 py-3">الحالة</th>
                                    <th className="px-4 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam) => (
                                    <tr
                                        key={exam.exam_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{exam.exam_code}</td>
                                        <td
                                            className="px-4 py-3 font-medium text-primary underline cursor-pointer"
                                            onClick={() =>
                                                navigate(`/exams/${exam.exam_code}/exam-details`)
                                            }
                                        >
                                            {exam.exam_title}
                                        </td>
                                        <td className="px-4 py-3">{exam.course}</td>
                                        <td className="px-4 py-3">{exam.score_per_question}</td>
                                        <td className="px-4 py-3">{exam.duration}</td>
                                        <td
                                            className="px-4 py-3 cursor-pointer"
                                            onClick={() =>
                                                updateExamStatus(
                                                    exam.exam_code,
                                                    exam.status === "active" ? "unactive" : "active"
                                                )
                                            }
                                        >
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {exam.status === "active" ? "مفعل" : "غير مفعل"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex items-center justify-center gap-3">
                                            <button
                                                className="p-2 rounded-full hover:bg-primary/10 text-primary transition"
                                                onClick={() =>
                                                    navigate(`/exams/${exam.exam_code}/questions`)
                                                }
                                                title="عرض"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                                onClick={() =>
                                                    navigate(`/exams/${exam.exam_code}/edit-exam`, {
                                                        state: { exam },
                                                    })
                                                }
                                                title="تعديل"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                                onClick={() => confirmDeleteExam(exam)}
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
                        لا يوجد اختبارات
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        حاول إضافة اختبار جديد لرؤية التحديثات هنا.
                    </p>
                </motion.div>
            )}

            {/* Dialog */}
            <CustomConfirmDialog
                open={confirmOpen}
                message="هل أنت متأكد من أنك تريد حذف هذا الاختبار؟"
                onConfirm={handleDeleteExam}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default Exams;
