'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Animated geometric shapes */}
      <motion.div
        className="absolute -top-4 -right-4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 dark:from-blue-400/20 dark:to-purple-400/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute -bottom-4 -left-4 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 dark:from-amber-400/20 dark:to-orange-400/20 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating lines */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-1 h-32 bg-gradient-to-b from-blue-400/40 to-transparent dark:from-blue-300/30"
        animate={{
          rotate: [0, 360],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-1 h-24 bg-gradient-to-b from-purple-400/40 to-transparent dark:from-purple-300/30"
        animate={{
          rotate: [0, -360],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Floating dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-blue-400/50 dark:bg-blue-300/40"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}