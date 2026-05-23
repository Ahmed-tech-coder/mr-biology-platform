import { useEffect, useState, useCallback } from "react";
import { Card } from '@/components/ui/card';
import { BookOpen, ShoppingCart, Eye, Play, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/AuthContext";

const BASE_API = import.meta.env.VITE_BASE_API;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = user?.student_token;

  const [latestCourses, setLatestCourses] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch statistics
  useEffect(() => {
    if (!token) {
      toast.error("لا يوجد صلاحيات للدخول (token مفقود)");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchStatistics = async () => {
      try {
        const res = await fetch(`${BASE_API}/student/getStatistics?student_token=${token}`, { signal });
        const data = await res.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجى تسجيل الدخول مرة أخرى");
        } else if (data.status === "success") {
          setStatistics(data.statistics);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("حصل خطأ أثناء تحميل الإحصائيات");
        }
      }
    };

    fetchStatistics();
    return () => controller.abort();
  }, [token, logout]);

  // Fetch courses
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_API}/student/courses/getCourses?student_token=${token}`, { signal });
        const data = await res.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجى تسجيل الدخول مرة أخرى");
        } else if (data.status === "success") {

          setLatestCourses(data.courses.slice(-3).reverse());
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("حدث خطأ أثناء جلب الكورسات");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    return () => controller.abort();
  }, [token, logout]);

  // Handle purchase
  const handlePurchase = async (course) => {
    if (!token) {
      toast.error("الرجاء تسجيل الدخول لإتمام عملية الشراء.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("student_token", token);
      formData.append("subscription_type", "course");
      formData.append("subscription_content", course.course_code);

      const res = await fetch(`${BASE_API}/student/payments/subscription`, { method: "POST", body: formData });
      const data = await res.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجى تسجيل الدخول مرة أخرى");
      } else if (data.status === "success") {
        if (data.subscription_code) {
          toast.success(`تم الاشتراك بنجاح! كود الاشتراك: ${data.subscription_code}`);
        } else if (data.payment_code && data.payment_url) {
          toast.success("تم إنشاء رابط الدفع بنجاح!");
          window.open(data.payment_url, "_blank");
        }
      } else {
        toast.error(`خطأ: ${data.message}`);
      }
    } catch (err) {
      console.error("خطأ في الاتصال بالخادم:", err);
      toast.error("حدث خطأ أثناء عملية الدفع");
    }
    setLoading(false);
  };


  return (
    <div className="p-8 lg:p-16 mt-24 lg:mt-0 bg-primary-dark">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24 ">
        {statistics.map((stat, i) => {
          let value = stat.value;


          if (stat.short_name === "active_cources") {
            value = user?.group_code ?? "-";
          }

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <Card className="bg-black text-center shadow-lg rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <BookOpen className="w-12 h-12 text-primary-light" />
                  <h3 className="font-bold text-lg text-primary-light">{stat.name === "اسم المجموعة" ? <span> كود المجموعة </span> : <span> {stat.name} </span>}</h3>
                  <div className="text-2xl font-extrabold text-primary-light">{value ?? 0}</div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>


      <hr className="border-t-4 mt-6 mb-12 mx-auto w-[50vw]" />

      {/* Latest Courses */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12 text-center border-b-4 border-primary pb-4 inline-block">
          الكورسات المضافة حديثاً:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestCourses.map((course, i) => (
            <motion.div key={course.course_code} className="card-dark bg-black group hover:scale-105 transition-all duration-300 md:w-96"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.2 }} whileHover={{ scale: 1.05 }}>

              <div className="relative overflow-hidden rounded-lg mb-6">
                <img src={course.course_image} alt={course.course_title} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-primary rounded-full p-2">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-6 text-center p-4">
                <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">{course.course_title}</h3>
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-arabic-bold text-primary-light">
                    {course.course_type === "free" ? "مجاناً" : `${course.course_price} جنيه`}
                  </span>
                </div>

                <Button onClick={() => handlePurchase(course)} disabled={loading} className="flex items-center gap-3 rounded-xl btn-primary bg-white text-primary-dark font-bold lg:text-xl text-center w-48 mx-auto hover:text-white">
                  {course.course_type === "free" ? "اشترك الآن" : "شراء الآن"}
                </Button>

                <p onClick={() => navigate(`/my-courses/course/${course.course_code}`, { state: course })} className="course-Content-Home cursor-pointer text-white underline">
                  تفاصيل الكورس.....
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
