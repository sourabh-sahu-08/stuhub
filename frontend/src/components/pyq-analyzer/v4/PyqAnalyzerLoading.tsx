import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, FileText, Sparkles, Database } from 'lucide-react';

const LOADING_PHASES = [
  { text: "Parsing Syllabus Structure...", icon: FileText },
  { text: "Extracting Questions from PYQs...", icon: Database },
  { text: "Running Semantic Clustering...", icon: Brain },
  { text: "Calculating Unit Frequencies...", icon: Cpu },
  { text: "Finalizing Dashboard...", icon: Sparkles }
];

export const PyqAnalyzerLoading: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    // Cycle through phases every 4-6 seconds
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % LOADING_PHASES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = LOADING_PHASES[phaseIndex].icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh]">
      {/* Animated Hexagon / Core */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-12">
        {/* Outer rotating dash ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-[#F5A524]/30 rounded-full"
        />
        
        {/* Middle pulsing ring */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 border-2 border-[#F5A524]/40 rounded-full"
        />
        
        {/* Inner solid ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 border-t-2 border-l-2 border-[#F5A524] rounded-full shadow-[0_0_15px_rgba(245,165,36,0.4)]"
        />

        {/* Center Icon Background */}
        <div className="absolute inset-10 bg-gradient-to-tr from-[#F5A524]/20 to-[#F5A524]/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-[#F5A524]/20 shadow-[inset_0_0_20px_rgba(245,165,36,0.3)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <CurrentIcon className="w-10 h-10 text-[#F5A524]" />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#F5A524] rounded-full shadow-[0_0_8px_#F5A524]"
          />
        ))}
      </div>

      {/* Dynamic Text */}
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-[#F5A524] mb-4">
        AI Analysis in Progress
      </h2>

      <div className="h-8 overflow-hidden relative w-full max-w-sm flex justify-center mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute text-gray-400 text-lg font-medium tracking-wide"
          >
            {LOADING_PHASES[phaseIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Smooth Progress Bar */}
      <div className="w-full max-w-md h-2 bg-gray-800/80 rounded-full overflow-hidden relative shadow-inner">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F5A524]/50 via-[#F5A524] to-[#F5A524]/50"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 30, // Approximate max time for 10 pyqs
            ease: "circOut"
          }}
        />
        {/* Shine effect across bar */}
        <motion.div 
          className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
          animate={{ x: [-100, 500] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <p className="text-gray-500 text-sm mt-4">
        Processing files securely via Groq Llama-3.1
      </p>
    </div>
  );
};


