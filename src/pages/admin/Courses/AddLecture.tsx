import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, XCircle, Folder } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

type DriveFolder = { id: string; name: string };

const QUALITIES = ["240p", "360p", "480p", "720p", "1080p"];

const AddLecture = () => {
    const navigate = useNavigate();
    const { course_code } = useParams();
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const [lecture, setLecture] = useState<{
        lectureTitle: string;
        lectureDescription: string;
        status: "active" | "unactive";
        price: string;
        driveFolderId: string;
        qualities: string[];
    }>({
        lectureTitle: "",
        lectureDescription: "",
        status: "active",
        price: "",
        driveFolderId: "",
        qualities: [],
    });

    // Load folders from API
    useEffect(() => {
        const fetchFolders = async () => {
            if (!adminToken) return;
            try {
                setLoadingFolders(true);
                const res = await fetch(
                    `https://apis.mr-biology.com/admin/lectures/getDriveFolders?admin_token=${adminToken}`
                );
                const data = await res.json();
                if (data.status === "success") {
                    setFolders(data.folders);
                } else {
                    toast.error("فشل في تحميل المجلدات");
                }
            } catch (err) {
                toast.error("حدث خطأ أثناء تحميل المجلدات");
            } finally {
                setLoadingFolders(false);
            }
        };
        fetchFolders();
    }, [adminToken]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setLecture((prev) => ({ ...prev, [name]: value }));
    };

    const toggleQuality = (q: string) => {
        setLecture((prev) => {
            const exists = prev.qualities.includes(q);
            return {
                ...prev,
                qualities: exists ? prev.qualities.filter((x) => x !== q) : [...prev.qualities, q],
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lecture.lectureTitle.trim()) return toast.error("أدخل عنوان المحاضرة");
        if (!lecture.price) return toast.error("أدخل سعر المحاضرة");
        if (!lecture.driveFolderId) return toast.error("اختر مجلد من Google Drive");
        if (!lecture.qualities.length) return toast.error("اختر جودة واحدة على الأقل");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken);
            formData.append("course_code", course_code || "");
            formData.append("lecture_title", lecture.lectureTitle);
            formData.append("lecture_price", lecture.price);
            formData.append("lecture_description", lecture.lectureDescription);
            formData.append("drive_id", lecture.driveFolderId);
            formData.append("lecture_status", lecture.status);
            formData.append("qualities", JSON.stringify(lecture.qualities));

            attachments.forEach((file) => formData.append("lecture_attachments[]", file));

            const res = await fetch(
                "https://apis.mr-biology.com/admin/lectures/addLecture",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();
            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة أخري");
            } else if (data.status === "success") {
                toast.success("تمت إضافة المحاضرة بنجاح");
                setTimeout(() => navigate(-1), 1500);
            } else {
                toast.error("حدث خطأ أثناء الإضافة");
            }
        } catch (err) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom section-padding mt-16 lg:mt-0">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl max-w-5xl mx-auto p-8"
            >
                <h1 className="text-3xl font-arabic-bold text-primary mb-10 text-center">
                    إضافة محاضرة جديدة
                </h1>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* البيانات الأساسية */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                                البيانات الأساسية
                            </h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="lectureTitle"
                                    value={lecture.lectureTitle}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="أدخل اسم المحاضرة"
                                />

                                <input
                                    type="number"
                                    name="price"
                                    value={lecture.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="input-field w-full"
                                />
                            </div>
                        </div>

                        {/* Google Drive */}
                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">Google Drive</h2>
                            <select
                                value={lecture.driveFolderId}
                                onChange={(e) =>
                                    setLecture((prev) => ({ ...prev, driveFolderId: e.target.value }))
                                }
                                className="input-field w-full"
                            >
                                <option value="">-- اختر من القائمة --</option>
                                {loadingFolders ? (
                                    <option>جاري التحميل...</option>
                                ) : (
                                    folders.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* الوصف */}
                    <div className="card-dark p-6 rounded-xl shadow-md">
                        <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">وصف المحاضرة</h2>
                        <textarea
                            name="lectureDescription"
                            value={lecture.lectureDescription}
                            onChange={handleChange}
                            className="input-field w-full h-32 resize-none"
                            placeholder="أدخل وصفًا للمحاضرة"
                        />
                    </div>

                    {/* الجودة والحالة */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">جودة الفيديو</h2>
                            <div className="flex flex-wrap gap-4">
                                {QUALITIES.map((q) => (
                                    <label
                                        key={q}
                                        className="inline-flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 rounded-lg"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={lecture.qualities.includes(q)}
                                            onChange={() => toggleQuality(q)}
                                            className="accent-primary"
                                        />
                                        <span>{q}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">الحالة</h2>
                            <div className="flex gap-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={lecture.status === "active"}
                                        onChange={handleChange}
                                        className="accent-green-600 w-5 h-5"
                                    />
                                    <span className="text-xl font-bold text-green-600">مفعل</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="unactive"
                                        checked={lecture.status === "unactive"}
                                        onChange={handleChange}
                                        className="accent-red-600 w-5 h-5"
                                    />
                                    <span className="text-xl font-bold text-red-600">غير مفعل</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* المرفقات */}
                    <div className="card-dark p-6 rounded-xl shadow-md w-full">
                        <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">ملفات مرفقة</h2>

                        <label
                            htmlFor="lecture_attachments"
                            className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20"
                        >
                            <Folder className="w-10 h-10 text-gray-300 mb-2" />
                            <span className="text-primary-dark">اسحب الملفات أو اضغط للرفع</span>
                            <input
                                id="lecture_attachments"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={(e) =>
                                    setAttachments(e.target.files ? Array.from(e.target.files) : [])
                                }
                                className="hidden"
                            />
                        </label>

                        {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {attachments.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg"
                                    >
                                        <span className="text-sm text-gray-200">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAttachments((prev) =>
                                                    prev.filter((_, i) => i !== idx)
                                                )
                                            }
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* الأزرار */}
                    <div className="flex justify-center gap-6 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 text-md px-3 py-2 lg:px-6 lg:py-3 rounded-xl"
                        >
                            {loading ? (
                                "جاري الحفظ..."
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> حفظ المحاضرة
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-outline flex items-center gap-2 text-md px-3 py-2 lg:px-6 lg:py-3 rounded-xl"
                        >
                            <XCircle className="w-5 h-5" /> إلغاء
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddLecture;
