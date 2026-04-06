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

  const getBaseGradient = () => {
    switch (view) {
      case ViewState.DASHBOARD:
        return 'from-blue-100/40 via-white to-indigo-100/40';
      case ViewState.STUDENTS:
      case ViewState.STUDENT_PROFILE:
        return 'from-emerald-100/40 via-white to-teal-100/40';
      case ViewState.EMPLOYEES:
      case ViewState.EMPLOYEE_PROFILE:
        return 'from-violet-100/40 via-white to-purple-100/40';
      case ViewState.FEES:
      case ViewState.PARENT_PROFILE:
        return 'from-amber-100/40 via-white to-orange-100/40';
      case ViewState.EXPENSES:
        return 'from-rose-100/40 via-white to-red-100/40';
      case ViewState.SETTINGS:
        return 'from-slate-200/40 via-white to-gray-200/40';
      case ViewState.USER_PROFILE:
      case ViewState.SCHOOL_PROFILE:
        return 'from-fuchsia-100/40 via-white to-pink-100/40';
      case ViewState.RECYCLE_BIN:
        return 'from-gray-200/40 via-white to-slate-200/40';
      case ViewState.LANDING:
        return 'from-indigo-100/40 via-white to-blue-100/40';
      case ViewState.LOCK:
        return 'from-slate-200/40 via-white to-indigo-100/40';
      default:
        return 'from-blue-100/40 via-white to-indigo-100/40';
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-gradient-to-br ${getBaseGradient()}`}>
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
