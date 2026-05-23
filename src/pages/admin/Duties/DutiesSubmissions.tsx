import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
    Loader2,
    Edit,
    Save,
    FileText,
    Eye,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type Submission = {
    solution_code: string;
    student_name: string;
    student_code: string;
    submission_time: string;
    group_name: string;
    grade: string;
    pdf_file: string;
};

const DutiesSubmissions: React.FC = () => {
    const { duty_code } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { groupName: initialGroupName } = location.state || {};

    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [groupName, setGroupName] = useState<string>(initialGroupName || "");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [editGrade, setEditGrade] = useState<string | null>(null);
    const [newGrade, setNewGrade] = useState<string>("");

    useEffect(() => {
        if (initialGroupName) {
            setGroupName(initialGroupName);
        }
    }, [initialGroupName]);

    const fetchSubmissions = useCallback(async () => {
        if (!adminToken || !duty_code) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/duties/getStudentDutiesSubmissions?admin_token=${adminToken}&duty_code=${duty_code}`
            );
            const data = await res.json();

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setSubmissions(data.submissions || []);
            } else {
                toast.error(data.message || "فشل في تحميل التسليمات");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, duty_code, logout]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleGradeChange = async (solution_code: string) => {
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("solution_code", solution_code);
            formData.append("grade", newGrade);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/duties/gradeStudentSubmission",
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
                setSubmissions((prev) =>
                    prev.map((s) =>
                        s.solution_code === solution_code ? { ...s, grade: newGrade } : s
                    )
                );
                toast.success("تم تسجيل الدرجة بنجاح");
                setEditGrade(null);
            } else {
                toast.error(data.message || "فشل في تعديل الدرجة");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ أثناء تعديل الدرجة");
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-arabic-bold text-primary">
                    تسليمات الواجبات
                </h1>
                {groupName && (
                    <span className="px-4 py-2 bg-primary-light text-white rounded-lg shadow">
                        {groupName}
                    </span>
                )}
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : submissions.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {submissions.map((s) => (
                            <div
                                key={s.solution_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                <p className="text-sm">الكود: {s.solution_code}</p>
                                <p className="text-sm">الاسم: {s.student_name}</p>
                                <p className="text-sm">رمز الطالب: {s.student_code}</p>
                                <p className="text-sm">المجموعة: {s.group_name}</p>
                                <p className="text-sm">تاريخ التسليم: {s.submission_time}</p>

                                <div className="flex items-center gap-2">
                                    {editGrade === s.solution_code ? (
                                        <>
                                            <input
                                                type="number"
                                                className="input-dark w-24"
                                                value={newGrade}
                                                onChange={(e) => setNewGrade(e.target.value)}
                                            />
                                            <button
                                                className="btn-primary flex items-center gap-2"
                                                onClick={() => handleGradeChange(s.solution_code)}
                                            >
                                                <Save className="w-4 h-4" /> حفظ
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="px-3 py-1 bg-muted rounded-full">
                                                الدرجة: {s.grade || "-"}
                                            </span>
                                            <button
                                                className="btn-secondary flex items-center gap-2"
                                                onClick={() => {
                                                    setEditGrade(s.solution_code);
                                                    setNewGrade(s.grade);
                                                }}
                                            >
                                                <Edit className="w-4 h-4" /> تعديل
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-3">
                                    <a
                                        href={s.pdf_file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" /> تحميل الملف
                                    </a>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block card-dark bg-primary-light overflow-x-auto rounded-xl shadow-sm">
                        <table className="w-full text-sm text-right border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-muted/30 text-foreground/80">
                                    <th className="px-4 py-3">الكود</th>
                                    <th className="px-4 py-3">الاسم</th>
                                    <th className="px-4 py-3">رمز الطالب</th>
                                    <th className="px-4 py-3">المجموعة</th>
                                    <th className="px-4 py-3">تاريخ التسليم</th>
                                    <th className="px-4 py-3">الدرجة</th>
                                    <th className="px-4 py-3">الملف</th>

                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s) => (
                                    <tr
                                        key={s.solution_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{s.solution_code}</td>
                                        <td className="px-4 py-3">{s.student_name}</td>
                                        <td className="px-4 py-3">{s.student_code}</td>
                                        <td className="px-4 py-3">{s.group_name}</td>
                                        <td className="px-4 py-3">{s.submission_time}</td>
                                        <td className="px-4 py-3">
                                            {editGrade === s.solution_code ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="input-dark w-20"
                                                        value={newGrade}
                                                        onChange={(e) => setNewGrade(e.target.value)}
                                                    />
                                                    <button
                                                        className="btn-primary flex items-center gap-2"
                                                        onClick={() => handleGradeChange(s.solution_code)}
                                                    >
                                                        <Save className="w-4 h-4" /> حفظ
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {s.grade || "-"}
                                                    <button
                                                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                                        onClick={() => {
                                                            setEditGrade(s.solution_code);
                                                            setNewGrade(s.grade);
                                                        }}
                                                        title="تعديل"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={s.pdf_file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-2 px-5 py-2 rounded-xl 
               bg-white/10 backdrop-blur-md border border-white/20 
               shadow-lg hover:shadow-primary/30 
               hover:bg-primary/20 transition-all duration-500"
                                            >
                                                <FileText className="w-5 h-5 text-primary group-hover:scale-125 
                         transition-transform duration-300 drop-shadow-md" />
                                                <span className="text-sm font-semibold text-primary-dark group-hover:text-white tracking-wide">
                                                    تحميل الملف
                                                </span>
                                            </a>
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
                        لا توجد تسليمات
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        لم يتم تسليم أي واجب بعد.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default DutiesSubmissions;
