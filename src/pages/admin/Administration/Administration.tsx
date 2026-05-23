import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Trash2, Edit, Loader2, AlertCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Admin = {
  admin_code: string;
  admin_name: string;
  admin_phone_number: string;
  account_role: string;
  date_create: string;
  date_update: string;
};

const Administration: React.FC = () => {
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;
  const navigate = useNavigate();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // fetch admins
  const fetchAdmins = useCallback(async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://apis.mr-biology.com/admin/admins/getAdmins?admin_token=${adminToken}`
      );
      const text = await res.text();
      if (!text) throw new Error("مفيش بيانات راجعة من السيرفر");
      const data = JSON.parse(text);

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (data.status === "success") {
        setAdmins(data.admins);
      } else {
        setAdmins([]);
        toast.error(data.message || "فشل في تحميل الإداريين.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }, [adminToken, logout]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // delete admin
  const confirmDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setConfirmOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("admin_token", adminToken || "");
      formData.append("admin_code", selectedAdmin.admin_code);

      const res = await fetch(
        "https://apis.mr-biology.com/admin/admins/deleteAdmin",
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
        toast.success("تم حذف الإداري بنجاح.");
        setAdmins((prev) =>
          prev.filter((a) => a.admin_code !== selectedAdmin.admin_code)
        );
      } else {
        toast.error(data.message || "فشل في حذف الإداري.");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحذف.");
    } finally {
      setLoading(false);
      setSelectedAdmin(null);
    }
  };

  return (
    <div className="container-custom section-padding space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 justify-center lg:justify-between items-center">
        <h1 className="text-3xl font-arabic-bold text-primary">
          إدارة المسؤولين
        </h1>
        <button
          onClick={() => navigate("/administration/add-administration")}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          إضافة عضو
        </button>
      </div>

      {/* Data */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : admins.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {admins.map((admin) => (
              <div
                key={admin.admin_code}
                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-primary">
                    {admin.admin_name}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/administration/${admin.admin_code}/edit-administration`,
                          { state: admin }
                        )
                      }
                      className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                      title="تعديل"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDeleteAdmin(admin)}
                      className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  الكود: {admin.admin_code}
                </p>
                <p className="text-sm">الرقم: {admin.admin_phone_number}</p>
                <p className="text-sm">الدور: {admin.account_role}</p>
                <p className="text-sm">تاريخ الإنشاء: {admin.date_create}</p>
                <p className="text-sm">تاريخ التحديث: {admin.date_update}</p>
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
                  <th className="px-4 py-3">الدور</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                  <th className="px-4 py-3">تاريخ التحديث</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.admin_code}
                    className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                  >
                    <td className="px-4 py-3">{admin.admin_code}</td>
                    <td className="px-4 py-3 font-bold text-primary ">
                      {admin.admin_name}
                    </td>
                    <td className="px-4 py-3">{admin.admin_phone_number}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
      ${admin.account_role === "super_admin"
                            ? "bg-red-100 text-red-700"
                            : admin.account_role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                      >
                        {admin.account_role === "super_admin"
                          ? "مشرف عام"
                          : admin.account_role === "admin"
                            ? "أدمن"
                            : "مصحح"}
                      </span>
                    </td>

                    <td className="px-4 py-3">{admin.date_create}</td>
                    <td className="px-4 py-3">{admin.date_update}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/administration/${admin.admin_code}/edit-administration`,
                              { state: admin }
                            )
                          }
                          className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                          title="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => confirmDeleteAdmin(admin)}
                          className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                          title="حذف"
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
            لا يوجد إداريين
          </h3>
          <p className="text-gray-300 text-lg text-center max-w-md">
            حاول إضافة إداري جديد أو تحقق لاحقًا لرؤية تحديثات جديدة.
          </p>
        </motion.div>
      )}

      {/* Dialog */}
      <CustomConfirmDialog
        open={confirmOpen}
        message="هل أنت متأكد من أنك تريد حذف هذا الإداري؟"
        onConfirm={handleDeleteAdmin}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Administration;
