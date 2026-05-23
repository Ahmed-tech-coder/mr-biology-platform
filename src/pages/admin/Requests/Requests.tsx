import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Trash2, Check, Search, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type Student = {
  student_code: string;
  student_name: string;
  student_phone_number: string;
  date_create: string;
  date_update: string;
};

const Requests: React.FC = () => {
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    data: Student;
    action: "accept" | "delete";
  } | null>(null);

  // fetch unactive students
  const fetchStudents = useCallback(async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://apis.mr-biology.com/admin/students/getUnactiveStudents?admin_token=${adminToken}`
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
  }, [adminToken, logout]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // search
  const handleSearch = () => {
    const trimmed = phoneNumber.trim();

    // validation: only digits, no spaces
    if (!trimmed) {
      toast.error("من فضلك أدخل رقم الهاتف.");
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      toast.error("رقم الهاتف يجب أن يحتوي على أرقام فقط.");
      return;
    }

    const results = students.filter((s) =>
      s.student_phone_number.includes(trimmed)
    );
    if (results.length > 0) {
      setStudents(results);
      toast.success("تم العثور على الطالب.");
    } else {
      toast.info("لا يوجد طالب بهذا الرقم.");
    }
  };

  useEffect(() => {
    if (phoneNumber.trim() === "") {
      fetchStudents();
    }
  }, [phoneNumber, fetchStudents]);

  // confirm action
  const confirmAction = (student: Student, action: "accept" | "delete") => {
    setSelectedStudent({ data: student, action });
    setConfirmOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedStudent) return;
    setConfirmOpen(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("admin_token", adminToken || "");
      formData.append("student_code", selectedStudent.data.student_code);
      formData.append("action_type", selectedStudent.action);

      const res = await fetch(
        "https://apis.mr-biology.com/admin/students/handleStudentRequest",
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
        toast.success(
          selectedStudent.action === "accept"
            ? "تم قبول الطالب بنجاح."
            : "تم حذف الطالب بنجاح."
        );
        setStudents((prev) =>
          prev.filter((s) => s.student_code !== selectedStudent.data.student_code)
        );
      } else {
        toast.error(data.message || "فشل في المعالجة.");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطأ أثناء المعالجة.");
    } finally {
      setLoading(false);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="container-custom section-padding space-y-8">
      {/* Header */}
      <div className="flex justify-center lg:justify-start items-center">
        <h1 className="text-3xl font-arabic-bold text-primary">
          الطلاب الغير نشطين
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search (aligned left) */}
        <div className="relative w-full md:w-1/3 md:mr-auto">
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
                      onClick={() => confirmAction(student, "accept")}
                      className="p-2 rounded-full hover:bg-green-100 text-green-600 transition"
                      title="قبول الطالب"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmAction(student, "delete")}
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
                <p className="text-sm">رقم الهاتف: {student.student_phone_number}</p>
                <p className="text-sm">تاريخ الإنشاء: {student.date_create}</p>
                <p className="text-sm">تاريخ التحديث: {student.date_update}</p>
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
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                  <th className="px-4 py-3">تاريخ التحديث</th>
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
                    <td className="px-4 py-3 font-medium text-primary">
                      {student.student_name}
                    </td>
                    <td className="px-4 py-3">{student.student_phone_number}</td>
                    <td className="px-4 py-3">{student.date_create}</td>
                    <td className="px-4 py-3">{student.date_update}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          className="p-2 rounded-full hover:bg-green-100 text-green-600 transition"
                          onClick={() => confirmAction(student, "accept")}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition"
                          onClick={() => confirmAction(student, "delete")}
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
            لا يوجد طلاب غير نشطين
          </h3>
          <p className="text-gray-300 text-lg text-center max-w-md">
            حاول تعديل عوامل البحث أو تحقق لاحقًا لرؤية تحديثات جديدة.
          </p>
        </motion.div>
      )}

      {/* Dialog */}
      <CustomConfirmDialog
        open={confirmOpen}
        message={
          selectedStudent?.action === "accept"
            ? "هل أنت متأكد من أنك تريد قبول هذا الطالب؟"
            : "هل أنت متأكد من أنك تريد حذف هذا الطالب؟"
        }
        onConfirm={handleProcess}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Requests;
