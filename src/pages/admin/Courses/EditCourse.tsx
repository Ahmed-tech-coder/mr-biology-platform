import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const EditCourse = () => {
    const navigate = useNavigate();
    const { course_code } = useParams();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState({
        title: "",
        description: "",
        price: "",
        status: "active",
        type: "free",
        image: null as File | null,
    });

    // 🔹 جلب بيانات الكورس
    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const res = await fetch(
                    `https://apis.mr-biology.com/admin/courses/getCourseDetails?admin_token=${adminToken}&course_code=${course_code}`
                );
                const data = await res.json();

                if (data.reason === "unauthorized") {
                    logout();
                    toast.info("يرجي تسجيل الدخول مرة أخري");
                    return;
                }

                if (data.status === "success") {
                    const c = data.course[0];
                    setCourse({
                        title: c.course_title || "",
                        description: c.course_description || "",
                        price: c.course_price || "",
                        status: c.course_status || "active",
                        type: c.course_type || "free",
                        image: null,
                    });
                } else {
                    toast.error("لم يتم العثور على الكورس");
                }
            } catch (err) {
                console.error("Error fetching course details:", err);
                toast.error("حدث خطأ أثناء جلب بيانات الكورس");
            } finally {
                setLoading(false);
            }
        };

        if (adminToken && course_code) fetchCourseDetails();
    }, [adminToken, course_code, logout]);

    // 🔹 handle change inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCourse((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setCourse((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    };

    // 🔹 update course
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("admin_token", adminToken || "");
        formData.append("course_code", course_code || "");
        formData.append("course_title", course.title);
        formData.append("course_description", course.description);
        formData.append("course_price", course.type === "paid" ? course.price : "0");
        formData.append("course_status", course.status);
        formData.append("course_type", course.type);
        if (course.image) {
            formData.append("course_image", course.image);
        }

        try {
            const res = await fetch(
                "https://apis.mr-biology.com/admin/courses/updateCourse",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة أخري");
                return;
            }

            if (data.status === "success") {
                toast.success("تم تعديل الكورس بنجاح!");
                setTimeout(() => navigate(-1), 1500);
            } else {
                toast.error(data.message || "حدث خطأ أثناء تعديل الكورس");
            }
        } catch (err) {
            console.error("Error updating course:", err);
            toast.error("حدث خطأ أثناء تعديل الكورس");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10 text-lg font-arabic-medium">
                جاري تحميل البيانات...
            </div>
        );
    }

    return (
        <div className="container-custom section-padding mt-16 lg:mt-0">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card-dark max-w-4xl mx-auto"
            >
                <h1 className="text-2xl font-arabic-bold text-primary mb-6 text-center">
                    تعديل الكورس
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* الاسم */}
                    <div>
                        <label className="block mb-2 font-arabic-medium">اسم الكورس</label>
                        <input
                            type="text"
                            name="title"
                            value={course.title}
                            onChange={handleChange}
                            className="input-field w-full"
                            required
                        />
                    </div>

                    {/* الوصف */}
                    <div>
                        <label className="block mb-2 font-arabic-medium">الوصف</label>
                        <textarea
                            name="description"
                            value={course.description}
                            onChange={handleChange}
                            className="input-field w-full h-32 resize-none"
                            required
                        />
                    </div>

                    {/* النوع + الحالة */}
                    <div className="flex justify-around flex-col lg:flex-row gap-6">
                        {/* الحالة */}
                        <div>
                            <label className="block mb-2 font-arabic-medium">الحالة</label>
                            <div className="flex gap-6">
                                {["active", "unactive"].map((s) => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={s}
                                            checked={course.status === s}
                                            onChange={handleChange}
                                            className="peer hidden"
                                        />
                                        <span className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center 
                                            peer-checked:border-primary peer-checked:bg-primary transition">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></span>
                                        </span>
                                        <span className="peer-checked:text-primary-light font-bold">
                                            {s === "active" ? "مفعل" : "غير مفعل"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* النوع */}
                        <div>
                            <label className="block mb-2 font-arabic-medium">النوع</label>
                            <div className="flex gap-6">
                                {["free", "paid"].map((t) => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={t}
                                            checked={course.type === t}
                                            onChange={handleChange}
                                            className="peer hidden"
                                        />
                                        <span className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center 
                                            peer-checked:border-primary peer-checked:bg-primary transition">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></span>
                                        </span>
                                        <span className="peer-checked:text-primary-light font-bold">
                                            {t === "free" ? "مجاني" : "مدفوع"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* السعر لو مدفوع */}
                    {course.type === "paid" && (
                        <div>
                            <label className="block mb-2 font-arabic-medium">السعر</label>
                            <input
                                type="text"
                                name="price"
                                value={course.price}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                            />
                        </div>
                    )}

                    {/* الصورة */}
                    <div>
                        <label className="block mb-2 font-arabic-medium">صورة الكورس</label>
                        <input
                            type="file"
                            accept="image/*"
                            name="image"
                            onChange={handleFileChange}
                            className="hidden"
                            id="imageUpload"
                        />
                        <label
                            htmlFor="imageUpload"
                            className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20"
                        >
                            <Upload className="w-10 h-10 text-gray-300 mb-2" />
                            <span className="text-gray-200">اسحب الصورة أو اضغط للرفع</span>
                        </label>
                        {course.image && (
                            <img
                                src={URL.createObjectURL(course.image)}
                                alt="Course"
                                className="mt-4 w-32 h-32 rounded-lg object-cover"
                            />
                        )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex justify-center gap-4 pt-4">
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <Save className="w-5 h-5" /> حفظ التعديلات
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-outline flex items-center gap-2"
                        >
                            <XCircle className="w-5 h-5" /> إلغاء
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditCourse;
