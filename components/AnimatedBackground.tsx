import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';

interface AnimatedBackgroundProps {
  view: ViewState;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ view }) => {
  const getColors = () => {
    switch (view) {
      case ViewState.DASHBOARD:
        return ['bg-blue-400', 'bg-indigo-500', 'bg-cyan-400'];
      case ViewState.STUDENTS:
      case ViewState.STUDENT_PROFILE:
        return ['bg-emerald-400', 'bg-teal-500', 'bg-cyan-400'];
      case ViewState.EMPLOYEES:
      case ViewState.EMPLOYEE_PROFILE:
        return ['bg-violet-400', 'bg-purple-500', 'bg-fuchsia-400'];
      case ViewState.FEES:
      case ViewState.PARENT_PROFILE:
        return ['bg-amber-400', 'bg-orange-500', 'bg-yellow-400'];
      case ViewState.EXPENSES:
        return ['bg-rose-400', 'bg-red-500', 'bg-pink-400'];
      case ViewState.SETTINGS:
        return ['bg-slate-400', 'bg-gray-500', 'bg-zinc-400'];
      case ViewState.USER_PROFILE:
      case ViewState.SCHOOL_PROFILE:
        return ['bg-fuchsia-400', 'bg-pink-500', 'bg-rose-400'];
      case ViewState.RECYCLE_BIN:
        return ['bg-gray-600', 'bg-slate-700', 'bg-zinc-800'];
      case ViewState.LANDING:
        return ['bg-indigo-400', 'bg-blue-500', 'bg-purple-400'];
      case ViewState.LOCK:
        return ['bg-slate-400', 'bg-indigo-500', 'bg-slate-600'];
      default:
        return ['bg-blue-400', 'bg-indigo-500', 'bg-cyan-400'];
    }
  };

  const colors = getColors();

  const getGradientVars = () => {
    switch (view) {
      case ViewState.DASHBOARD:
        return { from: 'rgba(59, 130, 246, 0.05)', via: 'transparent', to: 'rgba(99, 102, 241, 0.05)' };
      case ViewState.STUDENTS:
      case ViewState.STUDENT_PROFILE:
        return { from: 'rgba(16, 185, 129, 0.05)', via: 'transparent', to: 'rgba(20, 184, 166, 0.05)' };
      case ViewState.EMPLOYEES:
      case ViewState.EMPLOYEE_PROFILE:
        return { from: 'rgba(167, 139, 250, 0.05)', via: 'transparent', to: 'rgba(192, 38, 211, 0.05)' };
      case ViewState.FEES:
      case ViewState.PARENT_PROFILE:
        return { from: 'rgba(245, 158, 11, 0.05)', via: 'transparent', to: 'rgba(249, 115, 22, 0.05)' };
      case ViewState.EXPENSES:
        return { from: 'rgba(244, 63, 94, 0.05)', via: 'transparent', to: 'rgba(239, 68, 68, 0.05)' };
      default:
        return { from: 'rgba(59, 130, 246, 0.05)', via: 'transparent', to: 'rgba(99, 102, 241, 0.05)' };
    }
  };

  const vars = getGradientVars();

  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ 
        background: `linear-gradient(to bottom right, ${vars.from}, ${vars.via}, ${vars.to})` 
      } as any}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Animated Blobs */}
          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -50, 100, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[100px] ${colors[0]}`}
          />
          
          <motion.div
            animate={{
              x: [0, -100, 50, 0],
              y: [0, 100, -50, 0],
              scale: [1, 0.8, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${colors[1]}`}
          />

          <motion.div
            animate={{
              x: [0, 50, -100, 0],
              y: [0, 100, 50, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] ${colors[2]}`}
          />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedBackground;
