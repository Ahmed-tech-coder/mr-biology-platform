import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Play, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAuth from "@/context/AuthContext";
import { toast } from "sonner";

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_IMAGES = import.meta.env.VITE_BASE_IMAGES;

const MyCourses = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const studentToken = user?.student_token;

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [lecturesData, setLecturesData] = useState<any>({});
  const [lectureCodes, setLectureCodes] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"course" | "lecture">("course");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch lectures for a course
  const fetchLecturesForCourse = useCallback(
    async (courseCode: string) => {
      if (!studentToken) return;
      try {
        const res = await fetch(
          `${BASE_API}/student/subscriptions/getCourseLectures?student_token=${studentToken}&course_code=${courseCode}`
        );
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.lectures)) {
          setLecturesData((prev) => ({ ...prev, [courseCode]: data.lectures }));
          data.lectures.forEach((lecture: any) => {
            setLectureCodes((prev) => ({
              ...prev,
              [lecture.lecture_code]: lecture.lecture_code,
            }));
          });
        }
      } catch (err) {
        console.error(`Error fetching lectures for ${courseCode}:`, err);
      }
    },
    [studentToken]
  );

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!studentToken) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_API}/student/subscriptions/getSubscriptions?student_token=${studentToken}`
      );
      const data = await res.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
        return;
      }

      if (data.status === "success" && Array.isArray(data.subscriptions)) {
        setSubscriptions(data.subscriptions);
        setErrorMessage("");

        // Fetch lectures for courses
        data.subscriptions
          .filter((c: any) => c.type === "course")
          .forEach((c: any) => fetchLecturesForCourse(c.code));
      } else {
        setErrorMessage("حدث خطأ أثناء تحميل الاشتراكات.");
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      toast.error("حدث خطأ أثناء تحميل الاشتراكات.");
    } finally {
      setLoading(false);
    }
  }, [studentToken, fetchLecturesForCourse, logout]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Filter + Search
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((item) => item.type === activeTab)
      .filter((item) =>
        search ? item.title?.toLowerCase().includes(search.toLowerCase()) : true
      );
  }, [subscriptions, activeTab, search]);

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / pageSize);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Navigate
  const handleNavigate = useCallback(
    (item: any) => {
      if (item.type === "course") {
        navigate(`course/${item.code}/lectures`);
      } else if (item.type === "lecture") {
        const lecture_code = lectureCodes[item.code] || item.code;
        navigate(
          `/student-page/my-courses/course-content/course-video/${lecture_code}`,
          { state: { lectures: lecturesData[item.course_code] || [] } }
        );
      }
    },
    [navigate, lectureCodes, lecturesData]
  );

  return (
    <div className="p-8 lg:p-16 bg-primary-dark">
      {/* Title + Search */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center md:justify-between mb-12">
        <h1 className="text-3xl font-bold text-white">كورساتي</h1>

      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        <Button
          onClick={() => {
            setActiveTab("course");
            setCurrentPage(1);
          }}
          className={activeTab === "course" ? "bg-primary text-white font-bold rounded-xl" : "bg-white text-primary-dark font-bold"}
        >
          الكورسات
        </Button>
        <Button
          onClick={() => {
            setActiveTab("lecture");
            setCurrentPage(1);
          }}
          className={activeTab === "lecture" ? "bg-primary text-white font-bold rounded-xl" : "bg-white text-primary-dark font-bold"}
        >
          المحاضرات
        </Button>
      </div>

      {/* Courses / Lectures Grid */}
      {loading ? (
        <p className="text-center text-white">جاري التحميل...</p>
      ) : paginatedSubscriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <AlertCircle className="w-16 h-16 text-primary mb-6" />
          <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
            لا توجد بيانات متاحة
          </h3>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {paginatedSubscriptions.map((item, i) => (
            <motion.div
              key={item.code}
              className="card-dark bg-primary-dark group hover:scale-105 transition-all duration-300 md:w-96"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}

            >
              <div className="relative overflow-hidden rounded-lg mb-6">
                <img
                  src={item.image || `${BASE_API_IMAGES}/Images/default.png`}
                  alt={item.title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-primary rounded-full p-2">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-6 text-center p-4">
                <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                  {item.title}
                </h3>
                <Button onClick={() => handleNavigate(item)} className="flex items-center justify-center gap-3 rounded-xl btn-primary w-48 mx-auto font-bold lg:text-xl">
                  مشاهدة <Play />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
    </div>
  );
};

export default MyCourses;
