import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";

type Payment = {
    payment_code: string;
    student_name: string;
    student_phone_number: string;
    payment_amount: string;
    payment_status: "complete" | "unComplete";
};

const SubscriptionsCount: React.FC = () => {
    const location = useLocation();
    const { courseName } = location.state || {};
    const { course_code } = useParams();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = useCallback(async () => {
        if (!adminToken || !course_code) return;
        try {
            setLoading(true);
            const res = await fetch(
                `https://apis.mr-biology.com/admin/courses/getPaymentsCourse?admin_token=${adminToken}&course_code=${course_code}`
            );
            const data = await res.json();

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                setPayments(data.payments);
            } else {
                toast.error(data.message || "لا توجد بيانات للمدفوعات");
                setPayments([]);
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    }, [adminToken, course_code, logout]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleUpdatePaymentStatus = async (
        paymentCode: string,
        newStatus: "complete" | "unComplete"
    ) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken || "");
            formData.append("payment_code", paymentCode);
            formData.append("payment_status", newStatus);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/courses/updatePaymentStatusCourse",
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
                toast.success("تم تحديث حالة الدفع بنجاح!");
                setPayments((prev) =>
                    prev.map((p) =>
                        p.payment_code === paymentCode
                            ? { ...p, payment_status: newStatus }
                            : p
                    )
                );
            } else {
                toast.error(data.message || "فشل تحديث حالة الدفع");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ أثناء تحديث حالة الدفع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom section-padding space-y-8">
            {/* Header */}
            <div className="flex justify-center lg:justify-start items-center">
                <h1 className="text-3xl font-arabic-bold text-primary">
                    {courseName ? `طلاب كورس ${courseName}` : "المدفوعات"}
                </h1>
            </div>

            {/* Data */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : payments.length > 0 ? (
                <>
                    {/* Mobile Cards */}
                    <div className="grid gap-4 md:hidden">
                        {payments.map((p) => (
                            <div
                                key={p.payment_code}
                                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
                            >
                                <h3 className="font-bold text-lg text-primary">
                                    {p.student_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    الكود: {p.payment_code}
                                </p>
                                <p className="text-sm">الرقم: {p.student_phone_number}</p>
                                <p className="text-sm">سعر الكورس: {p.payment_amount} </p>
                                <button
                                    className={`px-3 py-1 rounded-full text-xs font-semibold w-fit transition ${p.payment_status === "complete"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                    onClick={() =>
                                        handleUpdatePaymentStatus(
                                            p.payment_code,
                                            p.payment_status === "complete" ? "unComplete" : "complete"
                                        )
                                    }
                                >
                                    {p.payment_status === "complete" ? "مفعل" : "غير مفعل"}
                                </button>
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
                                    <th className="px-4 py-3">الرقم</th>
                                    <th className="px-4 py-3">سعر الكورس</th>
                                    <th className="px-4 py-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr
                                        key={p.payment_code}
                                        className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                                    >
                                        <td className="px-4 py-3">{p.payment_code}</td>
                                        <td className="px-4 py-3 font-medium">{p.student_name}</td>
                                        <td className="px-4 py-3">{p.student_phone_number}</td>
                                        <td className="px-4 py-3">{p.payment_amount} </td>
                                        <td className="px-4 py-3">
                                            <span
                                                onClick={() =>
                                                    handleUpdatePaymentStatus(
                                                        p.payment_code,
                                                        p.payment_status === "complete"
                                                            ? "unComplete"
                                                            : "complete"
                                                    )
                                                }
                                                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold ${p.payment_status === "complete"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {p.payment_status === "complete"
                                                    ? "مفعل"
                                                    : "غير مفعل"}
                                            </span>
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
                        لا توجد مدفوعات
                    </h3>
                    <p className="text-gray-300 text-lg text-center max-w-md">
                        لم يتم تسجيل أي مدفوعات لهذا الكورس حتى الآن.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default SubscriptionsCount;
