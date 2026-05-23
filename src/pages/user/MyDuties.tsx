import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useAuth from "@/context/AuthContext";

type Duty = {
  duty_code: string;
  duty_title: string;
  group_name: string;
  deadline: string;
  submission_status: string;
  grade?: number;
};

const MyDuties = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.student_token) {
      toast.info("الرجاء تسجيل الدخول لعرض الواجبات.");
      navigate("/login");
      return;
    }

    fetch(
      `https://apis.mr-biology.com/student/duties/getAllDuties?student_token=${user.student_token}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
        } else if (data.status === "success") {
          setDuties(data.duties);
        } else {
          toast.error(data.message || "فشل تحميل الواجبات.");
        }
      })
      .catch(() => toast.error("خطأ في الاتصال بالخادم."))
      .finally(() => setLoading(false));
  }, [user?.student_token, logout, navigate]);

  const handleSubmit = useCallback(
    (duty: Duty) => {
      if (duty.submission_status === "تم الاستلام") {
        toast.error("تم استلام الواجب بالفعل. لا يمكن تسليمه مرة أخرى.");
        return;
      }

      navigate("/my-duties/submission", {
        state: { duty_code: duty.duty_code },
      });
    },
    [navigate]
  );

  if (loading) {
    return (
      <p className="text-center text-gray-400 py-20">جارٍ تحميل الواجبات...</p>
    );
  }

  if (duties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24"
      >
        <AlertCircle className="w-16 h-16 text-primary mb-6" />
        <h3 className="text-3xl lg:text-4xl font-arabic-bold text-white mb-4">
          لا توجد واجبات متاحة حاليًا
        </h3>
        <p className="text-gray-300 text-lg text-center max-w-md">
          سيتم إضافة المزيد من الواجبات قريبًا!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="section-padding bg-primary-dark min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-12"
      >
        <ClipboardList className="w-8 h-8 text-primary-light" />
        <h2 className="text-4xl font-arabic-bold text-primary-light">
          الواجبات
        </h2>
      </motion.div>

      {/* Duties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {duties.map((duty, i) => (
          <motion.div
            key={duty.duty_code}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative rounded-2xl p-6 flex flex-col justify-between h-full shadow-lg border border-primary/20 backdrop-blur-lg bg-primary-dark/70 hover:shadow-primary/40 transition">
              <div className="space-y-4">
                {/* Title */}
                <h3 className="text-2xl font-arabic-semibold text-white line-clamp-2">
                  {duty.duty_title}
                </h3>

                {/* Group */}
                <div className="flex items-center gap-2 text-gray-300">
                  <ClipboardList className="w-5 h-5 text-primary-light" />
                  <span>{duty.group_name}</span>
                </div>

                {/* Deadline */}
                <div className="bg-primary/10 rounded-lg px-3 py-2 flex items-center gap-2 text-gray-300 w-fit">
                  <CalendarDays className="w-5 h-5 text-primary-light" />
                  <span>{duty.deadline}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6">
                {duty.submission_status === "تم الاستلام" ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      تم الاستلام
                    </span>
                    {duty.grade !== undefined && (
                      <p className="text-sm font-bold text-white mt-1">
                        التقييم:{" "}
                        <span className="text-primary-light">{duty.grade}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <Button
                    className="btn-primary flex items-center justify-center gap-2 mt-2 rounded-xl w-full"
                    onClick={() => handleSubmit(duty)}
                  >
                    تسليم الواجب
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyDuties;
