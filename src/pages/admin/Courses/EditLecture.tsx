import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const QUALITIES = ["240p", "360p", "480p", "720p", "1080p"];

const EditLecture = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { lecture_code } = useParams();
    const { lecture } = location.state || {};
    const { admin, logout } = useAdminAuth();
    const adminToken = admin?.admin_token;

    // states
    const [lectureTitle, setLectureTitle] = useState("");
    const [lectureDescription, setLectureDescription] = useState("");
    const [lectureStatus, setLectureStatus] = useState("active");
    const [lecturePrice, setLecturePrice] = useState("");
    const [lectureAttachments, setLectureAttachments] = useState<File[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // init from state
    useEffect(() => {
        if (lecture) {
            setLectureTitle(lecture.lecture_title || "");
            setLectureDescription(lecture.lecture_description || "");
            setLectureStatus(lecture.lecture_status || "active");
            setLecturePrice(lecture.lecture_price || "");
            setSelectedFolder(lecture.drive_id || null);
            setSelectedQualities(lecture.qualities || []);
        }
    }, [lecture]);

    // fetch folders
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await fetch(
                    `https://apis.mr-biology.com/admin/lectures/getDriveFolders?admin_token=${adminToken}`
                );
                const data = await res.json();
                if (data.status === "success") {
                    setFolders(data.folders);
                } else {
                    toast.error("فشل في تحميل الفولدرات");
                }
            } catch (err) {
                toast.error("حدث خطأ أثناء تحميل الفولدرات");
            }
        };
        if (adminToken) fetchFolders();
    }, [adminToken]);

    // submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFolder) return toast.info("يرجى اختيار فولدر");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("admin_token", adminToken);
            formData.append("lecture_code", lecture_code || "");
            formData.append("lecture_title", lectureTitle);
            formData.append("lecture_price", lecturePrice);
            formData.append("lecture_description", lectureDescription);
            formData.append("drive_id", selectedFolder);
            formData.append("lecture_status", lectureStatus);
            formData.append("qualities", JSON.stringify(selectedQualities));

            lectureAttachments.forEach((file) =>
                formData.append("lecture_attachments[]", file)
            );

            const res = await fetch(
                "https://apis.mr-biology.com/admin/lectures/updateLecture",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();
            if (data.reason === "unauthorized") {
                logout();
                toast.info("يرجي تسجيل الدخول مرة اخري");
            } else if (data.status === "success") {
                toast.success("تم تحديث المحاضرة بنجاح");
                setTimeout(() => navigate(-1), 1500);
            } else {
                toast.error("حدث خطأ أثناء التحديث");
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
                    تعديل المحاضرة
                </h1>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* البيانات الأساسية */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                                البيانات الأساسية
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-arabic-medium">
                                        اسم المحاضرة
                                    </label>
                                    <input
                                        type="text"
                                        value={lectureTitle}
                                        onChange={(e) => setLectureTitle(e.target.value)}
                                        className="input-field w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-arabic-medium">
                                        سعر المحاضرة
                                    </label>
                                    <input
                                        type="number"
                                        value={lecturePrice}
                                        onChange={(e) => setLecturePrice(e.target.value)}
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Google Drive */}
                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                                Google Drive
                            </h2>
                            <select
                                value={selectedFolder || ""}
                                onChange={(e) => setSelectedFolder(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="">-- اختر من القائمة --</option>
                                {folders.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* الوصف */}
                    <div className="card-dark p-6 rounded-xl shadow-md">
                        <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                            وصف المحاضرة
                        </h2>
                        <textarea
                            value={lectureDescription}
                            onChange={(e) => setLectureDescription(e.target.value)}
                            className="input-field w-full h-32 resize-none"
                        />
                    </div>

                    {/* الجودة والحالة */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                                جودة الفيديو
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {QUALITIES.map((q) => (
                                    <label
                                        key={q}
                                        className="inline-flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 rounded-lg"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedQualities.includes(q)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedQualities([...selectedQualities, q]);
                                                } else {
                                                    setSelectedQualities(
                                                        selectedQualities.filter((x) => x !== q)
                                                    );
                                                }
                                            }}
                                            className="accent-primary"
                                        />
                                        <span>{q}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="card-dark p-6 rounded-xl shadow-md">
                            <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                                الحالة
                            </h2>
                            <div className="flex gap-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={lectureStatus === "active"}
                                        onChange={() => setLectureStatus("active")}
                                        className="accent-green-600 w-5 h-5"
                                    />
                                    <span className="text-xl font-bold text-green-600">
                                        مفعل
                                    </span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={lectureStatus === "unactive"}
                                        onChange={() => setLectureStatus("unactive")}
                                        className="accent-red-600 w-5 h-5"
                                    />
                                    <span className="text-xl font-bold text-red-600">
                                        غير مفعل
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* المرفقات */}
                    <div className="card-dark p-6 rounded-xl shadow-md w-full">
                        <h2 className="font-arabic-bold text-lg mb-4 border-b pb-2">
                            مرفقات
                        </h2>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={(e) =>
                                setLectureAttachments(e.target.files ? [...e.target.files] : [])
                            }
                            className="w-full border border-gray-500 rounded-lg p-2 bg-white/5 text-white"
                        />
                        {lectureAttachments.length > 0 && (
                            <ul className="mt-2 text-sm text-green-400 space-y-1">
                                {lectureAttachments.map((file, idx) => (
                                    <li key={idx}>{file.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex justify-center gap-6 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? "جاري التحديث..." : "تحديث المحاضرة"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/lectures")}
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

export default EditLecture;
