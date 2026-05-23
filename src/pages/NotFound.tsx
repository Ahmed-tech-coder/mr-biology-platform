import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas animation: simple floating cells / DNA
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type Particle = { x: number; y: number; radius: number; speed: number };
    const particles: Particle[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 5 + Math.random() * 10,
        speed: 0.2 + Math.random() * 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(173, 216, 230, 0.5)"; // light blue cells
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.speed;
        if (p.y + p.radius < 0) {
          p.y = canvas.height + p.radius;
          p.x = Math.random() * canvas.width;
        }
      });
    };

    const interval = setInterval(draw, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen bg-primary-dark overflow-hidden flex items-center justify-center">
      {/* Animated cells */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>

      {/* Content */}
      <motion.div
        className="z-10 bg-white/10 backdrop-blur-md p-8 rounded-xl text-center shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-6xl font-bold text-primary-light mb-4">404</h1>
        <p className="text-xl mb-4 text-white font-medium">
          🧬 الصفحة اللي بتدور عليها مش موجودة!
        </p>
        <p className="text-sm mb-6 text-gray-300">
          [ Error Code: 404 | الصفحة غير موجودة ]
        </p>

        <div className="flex justify-center gap-4">
          <motion.button
            className="px-6 py-2 rounded-lg bg-primary-light text-white font-semibold hover:bg-primary transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
          >
            ⬅ العودة
          </motion.button>

          <motion.button
            className="px-6 py-2 rounded-lg bg-white text-primary-dark font-semibold hover:bg-gray-100 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
          >
            🏠 الرئيسية
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
