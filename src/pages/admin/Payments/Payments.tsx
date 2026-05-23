import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Trash2, Search, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type Payment = {
  payment_code: string;
  student_name: string;
  subscription_content_name: string;
  payment_amount: string;
  payment_status: "complete" | "unComplete";
};

const CoursesPayments: React.FC = () => {
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "all" | "complete" | "unComplete"
  >("all");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string | null>(
    null
  );

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("admin_token", adminToken || "");
      params.append("payment_status", paymentStatus);

      const response = await fetch(
        `https://apis.mr-biology.com/admin/payments/getPayments?${params.toString()}`
      );
      const data = await response.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (data.status === "success") {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [adminToken, paymentStatus, logout]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // البحث
  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      toast.error("من فضلك أدخل رقم الهاتف.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("admin_token", adminToken || "");
      params.append("phone_number", phoneNumber);

      const response = await fetch(
        `https://apis.mr-biology.com/admin/payments/searchPayment?${params.toString()}`
      );
      const data = await response.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (data.status === "success") {
        setPayments(data.payments);
      } else {
        setPayments([]);
        toast.info("لم يتم العثور على نتائج.");
      }
    } catch (error) {
      console.error("Error searching payment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneNumber.trim() === "") {
      fetchPayments();
    }
  }, [phoneNumber, fetchPayments]);

  const confirmDeletePayment = (paymentCode: string) => {
    setSelectedPaymentCode(paymentCode);
    setConfirmOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!selectedPaymentCode) return;
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("admin_token", adminToken || "");
      formData.append("payment_code", selectedPaymentCode);

      const response = await fetch(
        "https://apis.mr-biology.com/admin/payments/deletePayment",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (data.status === "success") {
        toast.success("تم الحذف بنجاح!");
        setPayments((prev) =>
          prev.filter((p) => p.payment_code !== selectedPaymentCode)
        );
      } else {
        toast.error("حدث خطأ أثناء الحذف. حاول مرة أخرى.");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("حدث خطأ أثناء الحذف.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom section-padding space-y-8">
      {/* Header */}
      <div className="flex justify-center lg:justify-start items-center">
        <h1 className="text-3xl font-arabic-bold text-primary">المدفوعات</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "complete", label: "المكتملة" },
            { key: "unComplete", label: "الغير مكتملة" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() =>
                setPaymentStatus(f.key as "all" | "complete" | "unComplete")
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                paymentStatus === f.key
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
            className="hidden md:inline-flex btn-primary absolute left-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm"
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
      ) : payments.length > 0 ? (
        <>
          {/* 📱 Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {payments.map((payment) => (
              <div
                key={payment.payment_code}
                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-primary">
                    {payment.student_name}
                  </h3>
                  <button
                    onClick={() => confirmDeletePayment(payment.payment_code)}
                    className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                    title="حذف العملية"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  رمز الدفع: {payment.payment_code}
                </p>
                <p className="text-sm">
                  الاشتراك:{" "}
                  <span className="font-medium">
                    {payment.subscription_content_name}
                  </span>
                </p>
                <p className="text-sm">
                  المبلغ:{" "}
                  <span className="font-medium text-primary">
                    {payment.payment_amount} ج.م
                  </span>
                </p>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.payment_status === "complete"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {payment.payment_status === "complete"
                      ? "مكتمل"
                      : "غير مكتمل"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 💻 Desktop Table */}
          <div className="hidden md:block card-dark bg-primary-light overflow-x-auto rounded-xl shadow-sm">
            <table className="w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-muted/30 text-foreground/80">
                  <th className="px-4 py-3 text-right">رمز الدفع</th>
                  <th className="px-4 py-3 text-right">اسم الطالب</th>
                  <th className="px-4 py-3 text-right">محتوي الاشتراك</th>
                  <th className="px-4 py-3 text-right">السعر</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.payment_code}
                    className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                  >
                    <td className="px-4 py-3">{payment.payment_code}</td>
                    <td className="px-4 py-3 font-medium text-primary">
                      {payment.student_name}
                    </td>
                    <td className="px-4 py-3">
                      {payment.subscription_content_name}
                    </td>
                    <td className="px-4 py-3">{payment.payment_amount} ج.م</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.payment_status === "complete"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.payment_status === "complete"
                          ? "مكتمل"
                          : "غير مكتمل"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                        onClick={() =>
                          confirmDeletePayment(payment.payment_code)
                        }
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
            لا توجد مدفوعات مطابقة
          </h3>
          <p className="text-gray-300 text-lg text-center max-w-md">
            حاول تعديل عوامل البحث أو تحقق لاحقًا لرؤية تحديثات جديدة.
          </p>
        </motion.div>
      )}

      {/* Dialog */}
      <CustomConfirmDialog
        open={confirmOpen}
        message="هل أنت متأكد من أنك تريد حذف هذه العملية؟"
        onConfirm={handleDeletePayment}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default CoursesPayments;
