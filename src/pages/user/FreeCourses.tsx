import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertCircle, Search, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FreeCourses = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // 📌 Handle Purchase (نفس منطق PayCourses)
  const handlePurchase = async (contentCode) => {
    if (!user?.student_token) {
      toast.error("الرجاء تسجيل الدخول لإتمام عملية الشراء.");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("student_token", user.student_token);
      formDataToSend.append("subscription_type", "course");
      formDataToSend.append("subscription_content", contentCode);

      const response = await fetch(
        "https://apis.mr-biology.com/student/payments/subscription",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();
      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      }
      if (data.status === "success") {
        if (data.subscription_code) {
          toast.success(`تم الاشتراك بنجاح! كود الاشتراك: ${data.subscription_code}`);
        } else if (data.payment_code && data.payment_url) {
          toast.info("جارٍ تحويلك إلى صفحة الدفع...");
          window.location.href = data.payment_url;
        }
      } else {
        handlePaymentErrors(data);
      }
    } catch (error) {
      console.error("Error in API request:", error);
      toast.error("خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentErrors = (data) => {
    switch (data.reason) {
      case "already_subscribed":
        toast.info("أنت مشترك بالفعل في هذا الكورس.");
        break;
      case "not_found":
        toast.error(`${data.message}`);
        break;
      default:
        toast.error(`خطأ: ${data.message || "حدث خطأ أثناء الشراء"}`);
        break;
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!user?.student_token) {
          toast.info("الرجاء تسجيل الدخول لعرض الكورسات.");
          return;
        }

        setLoading(true);
        const response = await fetch(
          `https://apis.mr-biology.com/student/courses/getCourses?student_token=${user.student_token}`
        );
        const data = await response.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
        }

        if (data.status === "success") {
          const freeCourses = data.courses.filter(
            (course) => course.course_type === "free"
          );
          setCourses(freeCourses);
        } else {
          toast.error("خطأ في جلب البيانات.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("حدث خطأ أثناء جلب الكورسات.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.student_token, logout]);



  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * coursesPerPage;
    return courses.slice(start, start + coursesPerPage);
  }, [courses, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-white text-xl">جاري تحميل الكورسات...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-16 bg-primary-dark">
      {/* Title + Search */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center md:justify-between mb-12">
        <h1 className="text-3xl font-bold text-white">الكورسات المجانية</h1>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <AlertCircle className="w-16 h-16 text-primary mb-6" />
          <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
            لا توجد كورسات متاحة حاليًا
          </h3>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {paginatedCourses.map((course, i) => (
              <motion.div
                key={course.course_code}
                className="card-dark bg-primary-dark group hover:scale-105 transition-all duration-300 md:w-96 cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="relative overflow-hidden rounded-lg mb-6"

                >
                  <img
                    src={course.course_image}
                    alt={course.course_title}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    مجاني
                  </div>
                  <div className="absolute top-4 right-4 bg-primary rounded-full p-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-6 text-center p-4">
                  <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                    {course.course_title}
                  </h3>
                  <Button
                    className="flex items-center justify-center gap-3 rounded-xl btn-primary w-48 mx-auto font-bold lg:text-xl"
                    onClick={() => handlePurchase(course.course_code)}
                  >
                    شراء مجانًا <Play />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full mt-2 bg-transparent border-none text-primary-light"
                    onClick={() => navigate(`/my-courses/course/${course.course_code}`, { state: course })}
                  >
                    تفاصيل الكورس .....
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full bg-white text-primary-dark border-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full ${currentPage === i + 1
                  ? "bg-primary text-white"
                  : "bg-white text-primary-dark border-0"
                  }`}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full bg-white text-primary-dark border-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FreeCourses;
