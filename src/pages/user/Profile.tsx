import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useAuth from "@/context/AuthContext";
import { Upload, Loader2 } from "lucide-react";

interface StudentData {
  student_name?: string;
  account_type?: string;
  student_image?: string;
  parent_phone_number?: string;
  student_phone_number?: string;
  group_code?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, studentCode } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user?.student_token) return;

    const fetchStudentData = async () => {
      try {
        const res = await fetch(
          `https://apis.mr-biology.com/student/account/getStudentData?student_token=${user.student_token}`
        );
        const data = await res.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
        } else if (data.status === "success") {
          const student = data.student_data;
          if (student.student_image) {
            student.student_image = decodeURIComponent(
              student.student_image.replace(/\\/g, "").replace("http:", "https:")
            );
          }
          setStudentData(student);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [user, logout]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !user?.student_token) {
      toast.error("يرجى اختيار صورة قبل الحفظ");
      return;
    }

    const formData = new FormData();
    formData.append("student_image", selectedImage);
    formData.append("student_token", user.student_token);

    try {
      setIsUploading(true);
      const res = await fetch(
        "https://apis.mr-biology.com/student/account/updateStudent",
        { method: "POST", body: formData }
      );
      const result = await res.json();

      setIsUploading(false);

      if (result.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (result.status === "success") {
        toast.success("تم تحديث الصورة بنجاح");
        // نعمل Reload للصفحة عشان تظهر الصورة الجديدة
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error("حدث خطأ أثناء تحديث الصورة");
      }
    } catch (error) {
      setIsUploading(false);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };


  const renderStudentImage = () => {
    if (!studentData) return null;

    if (studentData.account_type === "online") {
      return (
        <div className="w-32 h-32 rounded-full bg-primary-light flex items-center justify-center text-4xl font-arabic-bold text-white shadow-xl">
          {studentData.student_name?.charAt(0)}
        </div>
      );
    }

    return (
      <motion.img
        key={previewImage || studentData.student_image}
        src={previewImage || studentData.student_image || ""}
        alt="student_image"
        className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
        whileHover={{ scale: 1.1 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.png";
        }}
      />
    );
  };

  return (
    <motion.div
      className="max-w-7xl m-16 mx-auto bg-gradient via-primary to-primary-light text-white rounded-3xl p-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Header */}
      <motion.div
        className="text-3xl font-arabic-bold text-white"

        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        الصفحة الشخصية
      </motion.div>

      {/* Student Info */}
      <motion.div
        className="flex flex-col items-center gap-4 "
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">{renderStudentImage()}</div>
        <div className="text-center space-y-7">
          <h3 className="text-3xl font-arabic-bold mb-6">{studentData?.student_name}</h3>
          <span className="px-3 py-1 rounded-full bg-primary-light text-sm">{studentData?.account_type}</span>
          <p className="text-sm text-gray-200">كود الطالب: {studentCode}</p>
        </div>
      </motion.div>

      {/* Read-only Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "رقم ولي الامر", value: studentData?.parent_phone_number },
          { label: "رقم الطالب", value: studentData?.student_phone_number },
          { label: "كود المجموعة", value: studentData?.group_code },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white bg-opacity-10 p-4 rounded-xl shadow-md "
          >
            <label className="text-primary-light mb-1 block">{item.label}</label>
            <p className="font-arabic-medium">{item.value || "-"}</p>
          </div>
        ))}
      </div>

      {/* Update Image Section */}
      {(studentData?.account_type === "center" ||
        studentData?.account_type === "سنتر") && (
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-full sm:w-2/3 lg:w-1/2 mx-auto">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer bg-white/10 hover:border-primary-light hover:bg-white/20 transition-all duration-300"
              >
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-2" />
                ) : (
                  <Upload className="w-10 h-10 text-gray-300 mb-2" />
                )}
                <span className="text-gray-200">
                  {isUploading ? "جاري رفع الصورة..." : "اسحب الصورة هنا أو اضغط للرفع"}
                </span>
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {previewImage && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={previewImage}
                    alt="صورة الطالب"
                    className="w-28 h-28 rounded-xl object-cover shadow-lg border border-primary-light"
                  />
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                className="btn-primary w-full mt-4 rounded-xl"
                disabled={isUploading}
              >
                حفظ الصورة
              </motion.button>
            </div>
          </motion.form>
        )}
    </motion.div>
  );
};

export default Profile;
