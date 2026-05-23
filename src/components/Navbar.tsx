import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/images/Login/Logo.jpg';
import useAuth from '@/context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { name: 'الرئيسية', href: '/' },
    { name: 'هدفنا', href: '#goals' },
    { name: ' الكورسات', href: '#courses' },
    { name: 'لماذا تختارنا', href: '#why-choose-us' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.hash === href;
  };

  const handleLoginClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-primary-dark p-6 sticky top-0 z-50 border-b border-primary/20 backdrop-blur ">
      <div className="lg:container-custom">
        <div className="flex items-center justify-between ">

          {/* Login Button */}
          <div className="hidden md:block ">
            <button
              onClick={handleLoginClick}
              className="btn-outline text-primary-light py-2 px-8 text-xl font-bold rounded-[100px]"
            >
              تسجيل دخول
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12 rtl:space-x-reverse rounded-2xl border border-primary px-32 py-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-3xl font-semibold transition-colors duration-200 no-underline
                  ${isActive(item.href)
                    ? 'text-primary-light'
                    : 'text-primary/70 hover:text-primary'}`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <img src={logo} alt="Mr Biology Education" className="rounded-full w-10 lg:w-16 " />
            <h1 className='text-xl lg:text-4xl font-bold'>
              <span className='text-white'>MR.</span>
              <span className='text-primary-light'>BIOLOGY</span>
            </h1>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden  p-2 text-white hover:bg-primary/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu with Framer Motion */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden mt-3 bg-primary-dark rounded-2xl shadow-lg p-10 border border-primary/20"
            >
              <div className="flex flex-col space-y-4 items-center ">
                {navItems.map((item, idx) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`block text-lg font-semibold transition-colors duration-200 no-underline
                      ${isActive(item.href)
                        ? 'text-primary'
                        : 'text-primary/70 hover:text-primary'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className='flex justify-center'
                >
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setIsMenuOpen(false);
                    }}
                    className="btn-outline text-center py-2 px-16"
                  >
                    تسجيل الدخول
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
