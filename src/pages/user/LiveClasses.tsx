import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAuth from "@/context/AuthContext";
import axios from "axios";
import { Video } from "lucide-react";

interface LiveClass {
    class_code: string;
    class_title: string;
    class_link: string;
}

const LiveClasses: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const studentToken = user?.student_token;

    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchLiveClasses = async () => {
            try {
                const response = await axios.get(
                    "https://apis.mr-biology.com/student/live-classes/getLiveClasses",
                    { params: { student_token: studentToken } }
                );

                if ((response as any).reason === "unauthorized") {
                    logout();
                    toast.info("يرجي تسجيل الدخول مرة اخري");
                    return;
                }

                if (response.data.status === "success") {
                    setClasses(response.data.classes);
                } else {
                    setError("فشل في تحميل الحصص.");
                    toast.error("فشل في تحميل الحصص.");
                }
            } catch (err) {
                setError("حدث خطأ أثناء جلب البيانات.");
            } finally {
                setLoading(false);
            }
        };

        if (studentToken) {
            fetchLiveClasses();
        }
    }, [studentToken, logout]);

    return (
        <div className="min-h-screen bg-primary-dark m-16 lg:m-0 p-6 md:p-12">
            <h1 className="text-3xl font-bold text-primary-light mb-8">الحصص المباشرة</h1>

            {loading && <p className="text-center text-gray-500">جارٍ التحميل...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && classes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <Video size={48} className="mb-4 text-blue-500" />
                    <h3 className="text-2xl md:text-4xl font-bold text-gray-700">
                        لا توجد حصص متاحة حاليًا
                    </h3>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {classes.map((cls) => (
                    <div
                        key={cls.class_code}
                        className="bg-primary-light shadow-md rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">{cls.class_title}</h2>
                            <p className="text-sidebar">كود الحصة: {cls.class_code}</p>
                        </div>
                        <a
                            href={cls.class_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-dark hover:bg-primary-dark/80 text-white font-semibold py-2 px-4 transition-colors duration-200"
                        >
                            <Video size={18} /> الدخول إلى الحصة
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveClasses;
