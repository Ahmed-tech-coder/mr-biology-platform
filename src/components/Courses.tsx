import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const BASE_API = import.meta.env.VITE_BASE_API;

interface Course {
  course_code: string;
  course_title: string;
  course_image: string;
  course_description: string;
  course_type: "free" | "paid";
}

const Courses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async (type: "free" | "paid") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API}/student/getCourses?course_type=${type}`);

      if (!res.ok) throw new Error("فشل في تحميل الكورسات");

      const data = await res.json();
      if (data.status === "success") {
        setCourses(data.courses);
        setCurrentIndex(0);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(activeTab);
  }, [activeTab]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % courses.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
  };

  if (loading)
    return (
      <motion.div
        className="flex items-center justify-center gap-2 text-gray-400 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
        <span>جارٍ تحميل الكورسات...</span>
      </motion.div>
    );

  return (
    <motion.section
      id="courses"
      className="section-padding bg-primary"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container-custom relative">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-arabic-bold text-white mb-8 inline-block border-b-4 border-primary pb-6">
            الكورسات
          </h2>

          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab("free")}
              className={`px-8 py-3 text-2xl rounded-2xl font-arabic-medium transition-all duration-300 ${activeTab === "free"
                  ? "bg-primary-dark text-white shadow-medium"
                  : "bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-primary/20"
                }`}
            >
              مجاني
            </button>

            <button
              onClick={() => setActiveTab("paid")}
              className={`px-8 py-3 text-2xl rounded-2xl font-arabic-medium transition-all duration-300 ${activeTab === "paid"
                  ? "bg-primary-dark text-white shadow-medium"
                  : "bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-primary/20"
                }`}
            >
              مدفوع
            </button>
          </div>
        </motion.div>

        {/* حالة لا توجد كورسات */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <AlertCircle className="w-16 h-16 text-primary-dark mb-6" />
            <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
              لا توجد كورسات متاحة حاليًا
            </h3>
            <p className="text-gray-300 text-lg text-center max-w-md">
              نحن نعمل على إضافة المزيد من الكورسات قريبًا، تابعنا لتكون أول
              من يستفيد من المحتوى الجديد!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Courses Grid (Desktop) */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {courses.map((course) => (
                <motion.div
                  key={course.course_code}
                  className="card-dark bg-primary-dark group hover:scale-105 transition-all duration-300 w-80 mx-auto"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative overflow-hidden rounded-lg mb-6">
                    <img
                      src={course.course_image}
                      alt={course.course_title}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-primary rounded-full p-2">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-12 text-center">
                    <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                      {course.course_title}
                    </h3>

                    <Button
                      onClick={() =>
                        navigate(`/course/${course.course_code}`, {
                          state: { course },
                        })
                      }
                      className="btn-primary text-center block w-48 mx-auto rounded-xl"
                    >
                      {activeTab === "free" ? "شاهد الآن" : "شراء الكورس"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden mb-12">
              <AnimatePresence mode="wait">
                {courses.length > 0 && (
                  <motion.div
                    key={courses[currentIndex].course_code + activeTab}
                    className="card-dark bg-primary-dark w-full group"
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative overflow-hidden rounded-lg mb-6">
                      <img
                        src={courses[currentIndex].course_image}
                        alt={courses[currentIndex].course_title}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                      <div className="absolute top-4 left-4 bg-primary rounded-full p-2">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-12 text-center">
                      <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                        {courses[currentIndex].course_title}
                      </h3>

                      <Button
                        onClick={() =>
                          navigate(`/my-courses/course/${courses[currentIndex].course_code}`, {
                            state: { course: courses[currentIndex] },
                          })
                        }
                        className="btn-primary rounded-xl text-center block w-48 mx-auto"
                      >
                        {activeTab === "free" ? "شاهد الآن" : "شراء الكورس"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center gap-4 mt-6">
                <button onClick={handleNext} className="btn-gradient bg-primary-dark">
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button onClick={handlePrev} className="btn-gradient bg-primary-dark">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default Courses;
