import { motion } from "framer-motion";
import { BookOpen, Users, GraduationCap } from "lucide-react";


const Goals = () => {
  return (
    <section id="goals" className="py-20 lg:py-32 bg-primary-dark">
      <div className="container-custom">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-arabic-bold text-white inline-block border-b-4 border-primary pb-4 lg:pb-6">
            هدفنا
          </h2>
          <p className="mt-6 text-lg lg:text-xl text-gray-300 font-arabic-medium">
            تبسيط علم الأحياء وجعل التعلم رحلة ممتعة 🌱🔬! ومليئة بالاكتشاف
          </p>
        </motion.div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative bg-background-darker rounded-2xl p-8 text-center shadow-soft group"
          >
            <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-arabic-semibold text-primary-light">
              امتحانات و واجبات تفاعلية
            </h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative bg-background-darker rounded-2xl p-8 text-center shadow-soft group"
          >
            <Users className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-arabic-semibold text-primary-light">
              فريق عمل بيتابع معاك باستمرار
            </h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative bg-background-darker rounded-2xl p-8 text-center shadow-soft group"
          >
            <GraduationCap className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-arabic-semibold text-primary-light">
              تبسيط المادة للحصول على الدرجة النهائية
            </h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </motion.div>
        </div>


      </div>
    </section>
  );
};

export default Goals;
