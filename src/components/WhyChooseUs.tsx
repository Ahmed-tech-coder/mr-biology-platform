import { BookOpen, Users, TrendingUp, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import whyChooseUsImage from "@/assets/images/WhyUs/Circle-removebg.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const WhyChooseUs = () => {
  const features = [
    {
      icon: BookOpen,
      title: "أقوي مراجعات",
      description: "مراجعات شاملة تغطي كل النقاط المهمة لضمان استعداد كامل للامتحانات.",
    },
    {
      icon: Users,
      title: "أسئلة امتحانات",
      description: "تدريب عملي على نماذج امتحانات سابقة وأسئلة متوقعة لتعزيز الفهم والتطبيق.",
    },
    {
      icon: TrendingUp,
      title: "أحدث وسائل لشرح",
      description: "استخدام تقنيات وأساليب حديثة لشرح المادة بشكل مبسط وتفاعلي.",
    },
    {
      icon: Headphones,
      title: "خبرة",
      description: "سنوات من الخبرة في التدريس لضمان أفضل طريقة لنقل المعلومة بسهولة.",
    },
  ];


  return (
    <motion.section
      id="why-choose-us"
      className="section-padding bg-primary-dark"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image + Title */}
          <motion.div
            className="relative flex flex-col justify-center items-center"
            variants={itemVariants}
          >
            <motion.img
              src={whyChooseUsImage}
              alt="فريق Mr Biology Education"

              initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            />

            <motion.h3
              className="text-lg lg:text-2xl font-arabic-bold text-white mt-6 px-6 py-3 rounded-lg border-b-4 border-primary text-center"
              variants={itemVariants}
            >
              لماذا تختارنا؟
            </motion.h3>

            <motion.div dir="ltr" className="text-lg lg:text-2xl font-arabic-bold text-white mt-6 px-6 py-3 rounded-lg text-center">
              <p>,لأننا نحول علم الأحياء إلى تجربة تفاعلية ممتعة</p>
              <p>🌱🔬✨!تجمع بين الفهم العميق والاكتشاف المذهل</p>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid sm:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-gradient group p-6 text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, x: 5 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <feature.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <p className="text-lg font-arabic-semibold text-white mb-3 group-hover:text-primary-light transition-colors">
                  {feature.title}
                </p>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default WhyChooseUs;
