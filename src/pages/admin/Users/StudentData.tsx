import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface StudentDataType {
  student_code: string;
  student_name: string;
  student_phone_number: string;
  parent_phone_number: string;
  group_code: string;
  student_password?: string;
  student_image?: string;
  account_type?: string;
}

const StudentData: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;
  const { student_code } = location.state as { student_code?: string };

  const [studentData, setStudentData] = useState<StudentDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);


  // Tabs
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Upload image
  const [studentImage, setStudentImage] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentImage(e.target.files[0]);
    }
  };

  // Fetch student data
  useEffect(() => {
    if (!student_code) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://apis.mr-biology.com/admin/students/getStudentData?admin_token=${adminToken}&student_code=${student_code}`
        );
        const data = await res.json();
        if (data.status === "success") setStudentData(data.student_data);
        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
        }
      } catch (err) {
        console.error(err);
        toast.error("حدث خطأ أثناء جلب بيانات الطالب");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adminToken, student_code, logout]);

  // Update basic info
  const handleUpdateInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentData) return;
    setUpdatingInfo(true); // ✅ Start loading
    const formData = new FormData();
    formData.append("admin_token", adminToken);
    formData.append("student_code", studentData.student_code);
    formData.append("student_phone_number", studentData.student_phone_number);
    formData.append("parent_phone_number", studentData.parent_phone_number);
    formData.append("group_code", studentData.group_code);
    if (studentImage) {
      formData.append("student_image", studentImage);
    }

    try {
      const res = await fetch(
        "https://apis.mr-biology.com/admin/students/updateStudent",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.status === "success") {
        toast.success("تم تحديث البيانات بنجاح!");
        window.location.reload();
      } else {
        toast.error(`حدث خطأ: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setUpdatingInfo(false); // ✅ Stop loading
    }
  };

  // Update password
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentData || !currentPassword || !newPassword) return;
    setUpdatingPassword(true); // ✅ Start loading
    const formData = new FormData();
    formData.append("admin_token", adminToken);
    formData.append("student_code", studentData.student_code);
    formData.append("student_phone_number", studentData.student_phone_number);
    formData.append("parent_phone_number", studentData.parent_phone_number);
    formData.append("group_code", studentData.group_code);
    formData.append("current_password", currentPassword);
    formData.append("new_password", newPassword);

    try {
      const res = await fetch(
        "https://apis.mr-biology.com/admin/students/updateStudent",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.status === "success") {
        toast.success("تم تغيير كلمة المرور بنجاح!");
        setCurrentPassword("");
        setNewPassword("");
        window.location.reload();
      } else {
        toast.error(`حدث خطأ: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setUpdatingPassword(false); // ✅ Stop loading
    }
  };


  const renderStudentImage = () => {
    if (studentData?.account_type === "center" && studentData?.student_image) {
      return (
        <img
          src={studentData.student_image}
          alt="student"
          className="w-28 h-28 rounded-full object-cover border-2 border-primary"
        />
      );
    }
    return (
      <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-arabic-bold">
        {studentData?.student_name?.charAt(0) || "S"}
      </div>
    );
  };

  if (loading)
    return <div className="text-center mt-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="container-custom section-padding mt-16 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl p-10 max-w-3xl mx-auto border border-white/20"
      >
        <h1 className="text-3xl font-arabic-bold text-center text-primary mb-10">
          بيانات الطالب
        </h1>

        <div className="flex flex-col items-center mb-8 space-y-4">
          {renderStudentImage()}
          <h3 className="text-2xl text-white font-arabic-semibold">{studentData?.student_name}</h3>
          <p className="text-primary-light">{studentData?.account_type}</p>
          <p className="text-primary-light">كود الطالب: {studentData?.student_code}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 border-b border-muted pb-2 rtl:space-x-reverse rtl:space-x-0 mb-6">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 font-arabic-medium transition ${activeTab === "info"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
              }`}
          >
            البيانات الأساسية
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 font-arabic-medium transition ${activeTab === "password"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
              }`}
          >
            تغيير كلمة المرور
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <form onSubmit={handleUpdateInfo} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-2 text-primary-light">
                <span>رقم ولي الامر</span>
                <input
                  type="text"
                  value={studentData?.parent_phone_number || ""}
                  onChange={(e) =>
                    setStudentData({ ...studentData!, parent_phone_number: e.target.value })
                  }
                  placeholder="رقم ولي الامر"
                  className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="flex flex-col gap-2 text-primary-light">
                <span>رقم الطالب</span>
                <input
                  type="text"
                  value={studentData?.student_phone_number || ""}
                  onChange={(e) =>
                    setStudentData({ ...studentData!, student_phone_number: e.target.value })
                  }
                  placeholder="رقم الطالب"
                  className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                /></label>

            </div>
            <label className="flex flex-col gap-2 text-primary-light">
              <span>كود المجموعة</span>
              <input
                type="text"
                value={studentData?.group_code || ""}
                onChange={(e) => setStudentData({ ...studentData!, group_code: e.target.value })}
                placeholder="كود المجموعة"
                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
              />
            </label>


            {/* Upload student image */}
            {studentData?.account_type === "center" && (
              <div className="flex flex-col items-center justify-center">
                <label className="block text-white mb-3">صورة الطالب</label>
                <div className="relative w-40 h-40">
                  <input
                    id="student_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="student_image"
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer rounded-full overflow-hidden group border-2 border-dashed border-primary"
                  >
                    <img
                      src={
                        studentImage
                          ? URL.createObjectURL(studentImage)
                          : studentData?.student_image || ""
                      }
                      alt="صورة الطالب"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-sm">تغيير الصورة</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-6 pt-6">
              {/* Update info button */}
              <button
                type="submit"
                disabled={updatingInfo}
                className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition disabled:opacity-60"
              >
                {updatingInfo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "تحديث البيانات"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">

            {/* Current student password (readonly) */}
            <div className="bg-white/5 border border-white/20 rounded-xl p-4 flex flex-col shadow-sm">
              <label className="text-sm text-white/70 mb-2">كلمة المرور الحالية للطالب</label>
              <input
                type="text"
                value={studentData?.student_password || ""}
                disabled
                className="w-full rounded-lg bg-gray-100 text-gray-700 font-arabic-medium px-4 py-2 cursor-not-allowed"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="كلمة المرور الحالية (للتأكيد)"
                  className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                />
                <span
                  className="absolute top-4 left-3 cursor-pointer text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                />
                <span
                  className="absolute top-4 left-3 cursor-pointer text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </div>

            {/* زرار التحديث */}
            <div className="flex justify-center gap-6 pt-6">
              <button
                type="submit"
                disabled={updatingPassword}
                className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition disabled:opacity-60"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "تحديث كلمة المرور"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

      </motion.div>
    </div>
  );
};

export default StudentData;
