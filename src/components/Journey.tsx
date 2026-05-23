import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Elements from "@/assets/images/Journey/Elements.png";
import DownEllipse from "@/assets/images/Journey/Down_Ellipse.png";
import AccountCircle from "@/assets/images/Login/Account-Circle.png";

const Journey = () => {
    const navigate = useNavigate();

    // Navigate to Register Page
    const handleRegister = () => navigate("/register");

    const floatAnimation = {
        initial: { y: 0 },
        animate: { y: [0, -10, 0] },
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    };

    return (
        <motion.section
            id="journey"
            className="relative flex flex-col items-center justify-center text-center py-20 bg-primary overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* Decorative Stickers */}
            {[0, 1, 2].map((_, index) => (
                <motion.img
                    key={index}
                    src={Elements}
                    alt="Decorative Element"
                    className={`absolute w-16 h-16 lg:w-40 lg:h-40 ${index === 0
                            ? "top-10 left-10"
                            : index === 1
                                ? "top-20 right-16"
                                : "bottom-24 left-1/3"
                        }`}
                    {...floatAnimation}
                    transition={{
                        ...floatAnimation.transition,
                        delay: index * 0.5,
                    }}
                />
            ))}

            {/* Journey Message */}
            <motion.p
                className="text-white text-xl lg:text-2xl font-arabic-medium mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                لا تفوت الفرصة... ابدأ رحلتك في عالم الأحياء الآن! 🔬✨
            </motion.p>

            {/* Register Button */}
            <motion.button
                onClick={handleRegister}
                className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full shadow-lg text-lg lg:text-xl font-arabic-bold hover:bg-primary-dark transition-all"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 8,
                    delay: 1,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <img
                    src={AccountCircle}
                    alt="Account Icon"
                    className="w-7 h-7"
                />
                انشأ حسابك الأن
            </motion.button>
        </motion.section>
    );
};

export default Journey;
