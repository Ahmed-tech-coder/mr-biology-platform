import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import mr from "@/assets/images/StudentPage/mr.png";

type ExamInfo = {
  exam_code: string;
  exam_title: string;
  start_date: string;
  end_date: string;
  score_per_question: number;
  duration: number;
  status: "active" | "unactive";
};

type Submission = {
  submission_code: string;
  student_name: string;
  student_code: string;
  group_name: string;
  start_time: string;
  submission_date: string;
  total_score: number;
  max_score: number;
  correct_answers: number;
  total_questions: number;
};

const ExamDetails: React.FC = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;
  const { exam_code } = useParams<{ exam_code: string }>();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminToken || !exam_code) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://apis.mr-biology.com/admin/exams/getStudentExamSubmissions?admin_token=${adminToken}&exam_code=${exam_code}`
        );
        const data = await res.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
          return;
        }

        if (data.status === "success") {
          setExam(data.exam_info);
          setSubmissions(data.submissions);
        } else {
          throw new Error(data.message || "فشل في جلب بيانات الامتحان.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [adminToken, exam_code, logout]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center py-20 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="container-custom section-padding space-y-8">
      {/* Header */}
      <div className="flex justify-center lg:justify-start items-center">
        <h1 className="text-3xl font-arabic-bold text-primary">
          تفاصيل الامتحان
        </h1>
      </div>

      {/* Exam Card / Table */}
      {exam ? (
        <>
          {/* Mobile Card */}
          <div className="md:hidden card-dark p-5 rounded-xl shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-lg text-primary">{exam.exam_title}</h3>
            <p className="text-sm text-muted-foreground">الكود: {exam.exam_code}</p>
            <p className="text-sm">تاريخ البدء: {exam.start_date}</p>
            <p className="text-sm">تاريخ الانتهاء: {exam.end_date}</p>
            <p className="text-sm">الدرجة لكل سؤال: {exam.score_per_question}</p>
            <p className="text-sm">المدة: {exam.duration} دقيقة</p>
            <p
              className={`text-sm font-semibold cursor-pointer w-fit px-3 py-1 rounded-full ${exam.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {exam.status === "active" ? "مفعل" : "غير مفعل"}
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block card-dark bg-primary-light overflow-x-auto rounded-xl shadow-sm">
            <table className="w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-muted/30 text-foreground/80">
                  <th className="px-4 py-3">الكود</th>
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-4 py-3">تاريخ البدء</th>
                  <th className="px-4 py-3">تاريخ الانتهاء</th>
                  <th className="px-4 py-3">الدرجة لكل سؤال</th>
                  <th className="px-4 py-3">المدة (دقائق)</th>
                  <th className="px-4 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg">
                  <td className="px-4 py-3">{exam.exam_code}</td>
                  <td className="px-4 py-3 font-medium text-primary">{exam.exam_title}</td>
                  <td className="px-4 py-3">{exam.start_date}</td>
                  <td className="px-4 py-3">{exam.end_date}</td>
                  <td className="px-4 py-3">{exam.score_per_question}</td>
                  <td className="px-4 py-3">{exam.duration}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {exam.status === "active" ? "مفعل" : "غير مفعل"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {/* Submissions */}
      {submissions.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {submissions.map((sub) => (
              <div key={sub.submission_code} className="card-dark p-5 rounded-xl shadow-sm flex flex-col gap-2">
                <h4 className="font-bold text-primary">{sub.student_name}</h4>
                <p className="text-sm">كود الطالب: {sub.student_code}</p>
                <p className="text-sm">المجموعة: {sub.group_name}</p>
                <p className="text-sm">بداية الحل: {sub.start_time}</p>
                <p className="text-sm">تاريخ التسليم: {sub.submission_date}</p>
                <p className="text-sm">النتيجة: {sub.total_score} / {sub.max_score}</p>
                <p className="text-sm">الإجابات الصحيحة: {sub.correct_answers}</p>
                <p className="text-sm">عدد الأسئلة: {sub.total_questions}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block card-dark bg-primary-light overflow-x-auto rounded-xl shadow-sm">
            <table className="w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-muted/30 text-foreground/80">
                  <th className="px-4 py-3">اسم الطالب</th>
                  <th className="px-4 py-3">كود الطالب</th>
                  <th className="px-4 py-3">المجموعة</th>
                  <th className="px-4 py-3">بداية الحل</th>
                  <th className="px-4 py-3">تاريخ التسليم</th>
                  <th className="px-4 py-3">النتيجة</th>
                  <th className="px-4 py-3">الإجابات الصحيحة</th>
                  <th className="px-4 py-3">عدد الأسئلة</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submission_code} className="bg-primary-foreground hover:bg-muted/20 transition-all rounded-lg">
                    <td className="px-4 py-3">{sub.student_name}</td>
                    <td className="px-4 py-3">{sub.student_code}</td>
                    <td className="px-4 py-3">{sub.group_name}</td>
                    <td className="px-4 py-3">{sub.start_time}</td>
                    <td className="px-4 py-3">{sub.submission_date}</td>
                    <td className="px-4 py-3">{sub.total_score} / {sub.max_score}</td>
                    <td className="px-4 py-3">{sub.correct_answers}</td>
                    <td className="px-4 py-3">{sub.total_questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="w-16 h-16 text-primary-dark mb-6" />
          <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">لا توجد نتائج</h3>
          <p className="text-gray-300 text-lg text-center max-w-md">لم يتم تقديم أي اختبارات حتى الآن.</p>
        </motion.div>
      )}
    </div>
  );
};

export default ExamDetails;
