import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type CustomConfirmDialogProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
};

const CustomConfirmDialog: React.FC<CustomConfirmDialogProps> = ({
  open,
  message,
  onConfirm,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="card-dark w-full max-w-md p-6 rounded-2xl shadow-[var(--shadow-large)]"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* رسالة */}
            <p className="text-lg font-arabic-medium text-center mb-6">
              {message}
            </p>

            {/* الأزرار */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onConfirm}
                className="btn-primary min-w-[100px]"
              >
                نعم
              </button>
              <button
                onClick={onClose}
                className="btn-outline min-w-[100px]"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomConfirmDialog;
