import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  DollarSign,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

const Dashboard = () => {
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;

  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!adminToken) {
        toast.error("لا يوجد صلاحيات للدخول (token مفقود)");
        return;
      }

      try {
        const response = await fetch(
          `https://apis.mr-biology.com/admin/getStatistics?admin_token=${adminToken}`
        );
        const data = await response.json();

        if (data.status === "success") {
          const statistics = data.statistics;

          setStats([
            {
              title: "عدد الطلاب الكلي",
              value:
                statistics.find((s: any) => s.short_name === "total_students")
                  ?.value || 0,
              icon: Users,
              color: "text-primary-light",
            },
            {
              title: "عدد الطلاب الأون لاين",
              value:
                statistics.find((s: any) => s.short_name === "online_students")
                  ?.value || 0,
              icon: Users,
              color: "text-sky-400",
            },
            {
              title: "عدد طلاب السنتر",
              value:
                statistics.find((s: any) => s.short_name === "center_students")
                  ?.value || 0,
              icon: Users,
              color: "text-purple-400",
            },
            {
              title: "عدد الكورسات الكلي",
              value:
                statistics.find((s: any) => s.short_name === "total_cources")
                  ?.value || 0,
              icon: BookOpen,
              color: "text-yellow-400",
            },
            {
              title: "عدد الكورسات المفعلة",
              value:
                statistics.find((s: any) => s.short_name === "active_cources")
                  ?.value || 0,
              icon: CheckCircle2,
              color: "text-green-400",
            },
            {
              title: "عدد الكورسات الغير مفعلة",
              value:
                statistics.find((s: any) => s.short_name === "unactive_cources")
                  ?.value || 0,
              icon: XCircle,
              color: "text-red-500",
            },
            {
              title: "عمليات شراء مكتملة",
              value:
                statistics.find(
                  (s: any) => s.short_name === "total_sub_courses_complete"
                )?.value || 0,
              icon: CheckCircle2,
              color: "text-green-400",
            },
            {
              title: "عمليات شراء غير مكتملة",
              value:
                statistics.find(
                  (s: any) => s.short_name === "total_sub_courses_unComplete"
                )?.value || 0,
              icon: XCircle,
              color: "text-red-500",
            },
            {
              title: "طلبات الإنضمام",
              value:
                statistics.find((s: any) => s.short_name === "unactive_students")
                  ?.value || 0,
              icon: UserPlus,
              color: "text-primary-light",
            },
            {
              title: "الأرباح (مدفوعة)",
              value:
                statistics.find(
                  (s: any) => s.short_name === "total_paid_earnings"
                )?.value || 0,
              icon: DollarSign,
              color: "text-green-400",
            },
            {
              title: "الأرباح (غير مدفوعة)",
              value:
                statistics.find(
                  (s: any) => s.short_name === "total_unpaid_earnings"
                )?.value || 0,
              icon: DollarSign,
              color: "text-red-500",
            },
          ]);
        } else if (data.reason === "unauthorized") {
          toast.info("يرجى تسجيل الدخول مرة اخرى");
          logout();
        } else {
          toast.error("حدث خطأ أثناء جلب الإحصائيات");
        }
      } catch (error) {
        console.error(error);
        toast.error("خطأ في الاتصال بالسيرفر");
      }
    };

    fetchStats();
  }, [adminToken, logout]);

  return (
    <div className="p-8 lg:p-16 mt-24 lg:mt-0 bg-primary-dark min-h-screen">
      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          >
            <Card className="bg-black text-center shadow-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300 border border-white/10">
              <div className="flex flex-col items-center justify-center space-y-6">
                <stat.icon className={`w-12 h-12 ${stat.color}`} />
                <h3 className="font-bold text-lg text-primary-light">
                  {stat.title}
                </h3>
                <div
                  className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}
                >
                  {stat.value}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <hr className="border-t-4 mt-6 mb-12 mx-auto w-[50vw] border-primary-light" />
    </div>
  );
};

export default Dashboard;
