import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Trash2, Search, Loader2, AlertCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Student = {
    student_code: string;
    student_name: string;
    account_type: "online" | "center";
    student_phone_number: string;
};

const Users: React.FC = () => {
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;
    const navigate = useNavigate();

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [accountType, setAccountType] = useState<"all" | "online" | "center">("all");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // fetch students
    const fetchStudents = useCallback(async () => {
        if (!adminToken) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/students/getStudents?admin_token=${adminToken}&account_type=${accountType}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setStudents(data.students);
            } else {
                setStudents([]);
                toast.error(data.message || "فشل في تحميل الطلاب.");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, accountType, logout]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // search
    const handleSearch = async () => {
        if (!phoneNumber.trim()) {
            toast.error("من فضلك أدخل رقم الهاتف.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `https://apis.mr-biology.com/admin/students/searchStudents?admin_token=${adminToken}&student_phone_number=${phoneNumber}&account_type=${accountType}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success" && data.students.length > 0) {
                setStudents(data.students);
                toast.success("تم العثور على الطالب بنجاح.");
            } else {
                setStudents([]);
                toast.info("لم يتم العثور على أي طالب.");
            }
        } catch (err) {
            toast.error("خطأ أثناء البحث.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (phoneNumber.trim() === "") {
            fetchStudents();
        }
    }, [phoneNumber, fetchStudents]);

    // delete
    const confirmDeleteStudent = (student: Student) => {
        setSelectedStudent(student);
        setConfirmOpen(true);
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;
        setConfirmOpen(false);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("student_code", selectedStudent.student_code);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/students/deleteStudent",
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
                toast.success("تم حذف الطالب بنجاح.");
                setStudents((prev) =>
                    prev.filter((s) => s.student_code !== selectedStudent.student_code)
                );
            } else {
                toast.error(data.message || "فشل في حذف الطالب.");
            }
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء الحذف.");
        } finally {
            setLoading(false);
            setSelectedStudent(null);
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-center lg:justify-start items-center">
                <h1 className="text-3xl font-arabic-bold text-primary">الطلاب</h1>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {[
                        { key: "all", label: "الكل" },
                        { key: "online", label: "الأونلاين" },
                        { key: "center", label: "السنتر" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setAccountType(f.key as "all" | "online" | "center")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${accountType === f.key
                                ? "bg-primary text-white shadow-md"
                                : "bg-muted/30 text-foreground/70 hover:bg-muted/50"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="بحث برقم الهاتف"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-field w-full pr-10"
                    />
                    <button
                        onClick={handleSearch}
                        className=" btn-primary absolute left-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm"
                    >
                        بحث
                    </button>
                </div>
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : students.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {students.map((student) => (
                            <div
                                key={student.student_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-primary">
                                        {student.student_name}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 rounded-full hover:bg-primary/10 text-primary transition"
                                            onClick={() =>
                                                navigate("/users/student-data", {
                                                    state: { student_code: student.student_code },
                                                })
                                            }
                                            title="عرض"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => confirmDeleteStudent(student)}
                                            className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                            title="حذف الطالب"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                </div>
                                <p className="text-sm text-muted-foreground">
                                    الكود: {student.student_code}
                                </p>
                                <p className="text-sm">
                                    نوع الحساب:{" "}
                                    {student.account_type === "online" ? "أونلاين" : "سنتر"}
                                </p>
                                <p className="text-sm">
                                    رقم الهاتف: {student.student_phone_number}
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
                                    <th className="px-4 py-3">اسم الطالب</th>
                                    <th className="px-4 py-3">نوع الحساب</th>
                                    <th className="px-4 py-3">رقم الهاتف</th>
                                    <th className="px-4 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr
                                        key={student.student_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{student.student_code}</td>
                                        <td
                                            className="px-4 py-3 font-medium text-primary "

                                        >
                                            {student.student_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${student.account_type === "online"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {student.account_type === "online" ? "أونلاين" : "سنتر"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">{student.student_phone_number}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="p-2 rounded-full hover:bg-primary/10 text-primary transition"
                                                    onClick={() =>
                                                        navigate("/users/student-data", {
                                                            state: { student_code: student.student_code },
                                                        })
                                                    }
                                                    title="عرض"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                                    onClick={() => confirmDeleteStudent(student)}
                                                    title="حذف الطالب"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

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
                        لا يوجد طلاب
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        حاول تعديل عوامل البحث أو تحقق لاحقًا لرؤية تحديثات جديدة.
                    </p>
                </motion.div>
            )}

            {/* Dialog */}
            <CustomConfirmDialog
                open={confirmOpen}
                message="هل أنت متأكد من أنك تريد حذف هذا الطالب؟"
                onConfirm={handleDeleteStudent}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default Users;
