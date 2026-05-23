import React, { useEffect, useState } from "react";
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

interface Question {
    question_code: string;
    question_content: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    student_answer: string; // "أ" | "ب" | "ج" | "د"
    correct_answer: string; // "أ" | "ب" | "ج" | "د"
}

interface ExamResult {
    exam_title: string;
    total_score: number;
    max_score: number;
    questions: Question[];
}

const Review: React.FC = () => {
    const { user, logout } = useAuth();
    const { exam_code } = useParams<{ exam_code: string }>();
    const navigate = useNavigate();
    const token = user?.student_token;

    const [examData, setExamData] = useState<ExamResult | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const fetchExamResults = async () => {
            if (!token || !exam_code) return;

            try {
                const res = await axios.get(
                    `https://apis.mr-biology.com/student/exams/getExamResults?student_token=${token}&exam_code=${exam_code}`
                );
                if (res.data.reason === "unauthorized") {
                    toast.info("يرجى تسجيل الدخول مرة أخرى");
                    logout();
                    return;
                }
                setExamData(res.data.result);
            } catch (err) {
                console.error(err);
                toast.error("تعذر تحميل بيانات الامتحان");
            } finally {
                setLoading(false);
            }
        };
        fetchExamResults();
    }, [token, exam_code, logout]);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <AlertCircle className="w-16 h-16 text-primary mb-6" />
                <p className="text-white text-lg">جارٍ تحميل بيانات الامتحان...</p>
            </div>
        );

    if (!examData)
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <p className="text-red-500 text-lg">تعذر تحميل بيانات الامتحان، يرجى المحاولة مرة أخرى.</p>
            </div>
        );

    const { questions, exam_title, total_score, max_score } = examData;
    const currentQuestion = questions[currentIndex];

    const getOptionLetter = (index: number) => ["أ", "ب", "ج", "د"][index];
    const getOptionKey = (index: number) => `option_${String.fromCharCode(97 + index)}` as keyof Question;

    return (
        <div className="bg-primary-dark min-h-screen p-6 text-white section-padding">
            <h2 className="text-2xl font-arabic-bold text-white mb-6">{exam_title}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Side: Question */}
                <div className="col-span-2 flex flex-col gap-6">
                    <Card className="bg-primary-dark p-6 space-y-6 shadow-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow-md">
                                {currentIndex + 1}
                            </div>
                            <h2 className="text-xl font-arabic-semibold text-primary-light">{currentQuestion.question_content}</h2>
                        </div>

                        <div className="space-y-3">
                            {[0, 1, 2, 3].map((i) => {
                                const optionKey = getOptionKey(i);
                                const letter = getOptionLetter(i);
                                const isStudentAnswer = currentQuestion.student_answer === letter;
                                const isCorrect = currentQuestion.correct_answer === letter;

                                return (
                                    <div
                                        key={optionKey}
                                        className={`flex items-center gap-3 p-4 rounded-xl border transition ${isCorrect ? "bg-green-600 border-green-500" : isStudentAnswer ? "bg-red-600 border-red-500" : "bg-background-darkest/70 border-white/10"
                                            }`}
                                    >
                                        <span className="font-bold">{letter}</span>
                                        <span>{currentQuestion[optionKey]}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button
                                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                                disabled={currentIndex === 0}
                                className="btn-primary rounded-xl flex items-center gap-2 px-6 disabled:opacity-50"
                            >
                                <ChevronRight size={18} /> السابق
                            </Button>
                            <Button
                                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                                disabled={currentIndex === questions.length - 1}
                                className="btn-primary rounded-xl flex items-center gap-2 px-6 disabled:opacity-50"
                            >
                                التالي <ChevronLeft size={18} />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Left Side: Question Numbers */}
                <motion.div
                    className="bg-primary-dark p-6 flex flex-col justify-between shadow-lg border border-white/10 rounded-xl"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="space-y-6">
                        <h3 className="text-lg font-arabic-semibold text-white">
                            عدد الأسئلة: <span className="text-primary-light text-lg font-bold">{questions.length}</span>
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
                    <Button onClick={() => navigate(-1)} className="w-full bg-red-600 hover:bg-red-700 mt-6 py-4 rounded-xl text-lg font-bold flex items-center gap-2">
                        <CheckCircle2 size={20} /> إنهاء المراجعة
                    </Button>

                </motion.div>
            </div>
        </div>
    );
};

export default Review;
