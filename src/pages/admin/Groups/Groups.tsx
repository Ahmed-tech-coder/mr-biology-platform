import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Loader2, Trash2, Edit, Eye, AlertCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

type Group = {
    group_code: string;
    group_name: string;
    student_count: number;
    date_create: string;
    date_update: string;
    group_type: "online" | "center";
};

const Groups: React.FC = () => {
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;
    const navigate = useNavigate();

    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupType, setGroupType] = useState<"online" | "center">("online");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // fetch groups
    const fetchGroups = useCallback(async () => {
        if (!adminToken) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/groups/getGroups?admin_token=${adminToken}&group_type=${groupType}`
            );
            const text = await res.text();
            if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
            const data = JSON.parse(text);

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setGroups(data.groups);
            } else {
                setGroups([]);
                toast.error(data.message || "فشل في تحميل المجموعات.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, groupType, logout]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // delete group
    const confirmDeleteGroup = (group: Group) => {
        setSelectedGroup(group);
        setConfirmOpen(true);
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;
        setConfirmOpen(false);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("group_code", selectedGroup.group_code);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/groups/deleteGroup",
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
                toast.success("تم حذف المجموعة بنجاح.");
                setGroups((prev) =>
                    prev.filter((g) => g.group_code !== selectedGroup.group_code)
                );
            } else {
                toast.error(data.message || "فشل في حذف المجموعة.");
            }
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء الحذف.");
        } finally {
            setLoading(false);
            setSelectedGroup(null);
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-center lg:justify-start items-center">
                <h1 className="text-3xl font-arabic-bold text-primary">المجموعات</h1>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {[
                        { key: "online", label: "الأونلاين" },
                        { key: "center", label: "السنتر" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setGroupType(f.key as "online" | "center")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${groupType === f.key
                                ? "bg-primary text-white shadow-md"
                                : "bg-muted/30 text-foreground/70 hover:bg-muted/50"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Add Group */}
                <button
                    onClick={() => navigate("/groups/add-group")}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة مجموعة
                </button>
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : groups.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {groups.map((group) => (
                            <div
                                key={group.group_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-primary">{group.group_name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 rounded-full hover:bg-primary/10 text-primary transition"
                                            onClick={() =>
                                                navigate(`/groups/${group.group_code}/group-details`)
                                            }
                                            title="عرض المجموعة"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                            onClick={() =>
                                                navigate(`/groups/${group.group_code}/edit-group`, {
                                                    state: {
                                                        group_name: group.group_name,
                                                        group_type: group.group_type,
                                                    },
                                                })
                                            }
                                            title="تعديل المجموعة"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                            onClick={() => confirmDeleteGroup(group)}
                                            title="حذف المجموعة"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <p className="text-sm text-muted-foreground">الكود: {group.group_code}</p>
                                <p className="text-sm">عدد الطلاب: {group.student_count}</p>
                                <p className="text-sm">تاريخ الإنشاء: {group.date_create}</p>
                                <p className="text-sm">تاريخ التحديث: {group.date_update}</p>
                                <p className="text-sm">
                                    النوع:{" "}
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${group.group_type === "online"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {group.group_type === "online" ? "أونلاين" : "سنتر"}
                                    </span>
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
                                    <th className="px-4 py-3">اسم المجموعة</th>
                                    <th className="px-4 py-3">عدد الطلاب</th>
                                    <th className="px-4 py-3">تاريخ الإنشاء</th>
                                    <th className="px-4 py-3">تاريخ التحديث</th>
                                    <th className="px-4 py-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group) => (
                                    <tr
                                        key={group.group_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{group.group_code}</td>
                                        <td className="px-4 py-3 font-medium text-primary">
                                            {group.group_name}
                                        </td>
                                        <td className="px-4 py-3">{group.student_count}</td>
                                        <td className="px-4 py-3">{group.date_create}</td>
                                        <td className="px-4 py-3">{group.date_update}</td>
                                        <td className="px-4 py-3 flex items-center justify-center gap-3">
                                            <button
                                                className="p-2 rounded-full hover:bg-primary/10 text-primary transition"
                                                onClick={() =>
                                                    navigate(`/groups/${group.group_code}/group-details`)
                                                }
                                                title="عرض المجموعة"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                                onClick={() =>
                                                    navigate(`/groups/${group.group_code}/edit-group`, {
                                                        state: {
                                                            group_name: group.group_name,
                                                            group_type: group.group_type,
                                                        },
                                                    })
                                                }
                                                title="تعديل المجموعة"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                                                onClick={() => confirmDeleteGroup(group)}
                                                title="حذف المجموعة"
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
                        لا يوجد مجموعات
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        حاول تغيير عوامل التصفية أو تحقق لاحقًا لرؤية تحديثات جديدة.
                    </p>
                </motion.div>
            )}

            {/* Dialog */}
            <CustomConfirmDialog
                open={confirmOpen}
                message="هل أنت متأكد من أنك تريد حذف هذه المجموعة؟"
                onConfirm={handleDeleteGroup}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default Groups;
