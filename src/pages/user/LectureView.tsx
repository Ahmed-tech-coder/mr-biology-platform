import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Download, RotateCcw, RotateCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useAuth from "@/context/AuthContext";
import Hls from "hls.js";

const LectureView = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [lecture, setLecture] = useState<any>(null);
  const [lectures, setLectures] = useState(location.state?.lectures || []);
  const [view, setView] = useState("lecture");
  const [selectedQuality, setSelectedQuality] = useState("master");
  const [loading, setLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // ✅ جلب قائمة المحاضرات (لو دخل من لينك مباشر)
  useEffect(() => {
    if (!lectures.length && user?.student_token && courseId) {
      setLecturesLoading(true);
      fetch(
        `https://apis.mr-biology.com/student/subscriptions/getCourseLectures?student_token=${user.student_token}&course_code=${courseId}`
      )
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.status === "success") {
            setLectures(data.lectures || []);
          } else {
            toast.error(data.message || "فشل في تحميل قائمة المحاضرات");
          }
        })
        .catch((err) => console.error("Error fetching lectures:", err))
        .finally(() => setLecturesLoading(false));
    }
  }, [lectures.length, courseId, user]);

  // ✅ جلب تفاصيل المحاضرة
  useEffect(() => {
    if (!user?.student_token || !lectureId) return;

    setLoading(true);
    fetch(
      `https://apis.mr-biology.com/student/subscriptions/getLectureDetails?student_token=${user.student_token}&lecture_code=${lectureId}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setLecture({
            ...data.lecture,
            video: data.video,
            attachments: data.attachments,
          });
        } else if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخرى");
        } else {
          toast.error(data.message || "حدث خطأ أثناء تحميل المحاضرة");
        }
      })
      .catch((err) => {
        console.error("Error fetching lecture:", err);
        toast.error("حدث خطأ أثناء تحميل المحاضرة");
      })
      .finally(() => setLoading(false));
  }, [user, lectureId, logout]);

  // ✅ تشغيل الفيديو مع HLS
  useEffect(() => {
    if (!lecture?.video || !videoRef.current || view !== "lecture") return;

    const video = videoRef.current;
    const selectedSrc =
      selectedQuality === "master"
        ? lecture.video.master
        : lecture.video[selectedQuality];

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(selectedSrc);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = selectedSrc;
    }
  }, [lecture, selectedQuality, view]);

  // ✅ لودينج للمحاضرة
  if (loading) return <p className="text-white text-center p-10">جاري تحميل بيانات المحاضرة...</p>;
  if (!lecture) return <p className="text-white text-center p-10">لم يتم العثور على المحاضرة.</p>;

  // ✅ حساب المحاضرة الحالية + السابق / التالي
  const currentIndex =
    lectures.length > 0
      ? lectures.findIndex((l) => String(l.lecture_code) === String(lectureId))
      : -1;

  const prevLecture =
    currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex >= 0 && currentIndex < lectures.length - 1
      ? lectures[currentIndex + 1]
      : null;

  // ✅ التحكم 10 ثواني
  const handleForward10 = () => {
    if (videoRef.current)
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        videoRef.current.duration
      );
  };
  const handleBackward10 = () => {
    if (videoRef.current)
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  };

  return (
    <div className="bg-primary-dark p-6 pt-24 md:p-10 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
        {lecture.lecture_title}
      </h1>

      {/* أزرار التنقل بين الفيديو والمرفقات */}
      <div className="flex gap-4 justify-center mb-8">
        {["lecture", "attachments"].map((v) => (
          <motion.button
            key={v}
            onClick={() => setView(v)}
            whileHover={{ scale: 1.05 }}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${view === v
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                : "bg-white/10 text-white"
              }`}
          >
            {v === "lecture" ? "🎥 الفيديو" : "📂 المرفقات"}
          </motion.button>
        ))}
      </div>

      {view === "lecture" && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
          <label className="text-white font-semibold text-lg">
            اختر الجودة:
          </label>

          <div className="relative w-48">
            {/* السيلكت نفسه */}
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="appearance-none w-full bg-white/10 text-white font-medium py-2 pl-4 pr-10 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-white/50"
            >
              {Object.keys(lecture.video || {}).map((q) => (
                <option key={q} value={q} className="text-black">
                  {q === "master" ? "تلقائي (Auto)" : q}
                </option>
              ))}
            </select>

            {/* السهم الصغير */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* الفيديو */}
      {view === "lecture" && (
        <>
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black">
            <video ref={videoRef} className="w-full h-full" controls playsInline />
          </div>

          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={handleBackward10}
              className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
            >
              <RotateCcw />
            </button>
            <button
              onClick={handleForward10}
              className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
            >
              <RotateCw />
            </button>
          </div>
        </>
      )}

      {/* المرفقات */}
      {view === "attachments" && (
        <div className="max-w-4xl mx-auto mt-6">
          {lecture.attachments?.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lecture.attachments.map((att, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  className="flex justify-between items-center bg-primary-card p-4 rounded-xl border border-primary/20 hover:border-primary/40 shadow-md"
                >
                  <span className="text-white font-medium">{att.name}</span>
                  <a
                    href={att.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white bg-gradient-to-r from-primary to-secondary px-4 py-2 rounded-lg shadow-md hover:from-secondary hover:to-primary"
                  >
                    تحميل <Download className="w-4 h-4" />
                  </a>
                </motion.li>
              ))}
            </ul>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <AlertCircle className="w-16 h-16 text-primary mb-6" />
              <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                لا توجد مرفقات متاحة
              </h3>
            </motion.div>
          )}
        </div>
      )}

      {/* أزرار المحاضرة السابقة / التالية */}
      {view === "lecture" && lectures.length > 0 && (
        <div className="flex justify-between max-w-4xl mx-auto mt-8 gap-4">
          <motion.button
            onClick={() =>
              prevLecture &&
              navigate(`/my-courses/course/${courseId}/lecture/${prevLecture.lecture_code}`, {
                state: { lectures },
              })
            }
            disabled={!prevLecture}
            whileHover={{ scale: prevLecture ? 1.05 : 1 }}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${prevLecture
                ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                : "bg-white/10 text-white cursor-not-allowed"
              }`}
          >
            ⬅ المحاضرة السابقة
          </motion.button>

          <motion.button
            onClick={() =>
              nextLecture &&
              navigate(`/my-courses/course/${courseId}/lecture/${nextLecture.lecture_code}`, {
                state: { lectures },
              })
            }
            disabled={!nextLecture}
            whileHover={{ scale: nextLecture ? 1.05 : 1 }}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${nextLecture
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                : "bg-white/10 text-white cursor-not-allowed"
              }`}
          >
            المحاضرة التالية ➡
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LectureView;
