import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Trash2, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_IMAGES = import.meta.env.VITE_BASE_IMAGES;

interface UserCourse {
    userId: string;
    userName: string;
    phoneNumber: string;
    courseId: number;
    courseName: string;
    startTime: string;
    endTime: string;
    courseState: string;
    courseType: string;
    coursePrice: number;
    courseDescription: string;
    courseImageUrl: string;
}

function CourseDetails() {
    const { id } = useParams();
    const [users, setUsers] = useState<UserCourse[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const usersPerPage = 5;

    // modal state
    const [selectedUser, setSelectedUser] = useState<UserCourse | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const courseInfo = users.length > 0 ? users[0] : null;

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                toast.error("لا يوجد صلاحيات (token مفقود)");
                return;
            }

            const res = await fetch(
                `${BASE_API}/UserCourse/GetAllUsersForCourse?CourseId=${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error("فشل في جلب المستخدمين");

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
            toast.error("خطأ أثناء جلب المستخدمين");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchUsers();
    }, [id]);

    // تعديل المدة
    const handleUpdateDuration = async () => {
        if (!selectedUser) return;
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${BASE_API}/UserCourse/UpdateUserCourse`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: selectedUser.userId,
                    courseId: selectedUser.courseId,
                    startTime: startDate,
                    endTime: endDate,
                }),
            });

            if (!res.ok) throw new Error("فشل في تعديل المدة");

            toast.success("تم تعديل المدة بنجاح");
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error("خطأ أثناء تعديل المدة");
        }
    };

    // حذف المستخدم من الكورس
    const handleDeleteUser = async (user: UserCourse) => {
        if (!confirm(`هل أنت متأكد من حذف ${user.userName} من الكورس؟`)) return;

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${BASE_API}/UserCourse/DeleteUserCourse`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user.userId,
                    courseId: user.courseId,
                }),
            });

            if (!res.ok) throw new Error("فشل في حذف المستخدم");

            toast.success("تم حذف المستخدم من الكورس");
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error("خطأ أثناء حذف المستخدم");
        }
    };

    // Pagination logic
    const indexOfLastUser = page * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    return (
        <div className="container-custom section-padding p-8 mt-16 lg:mt-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-arabic-bold text-white text-right">
                    تفاصيل الكورس (المسجلين)
                </h1>
                <Link to="/courses">
                    <Button className="bg-primary text-white">رجوع للكورسات</Button>
                </Link>
            </div>

            {/* Course Info Header */}
            {courseInfo && (
                <div className="card-dark max-w-6xl mx-auto mb-6 p-6">
                    <div className="flex items-center gap-4">
                        <img
                            src={`${BASE_API_IMAGES}/Images/${courseInfo.courseImageUrl}`}
                            alt={courseInfo.courseName}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                        />
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                {courseInfo.courseName}
                            </h2>
                            <p className="text-gray-300 text-sm line-clamp-2">
                                {courseInfo.courseDescription}
                            </p>
                            <p className="text-yellow-400 mt-2 font-bold">
                                السعر: {courseInfo.coursePrice} جنيه
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card-dark max-w-6xl mx-auto"
            >
                {loading ? (
                    <p className="text-center text-gray-400 p-6">جار التحميل...</p>
                ) : (
                    <>
                        {/* Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="bg-primary text-white">
                                        <th className="p-3">#</th>
                                        <th className="p-3">الاسم</th>
                                        <th className="p-3">الرقم</th>
                                        <th className="p-3">تاريخ البداية</th>
                                        <th className="p-3">تاريخ النهاية</th>
                                        <th className="p-3">الحالة</th>
                                        <th className="p-3">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map((user, index) => (
                                        <tr
                                            key={user.userId}
                                            className="border-b border-gray-300 hover:bg-gray-100/10 transition"
                                        >
                                            <td className="p-3">{indexOfFirstUser + index + 1}</td>
                                            <td className="p-3">{user.userName}</td>
                                            <td className="p-3">{user.phoneNumber}</td>
                                            <td className="p-3">
                                                {new Date(user.startTime).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                {new Date(user.endTime).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">{user.courseState}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setStartDate(user.startTime.slice(0, 10));
                                                            setEndDate(user.endTime.slice(0, 10));
                                                        }}
                                                        className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        <span>تعديل المدة</span>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>حذف</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
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
                                : "bg-white text-primary-dark"
                                }`}
                        >
                            {i + 1}
                        </Button>
                    ))}

                    <Button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="w-10 h-10 rounded-full bg-white text-primary-dark border-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Modal لتعديل المدة */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">تعديل المدة</h2>
                            <button onClick={() => setSelectedUser(null)}>
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    تاريخ البداية
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full border rounded p-2 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    تاريخ النهاية
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full border rounded p-2 text-black"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                onClick={() => setSelectedUser(null)}
                                className="bg-gray-300 text-gray-800"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleUpdateDuration}
                                className="bg-primary text-white"
                            >
                                حفظ
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseDetails;
