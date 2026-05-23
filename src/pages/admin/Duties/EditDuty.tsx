import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Save,
  XCircle,
  FileText,
  Calendar,
  Target,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

type Group = {
  group_code: string;
  group_name: string;
};

const EditDuty = () => {
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;
  const navigate = useNavigate();
  const { duty_code } = useParams();
  const { state } = useLocation();

  const [groupCode, setGroupCode] = useState("");
  const [dutyTitle, setDutyTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [totalGrade, setTotalGrade] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  // set initial state from passed duty
  useEffect(() => {
    if (state?.duty) {
      const { group_code, duty_title, deadline, total_grade } = state.duty;
      setGroupCode(group_code);
      setDutyTitle(duty_title);
      setDeadline(deadline);
      setTotalGrade(total_grade);
    
    }
  }, [state]);

  // fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `https://apis.mr-biology.com/admin/groups/getGroups?admin_token=${adminToken}&group_type=all`
        );
        const data = await response.json();

        if (data.reason === "unauthorized") {
          logout();
          toast.info("⚠️ يرجي تسجيل الدخول مرة أخرى");
        }

        if (data.status === "success") {
          setGroups(data.groups);
        } else {
          toast.error("❌ فشل في جلب المجموعات");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("⚠️ خطأ أثناء الاتصال بالسيرفر");
      }
    };

    if (adminToken) fetchGroups();
  }, [adminToken, logout]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dutyTitle || !deadline || !totalGrade || !groupCode) {
      toast.error("❌ من فضلك املأ جميع الحقول");
      return;
    }

    if (!adminToken) {
      toast.error("⚠️ غير مسموح (Token مفقود)");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("admin_token", adminToken);
      formData.append("duty_code", duty_code || "");
      formData.append("group_code", groupCode);
      formData.append("duty_title", dutyTitle);
      formData.append("deadline", deadline);
      formData.append("total_grade", totalGrade);
      if (pdfFile) formData.append("pdf_file", pdfFile);

      const response = await fetch(
        "https://apis.mr-biology.com/admin/duties/updateDuty",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("⚠️ يرجي تسجيل الدخول مرة أخرى");
        return;
      }

      if (data.status === "success") {
        toast.success("تم تعديل الواجب بنجاح!");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(data.message || "❌ حدث خطأ أثناء التعديل.");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("⚠️ خطأ أثناء الاتصال بالسيرفر");
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
        className="bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl p-10 max-w-3xl mx-auto border border-white/20"
      >
        <h1 className="text-3xl font-arabic-bold text-center text-primary mb-10">
          تعديل الواجب
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* duty title */}
          <div>
            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
              <FileText className="w-4 h-4" /> عنوان الواجب
            </label>
            <input
              type="text"
              value={dutyTitle}
              onChange={(e) => setDutyTitle(e.target.value)}
              placeholder="أدخل عنوان الواجب"
              className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* upload file */}
          <div>
            <label className="block text-white mb-3">ملف الواجب (PDF)</label>
            <label
              htmlFor="pdf_file"
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20"
            >
              <Upload className="w-10 h-10 text-gray-300 mb-2" />
              <span className="text-gray-200">
                اسحب الملف أو اضغط للرفع
              </span>
              <input
                id="pdf_file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {pdfFile && (
              <div className="mt-4 flex items-center justify-between bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-200">
                  📄 <span>{pdfFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  إزالة
                </button>
              </div>
            )}
          </div>

          {/* total grade */}
          <div>
            <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
              <Target className="w-4 h-4" /> الدرجة الكلية
            </label>
            <input
              type="number"
              value={totalGrade}
              onChange={(e) => setTotalGrade(e.target.value)}
              placeholder="أدخل الدرجة الكلية"
              className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* deadline + group */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> تاريخ الغلق
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-2 text-primary-light font-arabic-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> المجموعة
              </label>
              <select
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">اختر المجموعة</option>
                {groups.map((group) => (
                  <option key={group.group_code} value={group.group_code}>
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* buttons */}
          <div className="flex justify-center gap-6 pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> جاري التعديل...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> تعديل
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-300 transition disabled:opacity-70"
              disabled={loading}
            >
              <XCircle className="w-5 h-5" /> إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditDuty;
