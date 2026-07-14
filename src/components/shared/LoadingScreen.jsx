import React from "react";
import { motion } from "framer-motion";

const LoadingScreen = ({ message = "Loading...", minHeight = "min-h-[400px]" }) => {
  return (
    <div className={`w-full flex items-center justify-center font-outfit select-none py-12 ${minHeight}`}>
      <div className="flex flex-col items-center space-y-5">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl font-black text-[#111111] tracking-tight flex items-center"
        >
          Sasta
          <motion.span
            animate={{
              scale: [1, 1.04, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="bg-[#FFE700] text-[#111111] px-1.5 py-0.5 rounded-lg ml-1 shadow-sm font-black border border-[#E6CF00]/30"
          >
            LMS
          </motion.span>
        </motion.div>

        {/* Pulse Dot Loader */}
        <div className="flex items-center gap-1.5 py-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.12,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full bg-[#111111]"
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] uppercase font-bold tracking-widest font-mono text-slate-450"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
