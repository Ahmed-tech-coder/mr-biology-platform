import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Trash2,
    Plus,
    Edit,
    Eye,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface Lecture {
    lecture_code: string;
    lecture_title: string;
    lecture_description: string;
    lecture_price: number;
    lecture_status: "active" | "unactive";
    lecture_image: string;
    date_create: string;
    date_update: string;
}

const Lectures = () => {
    const navigate = useNavigate();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;
    const { course_code } = useParams();
    const location = useLocation();

    const courseName = location.state?.course?.course_title || "اسم الكورس غير متاح";

    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const lecturesPerPage = 6;

    useEffect(() => {
        const fetchLectures = async () => {
            if (!adminToken || !course_code) return;
            setLoading(true);

            try {
                const res = await fetch(
                    `https://apis.mr-biology.com/admin/lectures/getLectures?admin_token=${adminToken}&course_code=${course_code}`
                );

                const data = await res.json();

                if (data.reason === "unauthorized") {
                    logout();
                    toast.info("يرجي تسجيل الدخول مرة أخرى");
                    return;
                }

                if (data.status === "success") {
                    setLectures(data.lectures);
                } else {
                    setLectures([]);
                }
            } catch (err) {
                console.error(err);
                toast.error("حدث خطأ أثناء تحميل المحاضرات");
            } finally {
                setLoading(false);
            }
        };

        fetchLectures();
    }, [adminToken, course_code, logout]);

    // حذف محاضرة
    const handleDelete = async (lectureCode: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه المحاضرة؟")) return;

        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken!);
            formData.append("lecture_code", lectureCode);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/lectures/deleteLecture",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة أخرى");
                return;
            }

            if (data.status === "success") {
                toast.success("تم حذف المحاضرة بنجاح");
                setLectures((prev) =>
                    prev.filter((lecture) => lecture.lecture_code !== lectureCode)
                );
            } else {
                toast.error("فشل حذف المحاضرة");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        }
    };

    // Pagination logic
    const indexOfLastLecture = currentPage * lecturesPerPage;
    const indexOfFirstLecture = indexOfLastLecture - lecturesPerPage;
    const currentLectures = lectures.slice(indexOfFirstLecture, indexOfLastLecture);
    const totalPages = Math.ceil(lectures.length / lecturesPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <p className="text-white">جاري التحميل...</p>;

    return (
        <div className="p-8 lg:p-16">
            {/* Title + Add Lecture Button */}
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center md:justify-between mb-12">
                <h1 className="text-3xl font-bold text-white">
                    محاضرات الكورس - <span className="text-primary">{courseName}</span>
                </h1>
                <Button
                    onClick={() =>
                        navigate(`/admin/courses/${course_code}/add-lecture`, {
                            state: { course_code },
                        })
                    }
                    className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-2"
                >
                    <Plus className="w-4 h-4" />
                    إضافة محاضرة
                </Button>
            </div>

            {lectures.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24"
                >
                    <AlertCircle className="w-16 h-16 text-primary-dark mb-6" />
                    <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
                        لا توجد محاضرات متاحة حاليًا
                    </h3>
                </motion.div>
            ) : (
                <>
                    {/* Lectures Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 w-full">
                        {currentLectures.map((lecture, i) => (
                            <motion.div
                                key={lecture.lecture_code}
                                className="card-dark bg-primary-dark group hover:scale-105 transition-all duration-300 w-full md:w-96"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="relative overflow-hidden rounded-lg mb-6">
                                    <img
                                        src={lecture.lecture_image}
                                        alt={lecture.lecture_title}
                                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-background-darkest/60 to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-primary rounded-full p-2">
                                        <Play className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-4 text-center p-4">
                                    <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                                        {lecture.lecture_title}
                                    </h3>
                                    <p className="text-gray-300 text-sm">{lecture.lecture_description}</p>

                                    <div className="flex justify-center gap-2 items-center flex-wrap">
                                        {/* Price Badge */}
                                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-orange-500 text-white">
                                            {lecture.lecture_price} جنيه
                                        </span>

                                        {/* Status Badge */}
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-bold ${lecture.lecture_status === "active"
                                                ? "bg-green-600 text-white"
                                                : "bg-red-600 text-white"
                                                }`}
                                        >
                                            {lecture.lecture_status === "active" ? "مفعل" : "غير مفعل"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Button
                                            onClick={() =>
                                                navigate(
                                                    `/admin/courses/${course_code}/lectures/${lecture.lecture_code}/lecture-view`,
                                                    { state: { course_code, lecture_code: lecture.lecture_code } }
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>اطلاع</span>
                                        </Button>

                                        <Button
                                            onClick={() =>
                                                navigate(`/admin/courses/lectures/${course_code}/edit-lecture/${lecture.lecture_code}`, {
                                                    state: { lecture },
                                                })
                                            }
                                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-3 py-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>تعديل</span>
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 col-span-2"
                                            onClick={() => handleDelete(lecture.lecture_code)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>حذف</span>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-10 h-10 rounded-full bg-white text-primary-dark border-0"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <Button
                                    key={i + 1}
                                    className={`w-10 h-10 rounded-full ${currentPage === i + 1
                                        ? "bg-primary text-white"
                                        : "bg-white text-primary-dark border-0"
                                        }`}
                                    onClick={() => goToPage(i + 1)}
                                >
                                    {i + 1}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                className="w-10 h-10 rounded-full bg-white text-primary-dark border-0"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Lectures;
