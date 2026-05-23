import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import {
    Loader2,
    Trash2,
    Edit,
    Plus,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type Duty = {
    duty_code: string;
    duty_title: string;
    group_code: string;
    group_name: string;
    deadline: string;
    status: "open" | "closed";
};

const Duties: React.FC = () => {
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;
    const navigate = useNavigate();

    const [duties, setDuties] = useState<Duty[]>([]);
    const [filteredDuties, setFilteredDuties] = useState<Duty[]>([]);
    const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");
    const [loading, setLoading] = useState(true);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);

    // fetch duties
    const fetchDuties = useCallback(async () => {
        if (!adminToken) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/duties/getAllDuties?admin_token=${adminToken}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setDuties(data.duties || []);
                setFilteredDuties(
                    data.duties.filter((d: Duty) => d.status === statusFilter)
                );
            } else {
                toast.error(data.message || "فشل في تحميل الواجبات.");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, logout, statusFilter]);

    useEffect(() => {
        fetchDuties();
    }, [fetchDuties]);

    // filter change
    const handleStatusChange = (status: "open" | "closed") => {
        setStatusFilter(status);
        setFilteredDuties(duties.filter((d) => d.status === status));
    };

    // update status
    const updateDutyStatus = async (dutyCode: string, status: "open" | "closed") => {
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("duty_code", dutyCode);
            formData.append("status", status);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/duties/updateDutyStatus",
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
                toast.success("تم تحديث حالة الواجب بنجاح!");
                setDuties((prev) =>
                    prev.map((d) => (d.duty_code === dutyCode ? { ...d, status } : d))
                );
                setFilteredDuties((prev) =>
                    prev.map((d) => (d.duty_code === dutyCode ? { ...d, status } : d))
                );
            } else {
                toast.error(data.message || "فشل في تحديث حالة الواجب.");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        }
    };

    // delete duty
    const confirmDeleteDuty = (duty: Duty) => {
        setSelectedDuty(duty);
        setConfirmOpen(true);
    };

    const handleDeleteDuty = async () => {
        if (!selectedDuty) return;
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("duty_code", selectedDuty.duty_code);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/duties/deleteDuty",
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
                toast.success("تم حذف الواجب بنجاح!");
                setDuties((prev) =>
                    prev.filter((d) => d.duty_code !== selectedDuty.duty_code)
                );
                setFilteredDuties((prev) =>
                    prev.filter((d) => d.duty_code !== selectedDuty.duty_code)
                );
            } else {
                toast.error(data.message || "فشل في حذف الواجب.");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setConfirmOpen(false);
            setSelectedDuty(null);
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-center lg:justify-start items-center">
                <h1 className="text-3xl font-arabic-bold text-primary">الواجبات</h1>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStatusChange("open")}
                        className={`btn-secondary ${statusFilter === "open" ? "btn-active" : ""}`}
                    >
                        المفتوحة
                    </button>
                    <button
                        onClick={() => handleStatusChange("closed")}
                        className={`btn-secondary ${statusFilter === "closed" ? "btn-active" : ""}`}
                    >
                        المغلقة
                    </button>
                </div>
                <button
                    onClick={() => navigate("/duties/add-duty")}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة واجب
                </button>
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : filteredDuties.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {filteredDuties.map((duty) => (
                            <div
                                key={duty.duty_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <h3
                                        onClick={() =>
                                            navigate(`/duties/${duty.duty_code}/submissions`, {
                                                state: { groupName: duty.group_name },
                                            })
                                        }
                                        className="font-bold text-lg text-primary cursor-pointer underline"
                                    >
                                        {duty.duty_title}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                            onClick={() =>
                                                navigate(`/duties/${duty.duty_code}/edit-duty`, {
                                                    state: { duty },
                                                })
                                            }
                                            title="تعديل"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                            onClick={() => confirmDeleteDuty(duty)}
                                            title="حذف"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm">الكود: {duty.duty_code}</p>
                                <p className="text-sm">المجموعة: {duty.group_code}</p>
                                <p className="text-sm">الانتهاء: {duty.deadline}</p>
                                <p
                                    className={`text-sm font-semibold cursor-pointer w-fit px-3 py-1 rounded-full ${duty.status === "open"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                    onClick={() =>
                                        updateDutyStatus(
                                            duty.duty_code,
                                            duty.status === "open" ? "closed" : "open"
                                        )
                                    }
                                >
                                    {duty.status === "open" ? "مفتوح" : "مغلق"}
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
                                    <th className="px-4 py-3">المجموعة</th>
                                    <th className="px-4 py-3">الانتهاء</th>
                                    <th className="px-4 py-3">الحالة</th>
                                    <th className="px-4 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDuties.map((duty) => (
                                    <tr
                                        key={duty.duty_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{duty.duty_code}</td>
                                        <td
                                            className="px-4 py-3 font-medium text-primary underline cursor-pointer"
                                            onClick={() =>
                                                navigate(`/duties/${duty.duty_code}/submissions`, {
                                                    state: { groupName: duty.group_name },
                                                })
                                            }
                                        >
                                            {duty.duty_title}
                                        </td>
                                        <td className="px-4 py-3">{duty.group_code}</td>
                                        <td className="px-4 py-3">{duty.deadline}</td>
                                        <td
                                            className="px-4 py-3 cursor-pointer"
                                            onClick={() =>
                                                updateDutyStatus(
                                                    duty.duty_code,
                                                    duty.status === "open" ? "closed" : "open"
                                                )
                                            }
                                        >
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${duty.status === "open"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {duty.status === "open" ? "مفتوح" : "مغلق"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex items-center justify-center gap-3">
                                            <button
                                                className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                                onClick={() =>
                                                    navigate(`/duties/${duty.duty_code}/edit-duty`, {
                                                        state: { duty },
                                                    })
                                                }
                                                title="تعديل"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                                onClick={() => confirmDeleteDuty(duty)}
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
                        لا يوجد واجبات
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        حاول إضافة واجب جديد لرؤية التحديثات هنا.
                    </p>
                </motion.div>
            )}

            {/* Dialog */}
            <CustomConfirmDialog
                open={confirmOpen}
                message="هل أنت متأكد من أنك تريد حذف هذا الواجب؟"
                onConfirm={handleDeleteDuty}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default Duties;
