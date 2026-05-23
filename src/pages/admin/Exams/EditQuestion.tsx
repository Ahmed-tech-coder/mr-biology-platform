import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Save, XCircle, FileText, ImageIcon, Shield, Upload } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface QuestionData {
  questionType: "text" | "image";
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "أ" | "ب" | "ج" | "د";
  questionImage: File | null;
}

const EditQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { question_code } = useParams<{ question_code: string }>();
  const { admin, logout } = useAdminAuth();
  const adminToken = admin?.admin_token;

  const [questionData, setQuestionData] = useState<QuestionData>({
    questionType: "text",
    questionContent: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "أ",
    questionImage: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!adminToken || !question_code) return;
      try {
        const res = await fetch(
          `https://apis.mr-biology.com/admin/questions/getQuestion?admin_token=${adminToken}&question_code=${question_code}`
        );
        const data = await res.json();
        if (data.reason === "unauthorized") {
          logout();
          toast.info("يرجي تسجيل الدخول مرة اخري");
          return;
        }

        if (data.status === "success" && data.question_data) {
          setQuestionData({
            questionType: data.question_data.question_type || "text",
            questionContent: data.question_data.question_content || "",
            optionA: data.question_data.option_a || "",
            optionB: data.question_data.option_b || "",
            optionC: data.question_data.option_c || "",
            optionD: data.question_data.option_d || "",
            correctAnswer: data.question_data.correct_answer || "أ",
            questionImage: null,
          });
        } else {
          toast.error("حدث خطأ أثناء جلب بيانات السؤال!");
        }
      } catch (err) {
        console.error(err);
        toast.error("حدث خطأ أثناء جلب البيانات!");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [adminToken, question_code, logout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuestionData((prev) => ({ ...prev, questionImage: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !question_code) return;

    const formData = new FormData();
    formData.append("admin_token", adminToken);
    formData.append("question_code", question_code);
    formData.append("question_type", questionData.questionType);
    formData.append(
      "question_content",
      questionData.questionType === "text" ? questionData.questionContent : ""
    );
    formData.append("option_a", questionData.optionA);
    formData.append("option_b", questionData.optionB);
    formData.append("option_c", questionData.optionC);
    formData.append("option_d", questionData.optionD);
    formData.append("correct_answer", questionData.correctAnswer);
    if (questionData.questionType === "image" && questionData.questionImage) {
      formData.append("question_image", questionData.questionImage);
    }

    try {
      setLoading(true);
      const res = await fetch(
        "https://apis.mr-biology.com/admin/questions/updateQuestion",
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.reason === "unauthorized") {
        logout();
        toast.info("يرجي تسجيل الدخول مرة اخري");
        return;
      }

      if (data.status === "success") {
        toast.success("تم تعديل السؤال بنجاح!");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(data.message || "حدث خطأ أثناء التعديل!");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-300 mt-10">جارٍ تحميل البيانات...</p>;
  }

  return (
    <div className="container-custom section-padding mt-16 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl p-10 max-w-3xl mx-auto border border-white/20"
      >
        <h1 className="text-3xl font-arabic-bold text-center text-primary mb-10 flex items-center justify-center gap-2">
          <FileText className="w-6 h-6" /> تعديل السؤال
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* نوع السؤال */}
          <div className="flex flex-col gap-2">
            <label className="font-arabic-medium text-primary-light mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> نوع السؤال
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "نص", value: "text", color: "bg-blue-500 text-white" },
                { label: "صورة", value: "image", color: "bg-green-500 text-white" },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition
                    ${questionData.questionType === item.value
                      ? `${item.color} border-primary shadow-md scale-105`
                      : "bg-white/5 border-gray-300 hover:border-primary/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="questionType"
                    value={item.value}
                    checked={questionData.questionType === item.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="font-bold">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* محتوى السؤال */}
          {questionData.questionType === "text" ? (
            <div className="flex flex-col gap-2">
              <label className="font-arabic-medium text-primary-light">محتوى السؤال</label>
              <input
                type="text"
                name="questionContent"
                placeholder="أدخل محتوى السؤال"
                value={questionData.questionContent}
                onChange={handleChange}
                className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary p-3"
                required
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="font-arabic-medium text-primary-light flex items-center gap-2">
                <ImageIcon className="w-5 h-5" /> رفع صورة السؤال
              </label>

              <label
                htmlFor="question_image"
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/20 transition"
              >
                <Upload className="w-10 h-10 text-gray-300 mb-2" />
                <span className="text-gray-200">اسحب الصورة أو اضغط للرفع</span>
                <input
                  id="question_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {questionData.questionImage && (
                <img
                  src={URL.createObjectURL(questionData.questionImage)}
                  alt="صورة السؤال"
                  className="mt-4 w-28 h-28 rounded-xl object-cover"
                />
              )}
            </div>
          )}

          {/* الاختيارات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "أ", value: questionData.optionA, setter: "optionA" },
              { label: "ب", value: questionData.optionB, setter: "optionB" },
              { label: "ج", value: questionData.optionC, setter: "optionC" },
              { label: "د", value: questionData.optionD, setter: "optionD" },
            ].map((opt) => (
              <div key={opt.label} className="flex flex-col gap-1">
                <label className="font-arabic-medium text-primary-light">الاختيار ({opt.label})</label>
                <input
                  type="text"
                  value={opt.value}
                  onChange={(e) =>
                    setQuestionData((prev) => ({ ...prev, [opt.setter]: e.target.value }))
                  }
                  className="input-field w-full rounded-xl focus:ring-2 focus:ring-primary p-3"
                  required
                />
              </div>
            ))}
          </div>

          {/* الإجابة الصحيحة */}
          <div className="flex flex-col gap-2">
            <label className="font-arabic-medium text-primary-light mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> الإجابة الصحيحة
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["أ", "ب", "ج", "د"].map((ans) => (
                <label
                  key={ans}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition
                    ${questionData.correctAnswer === ans
                      ? "bg-primary text-white border-primary shadow-md scale-105"
                      : "bg-white/5 border-gray-300 hover:border-primary/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={ans}
                    checked={questionData.correctAnswer === ans}
                    onChange={() =>
                      setQuestionData((prev) => ({ ...prev, correctAnswer: ans as "أ" | "ب" | "ج" | "د" }))
                    }
                    className="hidden"
                  />
                  <span className="font-bold">{ans}</span>
                </label>
              ))}
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex justify-center gap-6 pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition disabled:opacity-70"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              حفظ التعديلات
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

export default EditQuestion;
