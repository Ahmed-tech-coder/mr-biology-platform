import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Loading = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas animation: floating cells (biology vibe 🧬)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type Particle = { x: number; y: number; radius: number; speed: number };
    const particles: Particle[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 3 + Math.random() * 6,
        speed: 0.2 + Math.random() * 0.6,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(144, 238, 144, 0.4)"; // light green cells
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
    <div className="relative flex items-center justify-center h-screen w-full overflow-hidden bg-primary-dark text-white">
      {/* Animated cells background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>

      {/* Center content */}
      <motion.div
        className="z-10 text-center bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1
          className="text-5xl md:text-6xl font-bold text-green-300 mb-4 tracking-wide"
        >
          🧬 Mr Biology
        </h1>

        <motion.p
          className="text-lg font-medium text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          جاري تحميل المحتوى .. استعد لاكتشاف عالم الأحياء 🚀
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Loading;
