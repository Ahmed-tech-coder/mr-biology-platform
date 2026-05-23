import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useAdminAuth } from "@/context/AdminAuthContext";

const BASE_API_IMAGES = import.meta.env.VITE_BASE_IMAGES;

const LectureView = () => {
  const { course_code, lecture_code } = useParams();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const [activeTab, setActiveTab] = useState("video");
  const [lectures, setLectures] = useState<any[]>([]);
  const [lecture, setLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState("master");

  const videoNode = useRef(null);
  const playerRef = useRef<any>(null);

  const adminToken = admin?.admin_token;

  // 📌 جلب المحاضرات
  useEffect(() => {
    if (!course_code || !lecture_code || !adminToken) return;

    const fetchLectures = async () => {
      try {
        const res = await fetch(
          `https://apis.mr-biology.com/admin/lectures/getLectures?admin_token=${adminToken}&course_code=${course_code}`
        );
        const data = await res.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("⚠️ يرجي تسجيل الدخول مرة أخرى");
          return;
        }

        if (data.status === "success") {
          setLectures(data.lectures || []);
          const found = data.lectures.find(
            (lec: any) => lec.lecture_code === lecture_code
          );
          setLecture(found);
        }
      } catch (err) {
        console.error("فشل تحميل المحاضرات", err);
        toast.error("❌ خطأ في الاتصال بالسيرفر");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [course_code, lecture_code, adminToken, logout]);

  // 📌 تهيئة الفيديو مع اختيار الجودة
  useEffect(() => {
    if (!lecture?.video || !videoNode.current) return;
    const currentSrc = lecture.video[selectedQuality];

    if (!playerRef.current) {
      const player = videojs(videoNode.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        responsive: true,
        fluid: true,
      });

      playerRef.current = player;

      player.src({
        src: currentSrc,
        type: "application/x-mpegURL",
      });
      return;
    }

    playerRef.current.src({
      src: currentSrc,
      type: "application/x-mpegURL",
    });
  }, [lecture, selectedQuality]);

  if (loading) return <div className="text-white p-10">جارِ تحميل المحاضرة...</div>;
  if (!lecture) return <div className="text-white p-10">لم يتم العثور على المحاضرة.</div>;

  const currentIndex = lectures.findIndex((l) => l.lecture_code === lecture.lecture_code);
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;

  const handleNavigate = (lec: any) => {
    if (!lec) return;
    navigate(`/admin/courses/${course_code}/lectures/${lec.lecture_code}/lecture-view`);
  };

  return (
    <div className="p-6 pt-24 md:p-10">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {lecture.lecture_title}
        </h1>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-primary-card border-b border-primary/20 w-full flex justify-center gap-4 rounded-lg p-6">
          <TabsTrigger
            value="attachments"
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-white/70 md:px-16 py-2 rounded-lg transition-all md:text-xl"
          >
            📂 المرفقات
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-white/70 md:px-16 py-2 rounded-lg transition-all md:text-xl"
          >
            🎥 الفيديو
          </TabsTrigger>
        </TabsList>

        {/* Video */}
        <div className={`mt-6 ${activeTab === "video" ? "block" : "hidden"}`}>
          <div dir="rtl" className="bg-primary-card rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl mx-auto p-4">
            {/* اختيار الجودة */}
            <div className="mb-4">
              <label className="text-white font-bold mr-2">اختر الجودة:</label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="p-2 rounded bg-black/40 text-white"
              >
                {Object.keys(lecture.video || {}).map((q) => (
                  <option key={q} value={q}>
                    {q === "master" ? "تلقائي (Auto)" : q}
                  </option>
                ))}
              </select>
            </div>

            {/* VideoJS Player */}
            <div data-vjs-player>
              <video
                ref={videoNode}
                className="video-js vjs-default-skin vjs-big-play-centered"
                playsInline
                style={{ borderRadius: "16px" }}
              ></video>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row justify-between gap-4 w-full max-w-4xl mx-auto mt-6">
            <Button
              onClick={() => handleNavigate(prevLecture)}
              disabled={!prevLecture}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:opacity-90"
            >
              <ChevronRight className="h-4 w-4 ml-2" />
              المحاضرة السابقة
            </Button>
            <Button
              onClick={() => handleNavigate(nextLecture)}
              disabled={!nextLecture}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:opacity-90"
            >
              المحاضرة التالية
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>

        {/* Attachments */}
        <TabsContent value="attachments" className="mt-6 space-y-6">
          {lecture.attachment && (
            <motion.div className="bg-primary-card rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">ملف المحاضرة</h3>
                  <p className="text-white/60 text-sm">تحميل الملف</p>
                </div>
              </div>
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                <a
                  href={`${BASE_API_IMAGES}Files/${lecture.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  تحميل
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LectureView;
