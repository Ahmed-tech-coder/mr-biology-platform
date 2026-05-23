import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const PAGE_SIZE = 6;
const BASE_API_IMAGES = import.meta.env.VITE_BASE_IMAGES;

type Lecture = {
  lecture_code: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image: string;
  is_viewed: boolean;
};

const CourseLectures = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const student_token = JSON.parse(localStorage.getItem("student"))?.student_token;

  const fetchLectures = async (pageNum: number) => {
    if (!student_token || !courseId) {
      setErrorMessage("لم يتم العثور على بيانات الطالب أو الكورس.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `https://apis.mr-biology.com/student/subscriptions/getCourseLectures?student_token=${student_token}&course_code=${courseId}`
      );
      const data = await res.json();

      if (data.status === "success") {
        const allLectures: Lecture[] = data.lectures;
        setTotalPages(Math.ceil(allLectures.length / PAGE_SIZE));
        setLectures(allLectures.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE));
      } else {
        setErrorMessage(data.message || "حدث خطأ غير متوقع.");
        setLectures([]);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("حدث خطأ أثناء تحميل المحاضرات. حاول مرة أخرى لاحقًا.");
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures(page);
  }, [student_token, courseId, page]);

  const handleWatchVideo = (lecture_code: string) => {
    navigate(`/my-courses/course/${courseId}/lecture/${lecture_code}`);
  };

  if (loading) return <p className="text-white text-center">جاري تحميل المحاضرات...</p>;

  return (
    <div className="bg-primary-dark p-8 lg:p-16">
      {/* Title */}
      <div className="mb-12 text-center lg:text-right">
        <h1 className="text-3xl font-bold text-white mb-2">
          كورس - {lectures[0]?.lecture_title || ""}
        </h1>
      </div>

      {/* Lectures Grid */}
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="w-16 h-16 text-primary mb-6" />
          <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">{errorMessage}</h3>
        </div>
      ) : lectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="w-16 h-16 text-primary mb-6" />
          <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
            لا توجد محاضرات متاحة حاليًا
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {lectures.map((lecture, i) => (
            <motion.div
              key={lecture.lecture_code}
              className="card-dark bg-primary-dark group hover:scale-105 transition-all duration-300 md:w-96 "
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}
              
            >
              <div className="relative overflow-hidden rounded-lg mb-6">
                <img
                  src={lecture.lecture_image || `${BASE_API_IMAGES}/Images/default.png`}
                  alt={lecture.lecture_title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-primary rounded-full p-2">
                  {lecture.is_viewed ? <Play className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-white/70" />}
                </div>
              </div>

              <div className="space-y-6 text-center p-4">
                <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                  {lecture.lecture_title}
                </h3>
                {/* <p className="text-white/70 text-sm">{lecture.lecture_description}</p> */}
                <Button onClick={() => handleWatchVideo(lecture.lecture_code)} className="flex items-center justify-center gap-3 rounded-xl btn-primary w-48 mx-auto font-bold lg:text-xl">
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
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-white text-primary-dark border-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`w-10 h-10 rounded-full ${page === i + 1
              ? "bg-primary text-white"
              : "bg-white text-primary-dark border-0"
              }`}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
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

export default CourseLectures;
