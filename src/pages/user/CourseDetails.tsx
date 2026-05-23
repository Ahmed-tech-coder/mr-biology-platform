import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, CircleDollarSign, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useAuth from "@/context/AuthContext";

const DescriptionModal = ({
  open,
  onClose,
  description,
}: {
  open: boolean;
  onClose: () => void;
  description: string;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-black text-xl font-bold mt-10 mb-4">وصف الكورس</h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </motion.div>
    </div>
  );
};

const CourseDetails = () => {
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!courseCode || !user?.student_token) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://apis.mr-biology.com/student/courses/getCourseDetails?student_token=${user.student_token}&course_code=${courseCode}`
        );
        const data = await res.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
          return;
        }

        if (data.status === "success" && data.course.length > 0) {
          setCourse(data.course[0]);
          setLectures(data.course[0].lectures);
        } else {
          setCourse(null);
          setLectures([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطأ في الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseCode, user?.student_token, logout]);

  const handlePurchase = async (type: "course" | "lecture", code: string) => {
    if (!user?.student_token) {
      toast.error("الرجاء تسجيل الدخول لإتمام عملية الشراء.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("student_token", user.student_token);
      formData.append("subscription_type", type);
      formData.append("subscription_content", code);

      const res = await fetch(
        "https://apis.mr-biology.com/student/payments/subscription",
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (data.status === "success") {
        if (data.subscription_code) {
          toast.success(
            `تم الاشتراك بنجاح! كود الاشتراك: ${data.subscription_code}`
          );
        } else if (data.payment_code && data.payment_url) {
          window.open(data.payment_url, "_blank");
        }
      } else {
        toast.error(data.message || "حدث خطأ أثناء الاشتراك");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطأ في الاتصال بالخادم");
    }
    setLoading(false);
  };

  if (loading) {
    return <p className="text-white text-center py-20">جاري تحميل تفاصيل الكورس...</p>;
  }

  if (!course) {
    return (
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
    );
  }

  return (
    <div className="bg-primary-dark min-h-screen flex flex-col items-center m-8 gap-12 p-4 sm:p-6 lg:p-12">
      {/* العنوان */}
      <div className="text-white text-xl lg:text-3xl">
        <h1>
          تفاصيل الكورس &gt;{" "}
          <span className="text-primary font-bold">{course.course_title}</span>
        </h1>
      </div>

      {/* كارد الكورس */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row-reverse w-full max-w-5xl relative"
      >
        {course.course_price === "0" && (
          <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm z-10">
            مجاني
          </span>
        )}

        <div className="lg:w-1/2 h-64 sm:h-80 lg:h-auto relative">
          <img
            src={course.course_image}
            alt={course.course_title}
            className="w-full h-full object-cover lg:rounded-l-2xl"
          />
        </div>

        <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {course.course_title}
            </h1>

            <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
              {course.course_description?.length > 150
                ? `${course.course_description.slice(0, 150)}...`
                : course.course_description}
            </p>
            {course.course_description?.length > 150 && (
              <Button
                className="text-black"
                size="sm"
                variant="outline"
                onClick={() => setModalOpen(true)}
              >
                اقرأ المزيد....
              </Button>
            )}

            <div className="flex flex-wrap items-center gap-6 mt-6 font-semibold text-gray-800">
              <CircleDollarSign className="h-6 w-6 text-green-600" />
              <span>
                {course.course_price === "0" ? "مجاني" : `${course.course_price} جنيه`}
              </span>
            </div>
          </div>

          <Button
            onClick={() => handlePurchase("course", courseCode!)}
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-base sm:text-lg mt-6 flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5" />
            {loading
              ? "جاري المعالجة..."
              : course.course_price === "0"
                ? "الحصول على الكورس مجانًا"
                : "شراء الكورس الآن"}
          </Button>
        </div>
      </motion.div>

      {/* محتوى المحاضرات */}
      {lectures.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <AlertCircle className="w-16 h-16 text-primary mb-6" />
          <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
            لا توجد محاضرات متاحة حاليًا
          </h3>
        </motion.div>
      ) : (
        <div className="w-full max-w-5xl mt-12">
          <h2 className="text-white text-2xl mb-6">محتوى الكورس</h2>
          {lectures.map((lecture) => (
            <div
              key={lecture.lecture_code}
              className="bg-white rounded-xl p-4 mb-4 flex flex-col md:flex-row items-center gap-4 relative"
            >
              {lecture.lecture_price === "0" && (
                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  مجاني
                </span>
              )}
              <img
                src={lecture.lecture_image}
                alt={lecture.lecture_title}
                className="w-40 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-black font-bold">{lecture.lecture_title}</h3>
                <p className="text-gray-700 text-sm">{lecture.lecture_description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handlePurchase("lecture", lecture.lecture_code)}
                  disabled={loading}
                >
                  {loading
                    ? "جاري المعالجة..."
                    : lecture.lecture_price === "0"
                      ? "الحصول على هذه المحاضرة مجانًا"
                      : `شراء هذه المحاضرة ${lecture.lecture_price} جنيه`}
                </Button>
                <Button
                  onClick={() => handlePurchase("course", courseCode!)}
                  disabled={loading}
                >
                  {loading
                    ? "جاري المعالجة..."
                    : course.course_price === "0"
                      ? "الحصول على الكورس مجانًا"
                      : "شراء الكورس كامل"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال الوصف الكامل */}
      <DescriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        description={course.course_description}
      />
    </div>
  );
};

export default CourseDetails;
