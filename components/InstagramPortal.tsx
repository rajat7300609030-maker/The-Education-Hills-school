import React from 'react';
import { motion } from 'framer-motion';
import { AppSettings } from '../types';

interface InstagramPortalProps {
  settings: AppSettings;
  isMini?: boolean;
}

const InstagramPortal: React.FC<InstagramPortalProps> = ({ settings, isMini }) => {
  const landingPage = settings.landingPage;
  const feedLink = landingPage?.instagramLink;
  const followers = '8.2k'; 
  const postsCount = '420+';

  if (!feedLink) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in ${isMini ? 'scale-75' : ''}`}>
        <div className={`${isMini ? 'w-16 h-16 text-3xl' : 'w-24 h-24 text-5xl'} bg-pink-50 text-pink-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-pink-100/50`}>📸</div>
        <h2 className={`${isMini ? 'text-xl' : 'text-3xl'} font-black text-slate-800 mb-4`}>Instagram Not Configured</h2>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-slate-50/50 overflow-hidden animate-fade-in ${isMini ? 'rounded-3xl' : ''} relative`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e1306c 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header Section */}
      <div className={`bg-white/80 backdrop-blur-md border-b border-slate-200/60 ${isMini ? 'p-4' : 'p-8'} relative z-10`}>
        <div className={`max-w-7xl mx-auto flex ${isMini ? 'flex-row items-center' : 'flex-col md:flex-row md:items-center'} justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`${isMini ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-3xl'} bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 text-white`}>
              📸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`${isMini ? 'text-sm' : 'text-3xl'} font-black text-slate-800 tracking-tight uppercase`}>Instagram Feed</h1>
                {isMini && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-pink-50 rounded-full border border-pink-100">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-pink-600 uppercase tracking-widest">Live</span>
                  </div>
                )}
              </div>
              {!isMini && <p className="text-slate-500 font-medium">See the latest snapshots of campus life on our Instagram.</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`${isMini ? 'px-3 py-1.5' : 'px-6 py-3'} bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 hover:border-pink-200 transition-colors`}>
              <span className="text-pink-600 text-sm">👥</span>
              <div>
                {isMini ? (
                  <p className="text-[10px] font-black text-pink-700 leading-none">{followers}</p>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Followers</p>
                    <p className="text-lg font-black text-pink-700 leading-none">{followers}</p>
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
          {/* Featured Post Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-[2.5rem] ${isMini ? 'p-6' : 'p-12'} text-white relative overflow-hidden shadow-2xl shadow-pink-200/50 group`}
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Official Feed
              </div>
              <h2 className={`${isMini ? 'text-2xl' : 'text-6xl'} font-black mb-6 leading-[1.1] tracking-tight`}>Capturing Every Moment of Excellence.</h2>
              {!isMini && (
                <p className="text-pink-50/80 text-lg font-medium mb-10 leading-relaxed max-w-xl">
                  Follow our visual journey. From classroom smiles to podium finishes, see it all on our official Instagram handle.
                </p>
              )}
              <button 
                onClick={() => window.open(feedLink, '_blank')}
                className={`${isMini ? 'px-8 py-4 text-[10px]' : 'px-12 py-6 text-sm'} bg-white text-pink-700 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 group/btn`}
              >
                <span className="group-hover/btn:rotate-12 transition-transform">📸</span> View Feed
              </button>
            </div>
          </motion.div>

          {/* Recent Posts Grid */}
          <div>
            <div className={`flex items-center justify-between ${isMini ? 'mb-6' : 'mb-10'}`}>
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-pink-600 rounded-full"></div>
                <h3 className={`${isMini ? 'text-xs' : 'text-2xl'} font-black text-slate-800 uppercase tracking-widest`}>Recent Snapshots</h3>
              </div>
              <div className="h-px flex-1 bg-slate-200/60 ml-8"></div>
            </div>
            
            <div className={`grid grid-cols-1 ${isMini ? 'gap-4' : 'md:grid-cols-3 gap-8'}`}>
              {[
                { title: 'Morning Assembly Vibes', date: '1 hour ago', icon: '✨', color: 'bg-pink-50 text-pink-600', border: 'border-pink-100' },
                { title: 'Art & Craft Workshop', date: '5 hours ago', icon: '🎨', color: 'bg-pink-50 text-pink-600', border: 'border-pink-100' },
                { title: 'Science Lab Experiments', date: 'Yesterday', icon: '🧪', color: 'bg-pink-50 text-pink-600', border: 'border-pink-100' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white ${isMini ? 'p-5' : 'p-10'} rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-pink-100 hover:-translate-y-2 transition-all group cursor-pointer text-left relative overflow-hidden`}
                  onClick={() => window.open(feedLink, '_blank')}
                >
                  <div className={`${isMini ? 'w-12 h-12 text-2xl mb-5' : 'w-20 h-20 text-4xl mb-8'} ${item.color} ${item.border} border rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-all shadow-sm relative z-10`}>
                    {item.icon}
                  </div>
                  <h4 className={`${isMini ? 'text-base' : 'text-xl'} font-black text-slate-800 mb-3 relative z-10`}>{item.title}</h4>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{item.date}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramPortal;
