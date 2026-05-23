import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type CustomDialogProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    loading?: boolean;
    icon?: ReactNode;
};

const CustomDialog = ({
    open,
    onClose,
    title = "تأكيد العملية",
    description = "هل أنت متأكد أنك تريد الاستمرار؟",
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    onConfirm,
    loading = false,
    icon,
}: CustomDialogProps) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card text-card-foreground rounded-2xl shadow-[var(--shadow-large)] w-[90%] max-w-md p-6 relative border border-primary/20"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-gray-400 hover:text-white transition"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Icon */}
                        {icon && <div className="flex justify-center mb-4">{icon}</div>}

                        {/* Title */}
                        <h2 className="text-xl font-arabic-bold text-center mb-2">{title}</h2>
                        <p className="text-gray-400 text-center mb-6">{description}</p>

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="btn-outline flex-1"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "جاري التنفيذ..." : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomDialog;
