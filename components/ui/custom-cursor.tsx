"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".hoverable")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={{
          width: isHovering ? 96 : 24,
          height: isHovering ? 96 : 24,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative flex items-center justify-center rounded-full border border-white bg-white/20 backdrop-blur-[2px]"
      >
        <motion.div
          animate={{ opacity: isHovering ? 1 : 0, rotate: 360 }}
          transition={{
            opacity: { duration: 0.2 },
            rotate: { repeat: Infinity, duration: 8, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              id="circleTextPath"
              d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              fill="transparent"
            />
            <text className="fill-white text-[10.5px] font-bold uppercase tracking-[0.25em]">
              <textPath href="#circleTextPath" startOffset="0%">
                Stellar Blue Belt • Stellar Blue Belt • 
              </textPath>
            </text>
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

