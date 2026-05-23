import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

type Student = {
  student_code: string;
  student_name: string;
  student_phone_number: string;
  date_create: string;
  date_update: string;
};

const GroupDetails: React.FC = () => {
  const navigate = useNavigate();
  const { group_code } = useParams();
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupStudents = useCallback(async () => {
    if (!adminToken || !group_code) return;

    try {
      setLoading(true);
      const res = await fetch(
        `https://apis.mr-biology.com/admin/groups/getGroupStudents?admin_token=${adminToken}&group_code=${group_code}`
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
        toast.error(data.message || "فشل في تحميل الطلاب.");
        setStudents([]);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }, [adminToken, group_code, logout]);

  useEffect(() => {
    fetchGroupStudents();
  }, [fetchGroupStudents]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="container-custom section-padding space-y-8">
      {/* Header */}
      <div className="flex justify-center lg:justify-start items-center">
        <h1 className="text-3xl font-arabic-bold text-primary">تفاصيل المجموعة</h1>
      </div>

      {/* Data */}
      {students.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {students.map((student) => (
              <div
                key={student.student_code}
                className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-lg text-primary">
                  {student.student_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  الكود: {student.student_code}
                </p>
                <p className="text-sm">رقم الهاتف: {student.student_phone_number}</p>
                <p className="text-sm">تاريخ الإنشاء: {student.date_create}</p>
                <p className="text-sm">تاريخ التحديث: {student.date_update}</p>

                <button
                  onClick={() =>
                    navigate("/admin/admin-home/student-data", {
                      state: { student_code: student.student_code },
                    })
                  }
                  className="btn-primary mt-3"
                >
                  عرض التفاصيل
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
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                  <th className="px-4 py-3">تاريخ التحديث</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.student_code}
                    className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg"
                  >
                    <td className="px-4 py-3">{student.student_code}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate("/admin/admin-home/student-data", {
                            state: { student_code: student.student_code },
                          })
                        }
                        className="text-primary font-medium hover:underline"
                      >
                        {student.student_name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{student.student_phone_number}</td>
                    <td className="px-4 py-3">{student.date_create}</td>
                    <td className="px-4 py-3">{student.date_update}</td>
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
            لا يوجد طلاب في هذه المجموعة
          </h3>
          <p className="text-gray-300 text-lg text-center max-w-md">
            تحقق لاحقًا لرؤية تحديثات جديدة.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GroupDetails;
