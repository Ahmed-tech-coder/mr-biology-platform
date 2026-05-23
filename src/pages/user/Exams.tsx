import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useAuth from "@/context/AuthContext";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

type Exam = {
  exam_code: string;
  exam_title: string;
  duration: number;
  course: string;
  submission_status: string;
  total_score?: number;
  max_score?: number;
  end_date?: string;
};

const Exams = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.student_token) {
      toast.info(" الرجاء تسجيل الدخول لعرض الاختبارات.");
      navigate("/login");
      return;
    }

    fetch(
      `https://apis.mr-biology.com/student/exams/getStudentExams?student_token=${user.student_token}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
        } else if (data.status === "success") {
          if (data.exams.length === 0) {
            toast.info("لا يوجد اختبارات متاحة حاليًا.");
          }
          setExams(data.exams);
        } else {
          toast.error("حدث خطأ أثناء تحميل الاختبارات.");
        }
      })
      .catch(() => toast.error("خطأ في الاتصال بالخادم."))
      .finally(() => setLoading(false));
  }, [user?.student_token, logout, navigate]);

  const handleStartExam = useCallback(
    (examCode: string) => {
      const formData = new FormData();
      formData.append("student_token", user.student_token);
      formData.append("exam_code", examCode);

      fetch(`https://apis.mr-biology.com/student/exams/startExam`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            toast.success("بدأ الاختبار!");
            navigate(`/exam/${examCode}/questions`);
          } else {
            toast.error(data.message || "فشل بدء الاختبار");
          }
        })
        .catch(() => toast.error("خطأ أثناء بدء الاختبار."));
    },
    [navigate, user?.student_token]
  );

  const handleShowResult = useCallback(
    (examCode: string) => {
      navigate(`/exam/${examCode}/review`);
    },
    [navigate]
  );

  if (loading) {
    return <p className="text-center text-gray-400 py-20">جارٍ تحميل الاختبارات...</p>;
  }

  if (exams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24"
      >
        <AlertCircle className="w-16 h-16 text-primary mb-6" />
        <h3 className="text-3xl lg:text-4xl font-arabic-bold text-white mb-4">
          لا توجد اختبارات متاحة حاليًا
        </h3>
        <p className="text-gray-300 text-lg text-center max-w-md">
          نحن نعمل على إضافة المزيد من الاختبارات قريبًا!
        </p>
      </motion.div>
    );
  }

  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="section-padding bg-primary-dark min-h-screen">
      {/* Header */}
      <motion.h2
        className="text-4xl font-arabic-bold text-center lg:text-start text-primary-light mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        الاختبارات
      </motion.h2>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {exams.map((exam, i) => (
          <motion.div
            key={exam.exam_code}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            whileHover={{ scale: 1.04 }}
          >
            <div className="card-dark bg-gradient-to-b from-primary-dark/90 to-primary-dark rounded-2xl p-6 flex flex-col justify-between h-full shadow-lg border border-primary/20">
              <div className="space-y-4">
                <h3 className="text-2xl font-arabic-semibold text-white">
                  {exam.exam_title}
                </h3>

                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5 text-primary-light" />
                  <span>{exam.duration} دقيقة</span>
                </div>

                <div className="bg-primary/10 rounded-xl p-3">
                  <span className="block text-gray-400 text-sm">
                    انتهاء الاختبار:
                  </span>
                  <span className="block text-white font-arabic-semibold text-base mt-1">
                    {formatEndDate(exam.end_date)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {exam.submission_status === "مكتمل" ? (
                <div className="flex flex-col items-center mt-6 space-y-4">
                  {/* Progress Circle */}
                  <RadialBarChart
                    width={120}
                    height={120}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={12}
                    data={[
                      {
                        name: "الدرجة",
                        value: Math.round(
                          (exam.total_score / exam.max_score) * 100
                        ),
                        fill: "#4ade80", // أخضر
                      },
                    ]}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background
                      clockWise
                      dataKey="value"
                      cornerRadius={10}
                    />
                  </RadialBarChart>
                  <p className="text-sm font-bold text-white">
                    درجتك: {exam.total_score} / {exam.max_score}
                  </p>
                  <button
                    className="btn-primary mt-2 rounded-xl w-full"
                    onClick={() => handleShowResult(exam.exam_code)}
                  >
                    مراجعة الاختبار
                  </button>
                </div>
              ) : (
                <Button
                  className="btn-primary flex items-center justify-center gap-2 mt-6 rounded-xl w-full"
                  onClick={() => handleStartExam(exam.exam_code)}
                >
                  <Play className="w-5 h-5" />
                  بدء الاختبار
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Exams;
