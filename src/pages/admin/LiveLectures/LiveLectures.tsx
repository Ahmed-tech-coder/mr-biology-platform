import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";
import { Loader2, Trash2, Video, AlertCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";

type LiveClass = {
    class_code: string;
    class_title: string;
    class_link: string;
    date_create: string;
    date_update: string;
};

const LiveLectures: React.FC = () => {
    const navigate = useNavigate();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

    // Fetch live lectures
    const fetchClasses = useCallback(async () => {
        if (!adminToken) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/live-classes/getLiveClasses?admin_token=${adminToken}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setClasses(data.classes);
            } else {
                toast.error(data.message || "فشل في تحميل الحصص.");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, logout]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Delete confirm
    const confirmDeleteClass = (cls: LiveClass) => {
        setSelectedClass(cls);
        setConfirmOpen(true);
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;
        setConfirmOpen(false);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("class_code", selectedClass.class_code);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/live-classes/deleteLiveClass",
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
                toast.success("تم حذف المحاضرة بنجاح.");
                setClasses((prev) =>
                    prev.filter((c) => c.class_code !== selectedClass.class_code)
                );
            } else {
                toast.error(data.message || "فشل في حذف المحاضرة.");
            }
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء الحذف.");
        } finally {
            setLoading(false);
            setSelectedClass(null);
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex items-center flex-col lg:flex-row gap-6 justify-center lg:justify-between">
                <h1 className="text-3xl font-arabic-bold text-primary">الحصص المباشرة</h1>
                <button
                    onClick={() => navigate("/live-lectures/add-class")}
                    className="btn-primary flex items-center gap-2 px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
                >
                    <Plus className="w-5 h-5" /> إضافة حصة جديدة
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : classes.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {classes.map((cls) => (
                            <div
                                key={cls.class_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                {/* العنوان + حذف */}
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-primary">
                                        {cls.class_title}
                                    </h3>
                                    <button
                                        onClick={() => confirmDeleteClass(cls)}
                                        className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                        title="حذف الحصة"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    الكود: {cls.class_code}
                                </p>
                                <p className="text-sm">تاريخ الإنشاء: {cls.date_create}</p>
                                <p className="text-sm">تاريخ التحديث: {cls.date_update}</p>

                                <a
                                    href={cls.class_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    <Video className="w-4 h-4" /> الدخول للرابط
                                </a>
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
                                    <th className="px-4 py-3">تاريخ الإنشاء</th>
                                    <th className="px-4 py-3">تاريخ التحديث</th>
                                    <th className="px-4 py-3">الرابط</th>
                                    <th className="px-4 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((cls) => (
                                    <tr
                                        key={cls.class_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{cls.class_code}</td>
                                        <td className="px-4 py-3 font-medium text-primary">
                                            {cls.class_title}
                                        </td>
                                        <td className="px-4 py-3">{cls.date_create}</td>
                                        <td className="px-4 py-3">{cls.date_update}</td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={cls.class_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:underline"
                                            >
                                                <Video className="w-4 h-4" /> الدخول
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                                onClick={() => confirmDeleteClass(cls)}
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
                        لا يوجد حصص مباشرة
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        حاول إضافة حصة جديدة أو تحقق لاحقًا لرؤية تحديثات.
                    </p>
                </motion.div>
            )}


            {/* Dialog */}
            <CustomConfirmDialog
                open={confirmOpen}
                message="هل أنت متأكد من أنك تريد حذف هذه الحصة؟"
                onConfirm={handleDeleteClass}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default LiveLectures;
