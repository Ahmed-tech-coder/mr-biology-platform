import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Trash2,
    Plus,
    Edit,
    BookOpen,
    Users,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface Course {
    course_code: string;
    course_title: string;
    course_description: string;
    course_status: "active" | "unactive";
    course_type: "free" | "paid";
    course_price: number;
    course_image: string;
    subscriptions_count: number;
}

const Courses = () => {
    const navigate = useNavigate();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 6;

    // Filter
    const [filter, setFilter] = useState<"all" | "active" | "unactive">("all");

    useEffect(() => {
        const fetchCourses = async () => {
            if (!adminToken) return;

            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("admin_token", adminToken);
                params.append("course_status", filter);

                const res = await fetch(
                    `https://apis.mr-biology.com/admin/courses/getCourses?${params.toString()}`
                );
                const data = await res.json();

                if (data.reason === "unauthorized") {
                    logout();
                    toast.info("يرجي تسجيل الدخول مرة أخرى");
                    return;
                }

                if (data.status === "success") {
                    setCourses(data.courses);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error(err);
                toast.error("حدث خطأ أثناء تحميل الكورسات");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [filter, adminToken, logout]);

    // حذف كورس
    const handleDelete = async (courseCode: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الكورس؟")) return;

        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken!);
            formData.append("course_code", courseCode);

            const res = await fetch(
                "https://apis.mr-biology.com/admin/courses/deleteCourse",
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
                toast.success("تم حذف الكورس بنجاح");
                setCourses((prev) =>
                    prev.filter((course) => course.course_code !== courseCode)
                );
            } else {
                toast.error("فشل حذف الكورس");
            }
        } catch (err) {
            console.error(err);
            toast.error("خطأ في الاتصال بالسيرفر");
        }
    };

    // Pagination logic
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(courses.length / coursesPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <p className="text-white">جاري التحميل...</p>;

    return (
        <div className="p-8 lg:p-16">
            {/* Title + Add Course Button */}
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center md:justify-between mb-12">
                <h1 className="text-3xl font-bold text-white">الكورسات</h1>
                <Link to="/admin/courses/add-course">
                    <Button className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-2">
                        <Plus className="w-4 h-4" />
                        إضافة كورس
                    </Button>
                </Link>
            </div>

            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mb-10">
                {["all", "active", "unactive"].map((status) => (
                    <Button
                        key={status}
                        onClick={() => {
                            setFilter(status as "all" | "active" | "unactive");
                            setCurrentPage(1);
                        }}
                        className={`rounded-[10px] font-bold ${filter === status
                            ? "bg-primary text-white hover:text-white"
                            : "bg-white text-primary-dark hover:text-white"
                            }`}
                    >
                        {status === "all"
                            ? "الكل"
                            : status === "active"
                                ? "المفعلة"
                                : "الغير مفعلة"}
                    </Button>
                ))}
            </div>

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
                        نحن نعمل على إضافة المزيد من الكورسات قريبًا، تابعنا لتكون أول من
                        يستفيد من المحتوى الجديد!
                    </p>
                </motion.div>
            ) : (
                <>
                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 w-full">
                        {currentCourses.map((course, i) => (
                            <motion.div
                                key={course.course_code}
                                className="card-dark bg-primary-dark group hover:scale-105 transition-all duration-300 w-full md:w-96"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
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

                                <div className="space-y-4 text-center p-4">
                                    <h3 className="text-xl font-arabic-semibold text-white group-hover:text-primary-light transition-colors">
                                        {course.course_title}
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                        {course.course_description.length > 100
                                            ? course.course_description.slice(0, 100) + "..."
                                            : course.course_description}
                                    </p>

                                    <div className="flex justify-center gap-2 items-center flex-wrap">
                                        {/* Type Badge */}
                                        <span
                                            className={`px-4 py-1 rounded-full font-semibold shadow-md ${course.course_type === "free"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                                }`}
                                        >
                                            {course.course_type === "free"
                                                ? "مجاني"
                                                : `${course.course_price} جنيه`}
                                        </span>

                                        {/* Status Badge */}
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-bold ${course.course_status === "active"
                                                ? "bg-green-600 text-white"
                                                : "bg-red-600 text-white"
                                                }`}
                                        >
                                            {course.course_status === "active"
                                                ? "مفعل"
                                                : "غير مفعل"}
                                        </span>

                                        {/* Students Count */}
                                        <button
                                            onClick={() =>
                                                navigate(`/admin/courses/${course.course_code}/subscriptions-count`, {
                                                    state: { courseName: course.course_title },
                                                })
                                            }

                                            className="flex items-center gap-1 text-primary-light text-sm border-b-2">
                                            <Users className="w-4 h-4" />
                                            {course.subscriptions_count} طالب
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Button
                                            onClick={() =>
                                                navigate(
                                                    `/admin/courses/${course.course_code}/lectures`,
                                                    {
                                                        state: { course },
                                                    }
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>المحاضرات</span>
                                        </Button>

                                        <Button
                                            onClick={() =>
                                                navigate(
                                                    `/admin/courses/${course.course_code}/edit-course`,
                                                    {
                                                        state: { course },
                                                    }
                                                )
                                            }
                                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-3 py-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>تعديل</span>
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 col-span-2"
                                            onClick={() => handleDelete(course.course_code)}
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

export default Courses;
