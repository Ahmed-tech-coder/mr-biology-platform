import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import useAuth from "@/context/AuthContext";

const ExamQuestions = () => {
    const { user, logout } = useAuth();
    const { exam_code } = useParams<{ exam_code: string }>();
    const navigate = useNavigate();
    const token = user?.student_token;

    const [questions, setQuestions] = useState<any[]>([]);
    const [examInfo, setExamInfo] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [open, setOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // جلب الأسئلة
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!token) {
                toast.error("التوكن غير موجود، يرجى تسجيل الدخول");
                logout();
                return;
            }
            if (!exam_code) {
                toast.error("كود الاختبار غير موجود");
                return;
            }

            try {
                const res = await axios.get(
                    `https://apis.mr-biology.com/student/exams/getExamQuestions?student_token=${token}&exam_code=${exam_code}`
                );

                if (res.data.reason === "unauthorized") {
                    toast.info("يرجى تسجيل الدخول مرة أخرى");
                    logout();
                    return;
                }

                if (res.data.questions) setQuestions(res.data.questions);
                if (res.data.exam_info) setExamInfo(res.data.exam_info);
            } catch (err: any) {
                console.error("Failed to fetch questions", err);
                toast.error("فشل في تحميل الأسئلة");
            }
        };

        fetchQuestions();
    }, [token, exam_code, logout]);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    const handleSelectAnswer = (questionCode: string, option: string) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionCode]: option }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) setCurrentIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    };

    const optionMap = {
        option_a: "أ",
        option_b: "ب",
        option_c: "ج",
        option_d: "د",
    };


    const handleFinishExam = async () => {
        setOpen(false);

        const formData = new FormData();
        formData.append("student_token", token || "");
        formData.append("exam_code", exam_code || "");

        const answersArray = Object.entries(selectedAnswers).map(
            ([question_code, answer]) => ({
                question_code,
                answer: optionMap[answer] || answer,
            })
        );

        formData.append("answers", JSON.stringify(answersArray));

        try {
            const res = await axios.post(
                "https://apis.mr-biology.com/student/exams/submitExam",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.data.reason === "unauthorized") {
                toast.info("يرجى تسجيل الدخول مرة أخرى");
                logout();
                return;
            }

            if (res.data.status === "success") {
                setShowSuccess(true);
                setTimeout(() => navigate(-1), 1500);
            } else {
                toast.error(res.data.message || "حدث خطأ أثناء إرسال الاختبار");
            }
        } catch (err: any) {
            if (err.response) {
                const { reason, message, missing_fields } = err.response.data;
                if (reason === "missing_fields") {
                    toast.error(
                        "الحقول مفقودة: " + Object.values(missing_fields).join(", ")
                    );
                } else if (reason === "unauthorized") {
                    toast.error(message);
                } else {
                    toast.error("حدث خطأ غير متوقع.");
                }
            } else {
                toast.error("تعذر الاتصال بالخادم. حاول مرة أخرى.");
            }
        }
    };


    if (questions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24"
            >
                <AlertCircle className="w-16 h-16 text-primary mb-6" />
                <h3 className="text-2xl lg:text-4xl font-arabic-bold text-white mb-4">
                    لا توجد أسئلة متاحة حاليًا
                </h3>
                <p className="text-gray-300 text-lg text-center max-w-md">
                    سيتم إضافة الأسئلة قريبًا، يرجى المحاولة لاحقًا.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="bg-primary-dark section-padding">
            <h2 className="text-2xl font-arabic-bold text-white mb-8">{examInfo?.exam_title || "الاختبار"}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Side */}
                <div className="col-span-2 flex flex-col gap-8">
                    <Card className="card-dark bg-primary-dark p-8 space-y-8 shadow-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow-md">
                                {currentIndex + 1}
                            </div>
                            {currentQuestion.question_type === "image" ? (
                                <img src={currentQuestion.question_content} alt={`Question ${currentIndex + 1}`} className="max-w-full" />
                            ) : (
                                <h2 className="text-2xl font-arabic-semibold text-white leading-snug">
                                    {currentQuestion.question_content}
                                </h2>
                            )}
                        </div>

                        <div className="space-y-4">
                            {["option_a", "option_b", "option_c", "option_d"].map((opt) => (
                                <label
                                    key={opt}
                                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition border ${selectedAnswers[currentQuestion.question_code] === opt
                                        ? "bg-primary/40 border-primary"
                                        : "bg-background-darkest/70 border-white/5 hover:bg-primary/20"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={currentQuestion.question_code}
                                        checked={selectedAnswers[currentQuestion.question_code] === opt}
                                        onChange={() => handleSelectAnswer(currentQuestion.question_code, opt)}
                                        className="accent-primary w-4 h-4"
                                    />
                                    <span className="text-white">{currentQuestion[opt]}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button onClick={handlePrev} disabled={currentIndex === 0} className="btn-primary rounded-xl flex items-center gap-2 px-6 disabled:opacity-50">
                                <ChevronRight size={18} /> السابق
                            </Button>
                            <Button onClick={handleNext} disabled={currentIndex === totalQuestions - 1} className="btn-primary rounded-xl flex items-center gap-2 px-6 disabled:opacity-50">
                                التالي <ChevronLeft size={18} />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Left Side */}
                <motion.div
                    className="card-dark bg-primary-dark p-6 flex flex-col justify-between shadow-lg border border-white/10"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="space-y-6">
                        <h3 className="text-lg font-arabic-semibold text-white">
                            عدد الأسئلة: <span className="text-primary-light text-lg font-bold">{totalQuestions}</span>
                        </h3>

                        <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-1">
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition ${i === currentIndex ? "bg-primary text-white shadow-lg" : "bg-primary-foreground text-primary-dark hover:bg-primary-foreground/30"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-red-600 hover:bg-red-700 mt-6 py-4 rounded-xl text-lg font-bold flex items-center gap-2">
                                <CheckCircle2 size={20} /> إنهاء الاختبار
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-primary-dark text-white border border-white/10 rounded-xl w-96 lg:w-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center m-2 gap-2 text-xl text-red-500">
                                    <AlertTriangle size={22} /> تأكيد إنهاء الاختبار
                                </DialogTitle>
                                <DialogDescription className="text-gray-300 mt-2">
                                    هل أنت متأكد أنك تريد إنهاء الاختبار الآن؟ لن تتمكن من تعديل إجاباتك بعد ذلك.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-3 mt-6">
                                <Button className="text-black" variant="outline" onClick={() => setOpen(false)}>
                                    إلغاء
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-700" onClick={handleFinishExam}>
                                    تأكيد الإنهاء
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            </div>

            {showSuccess && (
                <div className="Success-Container">
                    <div className="Success-Message">
                        <div className="Success-Icon">✔</div>
                        <p>تم الانتهاء بنجاح</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamQuestions;
