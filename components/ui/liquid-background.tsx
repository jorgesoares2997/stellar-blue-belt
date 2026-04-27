"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const LiquidBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springX = useSpring(mousePos.x, { damping: 30, stiffness: 100 });
  const springY = useSpring(mousePos.y, { damping: 30, stiffness: 100 });

  const bgScroll = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        style={{ x: springX, y: springY, translateY: bgScroll }}
        className="absolute -inset-[10%]"
      >
        {/* Blob 1 */}
        <div className="absolute top-[10%] left-[15%] h-[400px] w-[400px] rounded-full bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] animate-pulse-slow" />
        {/* Blob 2 */}
        <div className="absolute top-[40%] right-[10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 dark:bg-purple-600/10 blur-[120px] animate-float" />
        {/* Blob 3 */}
        <div className="absolute bottom-[10%] left-[30%] h-[350px] w-[350px] rounded-full bg-emerald-600/20 dark:bg-emerald-600/10 blur-[90px] animate-pulse-slow" />
        
        {/* Decorative Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]" 
          style={{ 
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", 
            backgroundSize: "40px 40px" 
          }} 
        />
      </motion.div>
    </div>
  );
};
