import React from 'react';
import { motion } from 'framer-motion';
import { AppSettings } from '../types';

interface GooglePhotosProps {
  settings: AppSettings;
  isMini?: boolean;
}

const GooglePhotos: React.FC<GooglePhotosProps> = ({ settings, isMini }) => {
  const landingPage = settings.landingPage;
  const albumLink = landingPage?.googlePhotosLink;
  const likes = landingPage?.googlePhotosLikes || '1.2k';
  const photosCount = landingPage?.googlePhotosCount || '450+';

  if (!albumLink) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in ${isMini ? 'scale-75' : ''}`}>
        <div className={`${isMini ? 'w-16 h-16 text-3xl' : 'w-24 h-24 text-5xl'} bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100/50`}>🖼️</div>
        <h2 className={`${isMini ? 'text-xl' : 'text-3xl'} font-black text-slate-800 mb-4`}>Google Photos Not Configured</h2>
        {!isMini && (
          <p className="text-slate-500 max-w-md mb-8 font-medium">
            Please go to <span className="text-indigo-600 font-bold">App Settings &gt; Loading Page</span> and provide a Google Photos album link to enable this view.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-slate-50/50 overflow-hidden animate-fade-in ${isMini ? 'rounded-3xl' : ''} relative`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header Section */}
      <div className={`bg-white/80 backdrop-blur-md border-b border-slate-200/60 ${isMini ? 'p-4' : 'p-8'} relative z-10`}>
        <div className={`max-w-7xl mx-auto flex ${isMini ? 'flex-row items-center' : 'flex-col md:flex-row md:items-center'} justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`${isMini ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-3xl'} bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white`}>
              🖼️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`${isMini ? 'text-sm' : 'text-3xl'} font-black text-slate-800 tracking-tight uppercase`}>Campus Memories</h1>
                {isMini && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                  </div>
                )}
              </div>
              {!isMini && <p className="text-slate-500 font-medium">Explore our official school photo albums and student highlights.</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`${isMini ? 'px-3 py-1.5' : 'px-6 py-3'} bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 hover:border-blue-200 transition-colors`}>
              <span className="text-blue-600 text-sm">❤️</span>
              <div>
                {isMini ? (
                  <p className="text-[10px] font-black text-blue-700 leading-none">{likes}</p>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Likes</p>
                    <p className="text-lg font-black text-blue-700 leading-none">{likes}</p>
                  </>
                )}
              </div>
            </div>
            <div className={`${isMini ? 'px-3 py-1.5' : 'px-6 py-3'} bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 hover:border-indigo-200 transition-colors`}>
              <span className="text-indigo-600 text-sm">📸</span>
              <div>
                {isMini ? (
                  <p className="text-[10px] font-black text-indigo-700 leading-none">{photosCount}</p>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Photos</p>
                    <p className="text-lg font-black text-indigo-700 leading-none">{photosCount}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${isMini ? 'p-4' : 'p-8'} relative z-10 custom-scrollbar`}>
        <div className={`max-w-7xl mx-auto ${isMini ? 'space-y-6' : 'space-y-12'}`}>
          {/* Featured Album Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[2.5rem] ${isMini ? 'p-6' : 'p-12'} text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50 group`}
          >
            {/* Animated Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Official Gallery
              </div>
              <h2 className={`${isMini ? 'text-2xl' : 'text-6xl'} font-black mb-6 leading-[1.1] tracking-tight`}>Your Window to Our Vibrant Campus Life.</h2>
              {!isMini && (
                <p className="text-blue-50/80 text-lg font-medium mb-10 leading-relaxed max-w-xl">
                  Access our full Google Photos library to see high-resolution memories of sports days, annual functions, and daily classroom adventures.
                </p>
              )}
              <button 
                onClick={() => window.open(albumLink, '_blank')}
                className={`${isMini ? 'px-8 py-4 text-[10px]' : 'px-12 py-6 text-sm'} bg-white text-indigo-700 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 group/btn`}
              >
                <span className="group-hover/btn:rotate-12 transition-transform">🚀</span> Launch Gallery
              </button>
            </div>
            
            {/* Decorative Grid */}
            {!isMini && (
              <div className="absolute right-12 bottom-0 top-12 w-1/3 hidden lg:grid grid-cols-2 gap-4 opacity-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-3xl aspect-square"></div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Highlights Grid */}
          <div>
            <div className={`flex items-center justify-between ${isMini ? 'mb-6' : 'mb-10'}`}>
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                <h3 className={`${isMini ? 'text-xs' : 'text-2xl'} font-black text-slate-800 uppercase tracking-widest`}>Recent Highlights</h3>
              </div>
              <div className="h-px flex-1 bg-slate-200/60 ml-8"></div>
            </div>
            
            <div className={`grid grid-cols-1 ${isMini ? 'gap-4' : 'md:grid-cols-3 gap-8'}`}>
              {[
                { title: 'Annual Sports Day', date: 'March 2024', icon: '🏆', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
                { title: 'Science Exhibition', date: 'February 2024', icon: '🔬', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
                { title: 'Cultural Fest', date: 'January 2024', icon: '🎭', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white ${isMini ? 'p-5' : 'p-10'} rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all group cursor-pointer text-left relative overflow-hidden`}
                  onClick={() => window.open(albumLink, '_blank')}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-[0.03] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2`}></div>
                  
                  <div className={`${isMini ? 'w-12 h-12 text-2xl mb-5' : 'w-20 h-20 text-4xl mb-8'} ${item.color} ${item.border} border rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm relative z-10`}>
                    {item.icon}
                  </div>
                  <h4 className={`${isMini ? 'text-base' : 'text-2xl'} font-black text-slate-800 mb-3 relative z-10`}>{item.title}</h4>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{item.date}</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">View Album</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className={`bg-white ${isMini ? 'p-6' : 'p-10'} rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-5 text-left relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent pointer-events-none"></div>
            <div className={`${isMini ? 'w-10 h-10 text-xl' : 'w-16 h-16 text-3xl'} bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0 relative z-10`}>
              💡
            </div>
            <div className="relative z-10">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                How it works
              </h4>
              <p className={`${isMini ? 'text-[11px]' : 'text-base'} text-slate-500 leading-relaxed font-medium`}>
                This page acts as a secure portal to your school's Google Photos albums. We ensure high-speed delivery and maximum privacy while giving parents a seamless way to access memories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GooglePhotos;
