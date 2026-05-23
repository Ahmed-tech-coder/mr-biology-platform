import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

type CustomDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: (dates: { startDate: string; endDate: string }) => void;
};

const AcceptDialog = ({ open, onClose, onConfirm }: CustomDialogProps) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleConfirm = () => {
        if (!startDate || !endDate) {
            toast.error("من فضلك أدخل تاريخ البداية والنهاية");
            return;
        }
        onConfirm({ startDate, endDate });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-card text-card-foreground border border-primary/20 rounded-2xl shadow-[var(--shadow-medium)]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-arabic-bold text-white">
                            📅 تعيين موعد الكورس
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block mb-3 font-arabic-medium text-sm text-gray-300">
                                تاريخ البداية
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field w-full bg-primary-foreground text-black border border-primary"
                            />
                        </div>
                        <div>
                            <label className="block mb-3 font-arabic-medium text-sm text-gray-300">
                                تاريخ النهاية
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field w-full bg-primary-foreground text-black border border-primary"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6 flex gap-3">
                        <Button variant="outline" onClick={onClose} className="btn-outline flex-1">
                            إلغاء
                        </Button>
                        <Button onClick={handleConfirm} className="btn-primary flex-1">
                            تأكيد
                        </Button>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default AcceptDialog;
