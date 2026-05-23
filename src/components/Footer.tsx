import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '@/assets/images/Login/Logo.jpg';

interface FooterProps {
  showLinks?: boolean; // prop للتحكم في روابط سريعة
}

const Footer: React.FC<FooterProps> = ({ showLinks = true }) => {
  const links = [
    { name: 'هدفنا', href: '#goals' },
    { name: 'الكورسات', href: '#courses' },
    { name: 'لماذا تختارنا', href: '#why-choose-us' },
  ];

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <footer className="relative bg-primary-dark text-white">
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="section-padding border-b border-primary/20">
          <div className="container-custom">
            <div dir='ltr' className={`grid ${showLinks ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-12 text-center lg:text-right`}>

              {/* Quick Links */}
              {showLinks && (
                <motion.div
                  className="flex flex-col justify-between items-center order-2 lg:order-2"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={1}
                >
                  <h3 className="text-xl font-arabic-semibold text-primary-light mb-4">
                    روابط سريعة
                  </h3>
                  <ul className="space-y-4 flex flex-col items-center">
                    {links.map((link, i) => (
                      <motion.li key={link.name} variants={fadeUp} custom={i + 2}>
                        <a
                          href={link.href}
                          className="text-gray-300 hover:text-primary-light transition-colors duration-300 flex items-center group"
                        >
                          <span className="ml-10 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {/* Contact Info + Logo */}
              <motion.div
                className={`lg:pr-12 flex flex-col items-center text-center space-y-6 ${showLinks ? "lg:border-r lg:border-white/20" : ""}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={2}
              >
                <Link to="/" className="inline-block">
                  <img src={logo} alt="Mr Biology Education" className="rounded-full h-16 w-auto" />
                </Link>
                <p className="text-gray-300 leading-relaxed max-w-sm">
                  منصة <span className="text-primary-light font-bold">Mr. Biology</span> المتخصصة في تعليم الأحياء بأسلوب سهل وممتع.
                  هدفنا تبسيط المفاهيم العلمية وتقديم محتوى تفاعلي يساعد الطلاب على التفوق والنجاح.
                </p>

              </motion.div>

            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          className="py-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
        >
          <div className="container-custom">
            <div className="flex flex-col justify-center items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-center md:text-right" dir="rtl">
                جميع الحقوق محفوظة © 2025 Mr. Biology Education
              </p>
              <p className="text-gray-400 text-center md:text-right" dir="rtl">
                تصميم وتطوير بواسطة&nbsp;
                <strong>
                  <a
                    className="text-primary-light font-bold"
                    href="https://wa.me/+201016148495"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ahmed Refaat 👨‍💻
                  </a>
                </strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
