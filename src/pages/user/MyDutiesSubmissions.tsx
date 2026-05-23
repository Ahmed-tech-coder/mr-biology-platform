import { useEffect, useState, useCallback, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import useAuth from "@/context/AuthContext";

type DutyDetails = {
  duty_code: string;
  duty_title: string;
  pdf_file: string;
};

const Submission = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { duty_code } = useLocation().state || {};

  const [dutyDetails, setDutyDetails] = useState<DutyDetails | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch Duty Details
  useEffect(() => {
    if (!user?.student_token || !duty_code) return;

    const fetchDuty = async () => {
      try {
        const res = await axios.get(
          `https://apis.mr-biology.com/student/duties/getDuty?student_token=${user.student_token}&duty_code=${duty_code}`
        );

        if (res.data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
        } else if (res.data.status === "success") {
          setDutyDetails(res.data.duty);
        } else {
          toast.error("فشل تحميل تفاصيل الواجب.");
        }
      } catch {
        toast.error("خطأ أثناء الاتصال بالخادم.");
      } finally {
        setLoading(false);
      }
    };

    fetchDuty();
  }, [user?.student_token, duty_code, logout]);

  // ✅ Handle File Change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // ✅ Handle Submit
  const handleSubmit = useCallback(async () => {
    if (!file) {
      toast.info("يرجى رفع ملف الواجب (PDF).");
      return;
    }

    const formData = new FormData();
    formData.append("pdf_file", file);
    formData.append("student_token", user?.student_token || "");
    formData.append("duty_code", duty_code);

    setSubmitting(true);
    try {
      const res = await axios.post(
        "https://apis.mr-biology.com/student/duties/dutySubmission",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
      } else if (res.data.status === "success") {
        toast.success("تم تسليم الواجب بنجاح ✅");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("حدث خطأ أثناء تسليم الواجب.");
    } finally {
      setSubmitting(false);
    }
  }, [file, user?.student_token, duty_code, logout, navigate]);

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        جارٍ تحميل تفاصيل الواجب...
      </div>
    );
  }

  // ✅ Not Found
  if (!dutyDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-300">
        <FileText className="w-12 h-12 mb-4 text-primary" />
        <p>تعذر العثور على تفاصيل الواجب.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark/95 to-black section-padding flex flex-col items-center justify-center">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        رجوع
      </Button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl rounded-3xl shadow-2xl border border-primary/20 p-10 bg-white/10 backdrop-blur-xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 rounded-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-primary-light" />
          <h2 className="text-3xl font-arabic-bold text-white">
            {dutyDetails.duty_title}
          </h2>
        </div>

        {/* PDF Link */}
        <a
          href={dutyDetails.pdf_file}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex items-center gap-2 text-primary-light font-medium hover:underline mb-6"
        >
          <FileText className="w-5 h-5" />
          <span>عرض ملف الواجب (PDF)</span>
        </a>

        {/* File Upload */}
        <div className="relative z-10 mt-6">
          <label
            htmlFor="fileInput"
            className="flex items-center justify-center gap-3 cursor-pointer w-full px-6 py-5 border-2 border-dashed border-primary/50 rounded-2xl text-gray-300 hover:border-primary-light hover:text-primary-light transition font-arabic-semibold"
          >
            <Upload className="w-6 h-6" />
            <span>{file ? file.name : "رفع ملف الواجب (PDF)"}</span>
          </label>
          <input
            type="file"
            id="fileInput"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit */}
        <div className="mt-8">
          <Button
            onClick={handleSubmit}
            className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-6 text-lg font-arabic-bold shadow-lg shadow-primary/30"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                جارٍ التسليم...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                تسليم الواجب
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Submission;
