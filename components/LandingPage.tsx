import React from 'react';
import { motion } from 'framer-motion';
import { Note, LandingPageSettings } from '../types';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Award, 
  Building2, 
  BookOpen, 
  ShieldCheck,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  ChevronRight,
  Trophy,
  Palmtree,
  BookMarked,
  DoorOpen
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  notes: Note[];
  schoolProfile: {
    name: string;
    motto: string;
    address: string;
    contactNumber: string;
    contactEmail: string;
    establishedYear: string;
    affiliationNumber: string;
    currentSession: string;
    logo?: string;
    banner?: string;
    bannerEffect?: 'Standard' | 'Blur' | 'Sepia' | 'Grayscale' | 'Dark';
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    whatsapp?: string;
    gmail?: string;
  };
  landingPageSettings?: LandingPageSettings;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, notes, schoolProfile, socialMedia, landingPageSettings }) => {
  if (!schoolProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!landingPageSettings?.enabled && landingPageSettings !== undefined) {
    onLogin();
    return null;
  }

  const primaryColor = landingPageSettings?.primaryColor || '#4F46E5';
  const secondaryColor = landingPageSettings?.secondaryColor || '#F59E0B';

  return (
    <div className="min-h-screen bg-white text-[#1E293B] font-sans overflow-y-auto overflow-x-hidden" style={{ '--primary': primaryColor, '--secondary': secondaryColor } as any}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-slate-100 h-24 md:h-28">
        <div className="w-full px-6 md:px-12 h-full flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {schoolProfile.logo ? (
              <img 
                src={schoolProfile.logo} 
                alt={schoolProfile.name} 
                className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-2xl shadow-md border border-slate-100 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                <GraduationCap size={32} />
              </div>
            )}
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-indigo-950 uppercase leading-none truncate">
                  {(schoolProfile.name || "School Name").split(' ').map((word, i) => (
                    <span key={i} className={i === 0 ? "text-indigo-900" : "text-orange-500"}>{word} </span>
                  ))}
                </h1>
                <div className="hidden xl:flex items-center gap-3 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm shrink-0">
                  <Calendar size={12} className="text-indigo-600" />
                  <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">
                    Session: {schoolProfile.currentSession}
                  </span>
                </div>
              </div>
              <p className="text-[10px] md:text-xs font-black text-indigo-600/80 uppercase tracking-[0.4em] mt-1.5 block">
                {schoolProfile.motto || "Knowledge is Power"}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogin}
            className="px-10 py-4 bg-[#EF4444] text-white font-black rounded-[2rem] text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95 shrink-0"
          >
            Login
          </button>
        </div>
      </header>

      {/* News Ticker */}
      <div className="fixed top-24 md:top-28 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-indigo-100/30 z-40 h-10 flex items-center overflow-hidden">
        <div className="bg-orange-500/90 text-white text-[8px] font-black uppercase px-3 py-1 h-full flex items-center z-10 backdrop-blur-sm">Live</div>
        <div className="flex-1 whitespace-nowrap animate-marquee flex items-center gap-12 text-[10px] font-bold text-indigo-900">
          {schoolProfile.notice && (
            <span className="text-orange-600 font-black flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
              📢 {schoolProfile.notice}
            </span>
          )}
          {notes && notes.length > 0 ? (
            notes.map((note, idx) => (
              <span key={note.id || idx}>📝 {note.content}</span>
            ))
          ) : !schoolProfile.notice && (
            <>
              <span>📢 Admissions are now open for the {schoolProfile.currentSession} session. Secure your future today!</span>
              <span>🏆 EH Sports Team wins the Regional Championship!</span>
              <span>📅 Parent-Teacher Symposium scheduled for Oct 28.</span>
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      {(landingPageSettings?.showHero !== false) && (
        <section className="pt-48 pb-24 px-4 text-center relative overflow-hidden min-h-[80vh] flex items-center justify-center">
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <img 
              src={schoolProfile.banner || "https://images.unsplash.com/photo-1523050853063-913ec9823dd2?auto=format&fit=crop&w=1920&q=80"} 
              alt="School Banner" 
              className={`w-full h-full object-cover transition-all duration-700 ${
                schoolProfile.bannerEffect === 'Blur' ? 'blur-md scale-110' :
                schoolProfile.bannerEffect === 'Sepia' ? 'sepia' :
                schoolProfile.bannerEffect === 'Grayscale' ? 'grayscale' :
                schoolProfile.bannerEffect === 'Dark' ? 'brightness-50' : ''
              }`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white"></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-8 shadow-sm"
              style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
            >
              ✨ Admissions {schoolProfile.currentSession}
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-[#1E293B] leading-[1.1] tracking-tight mb-8"
            >
              {landingPageSettings?.heroTitle || "Inspiring Future"} <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                {landingPageSettings?.heroSubtitle || "Leaders Today."}
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Experience a world-class education designed for the 21st-century citizen.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4 max-w-md mx-auto"
            >
              <button 
                className="w-full py-5 text-white font-black rounded-[2rem] text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3"
                style={{ backgroundImage: `linear-gradient(to right, ${secondaryColor}, ${secondaryColor})`, shadowColor: `${secondaryColor}20` }}
              >
                Enroll Now ✨
              </button>
              <button 
                onClick={onLogin}
                className="w-full py-5 text-white font-black rounded-[2rem] text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3"
                style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor})`, shadowColor: `${primaryColor}20` }}
              >
                Access Portal <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* School Profile Section */}
      {(landingPageSettings?.showProfile !== false) && (
        <section className="py-24 px-4 bg-slate-50/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4"
              >
                Institutional Credentials
              </motion.p>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
              >
                Official School Profile
              </motion.h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="h-1.5 bg-orange-400 mx-auto mt-6 rounded-full"
              ></motion.div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Visual & Identity */}
              <div className="lg:col-span-5 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative bg-indigo-900 group"
                >
                  <img 
                    src={schoolProfile.banner || "https://images.unsplash.com/photo-1523050853063-913ec9823dd2?auto=format&fit=crop&w=1200&q=80"} 
                    alt="School Building" 
                    className={`w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ${
                      schoolProfile.bannerEffect === 'Blur' ? 'blur-sm' :
                      schoolProfile.bannerEffect === 'Sepia' ? 'sepia' :
                      schoolProfile.bannerEffect === 'Grayscale' ? 'grayscale' :
                      schoolProfile.bannerEffect === 'Dark' ? 'brightness-50' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-2xl border border-white/20 mb-6 group-hover:rotate-12 transition-transform duration-500">
                      {schoolProfile.logo ? (
                        <img src={schoolProfile.logo} alt="Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <GraduationCap size={48} />
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                      {schoolProfile.name}
                    </h3>
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-[0.3em]">
                      {schoolProfile.motto || "Knowledge is Power"}
                    </p>
                  </div>
                </motion.div>

                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Campus Location</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{schoolProfile.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Credentials Grid */}
              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: <Calendar size={20} />, label: 'Academic Session', value: schoolProfile.currentSession, color: 'text-blue-600', bgColor: 'bg-blue-50', iconBg: 'bg-blue-100' },
                  { icon: <Award size={20} />, label: 'Affiliation Number', value: schoolProfile.affiliationNumber, color: 'text-purple-600', bgColor: 'bg-purple-50', iconBg: 'bg-purple-100' },
                  { icon: <Phone size={20} />, label: 'Contact Support', value: schoolProfile.contactNumber, color: 'text-emerald-600', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
                  { icon: <Building2 size={20} />, label: 'Established In', value: schoolProfile.establishedYear, color: 'text-orange-600', bgColor: 'bg-orange-50', iconBg: 'bg-orange-100' },
                  { icon: <Mail size={20} />, label: 'Official Email', value: schoolProfile.contactEmail, color: 'text-rose-600', bgColor: 'bg-rose-50', iconBg: 'bg-rose-100' },
                  { icon: <ShieldCheck size={20} />, label: 'Accreditation', value: 'Certified Excellence', color: 'text-indigo-600', bgColor: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group p-5 ${item.bgColor} rounded-[2rem] border border-transparent hover:border-white hover:bg-white hover:shadow-lg transition-all duration-500 cursor-default`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-xs font-bold text-slate-800 break-words leading-tight">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Facilities Section */}
      {(landingPageSettings?.showFacilities !== false) && (
        <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-4">Campus Environment</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Facilities & Infrastructure</h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=1600&q=80" 
                alt="Campus" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-12">
                <div>
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30 mb-4 inline-block">Exterior</span>
                  <h3 className="text-4xl font-black text-white">Vibrant Campus</h3>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === 2 ? "w-8 bg-indigo-600" : "w-1.5 bg-slate-200"}`}></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Events Section */}
      {(landingPageSettings?.showEvents !== false) && (
        <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-4">Institutional Schedule</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Upcoming Events</h2>
            <div className="w-20 h-1.5 bg-orange-200 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { date: 'OCT 28', title: 'Parent-Teacher Symposium', type: 'Symposium', color: 'border-blue-500' },
              { date: 'NOV 15', title: 'Annual Sports Championship', type: 'Athletics', color: 'border-orange-500' },
              { date: 'DEC 22', title: 'Winter Academic Break', type: 'Holiday', color: 'border-purple-500' },
              { date: 'MAR 10', title: 'Final Term Assessments', type: 'Academic', color: 'border-blue-600' },
            ].map((event, idx) => (
              <div key={idx} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 border-l-8 ${event.color} shadow-sm hover:shadow-xl transition-all group relative overflow-hidden`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{event.date}</p>
                      <h4 className="text-lg font-black text-slate-800 leading-tight">{event.title}</h4>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-md">{event.type}</span>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mt-4">
                  Details <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Star Students Section */}
      {(landingPageSettings?.showStarStudents !== false) && (
        <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-4">Academic Excellence</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Top 10 Star Students</h2>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center relative overflow-hidden border border-slate-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl">
                  <img src="https://i.pravatar.cc/150?u=mia" alt="Student" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-white">9</div>
              </div>

              <h4 className="text-3xl font-black text-slate-800 mb-1">Mia Wong</h4>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8 bg-indigo-50 inline-block px-4 py-1 rounded-full">Grade 12</p>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Academic Score</p>
                <p className="text-5xl font-black text-indigo-600">96.2%</p>
              </div>
              
              <div className="mt-10 text-4xl">💡</div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Management Section */}
      {(landingPageSettings?.showManagement !== false) && (
        <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Leadership & Vision</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Institutional Management</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              {
                role: 'Managing Director',
                name: 'Dr. Arthur Henderson',
                experience: '28+ Years',
                joined: 'Sept 15, 1995',
                degree: 'Ph.D. Management',
                session: '2024 - 2025',
                specialization: 'Educational Strategy',
                office: 'Admin Block, Suite 101',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
              },
              {
                role: 'Head of Academics',
                name: 'Prof. Sarah J. Miller',
                experience: '22+ Years',
                joined: 'Aug 10, 2002',
                degree: 'M.Sc. Ed, M.Phil',
                session: '2024 - 2025',
                specialization: 'Pedagogical Excellence',
                office: 'Academic Wing, Room 204',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
              }
            ].map((leader, idx) => (
              <div key={idx} className="bg-[#050B1A] rounded-[3.5rem] p-10 text-white overflow-hidden relative shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden mb-8 border-4 border-slate-800 shadow-2xl">
                    <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <span className="px-5 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                    {leader.role}
                  </span>
                  
                  <h3 className="text-4xl font-black mb-10 tracking-tight">{leader.name}</h3>
                  
                  <div className="w-full h-px bg-slate-800 mb-10"></div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full text-left">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Trophy size={10} className="text-orange-400" /> Experience
                      </p>
                      <p className="text-sm font-bold">{leader.experience}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Calendar size={10} className="text-rose-400" /> Joined
                      </p>
                      <p className="text-sm font-bold">{leader.joined}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <GraduationCap size={10} className="text-indigo-400" /> Degree
                      </p>
                      <p className="text-sm font-bold">{leader.degree}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Calendar size={10} className="text-emerald-400" /> Session
                      </p>
                      <p className="text-sm font-bold">{leader.session}</p>
                    </div>
                  </div>

                  <div className="mt-10 w-full text-left space-y-6">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <BookOpen size={10} className="text-blue-400" /> Specialization
                      </p>
                      <p className="text-sm font-bold">{leader.specialization}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <MapPin size={10} className="text-rose-400" /> Office Address
                      </p>
                      <p className="text-sm font-bold text-indigo-400">{leader.office}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Gallery Section */}
      {(landingPageSettings?.showGallery !== false) && (
        <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Visual Journey</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Campus Life Gallery</h2>
            <div className="w-20 h-1.5 bg-indigo-200 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1516534775068-ba3e84529519?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&w=600&q=80'
            ].map((img, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white"
              >
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Ecosystem Section */}
      {(landingPageSettings?.showEcosystem !== false) && (
        <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Seamless Integration</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ecosystem of Learning</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {[
              { title: 'Administration', desc: 'Robust oversight of school operations and institutional growth.', icon: <ShieldCheck size={32} />, color: 'blue' },
              { title: 'Employees & Staff', desc: 'AI-assisted lesson planning and real-time student engagement.', icon: <Users size={32} />, color: 'purple' },
              { title: 'Students and Parents', desc: 'Transparency into student progress and behavioral development.', icon: <Users size={32} />, color: 'orange' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 flex flex-col items-center text-center group">
                <div className={`w-20 h-20 rounded-[2rem] bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center mb-8`}>
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">{item.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{item.desc}</p>
                <button 
                  onClick={onLogin}
                  className={`w-full py-5 bg-gradient-to-r ${item.color === 'blue' ? 'from-blue-500 to-blue-600' : item.color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-orange-400 to-orange-500'} text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3`}
                >
                  Access Portal <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Stats Section */}
      {(landingPageSettings?.showStats !== false) && (
        <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-orange-500 text-white" style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-y-16 gap-x-8 text-center">
          <div className="flex flex-col items-center">
            <GraduationCap size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">2,500+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Students</div>
          </div>
          <div className="flex flex-col items-center">
            <Users size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">150+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Employees & Staff</div>
          </div>
          <div className="flex flex-col items-center">
            <Palmtree size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">25</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Campus Acres</div>
          </div>
          <div className="flex flex-col items-center">
            <Award size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">99.8%</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      {(landingPageSettings?.showFooter !== false) && (
        <footer className="bg-white pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8">
              <GraduationCap size={40} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-indigo-950 uppercase mb-2">
              {schoolProfile.name || "School Name"}
            </h1>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.4em] mb-6">
              Knowledge is Power
            </p>
            <div className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">
              Session {schoolProfile.currentSession}
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
              Pioneering the future of education through a fusion of digital innovation and holistic development.
            </p>
            <div className="flex gap-6">
              {socialMedia && Object.entries(socialMedia).map(([platform, url]) => {
                if (!url) return null;
                
                let Icon = Globe;
                if (platform === 'facebook') Icon = Facebook;
                if (platform === 'instagram') Icon = Instagram;
                if (platform === 'twitter') Icon = Twitter;
                if (platform === 'youtube') Icon = Youtube;
                if (platform === 'linkedin') Icon = Linkedin;
                if (platform === 'whatsapp') Icon = Phone;
                if (platform === 'gmail') Icon = Mail;

                return (
                  <a 
                    key={platform} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
              {!socialMedia && [Globe, Instagram, Twitter, Facebook].map((Icon, idx) => (
                <button key={idx} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-12">
            <div>
              <div className="flex justify-center mb-8">
                <div className="px-8 py-4 bg-blue-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3">
                  <Globe size={16} /> Quick Links
                </div>
              </div>
              <div className="bg-slate-50 rounded-[3rem] p-4 space-y-4">
                {['About Us', 'Admissions', 'Curriculum', 'Calendar'].map((link, idx) => (
                  <button key={idx} className="w-full p-6 bg-white rounded-[2rem] flex items-center justify-center text-sm font-black text-slate-800 shadow-sm hover:shadow-md transition-all border border-slate-50">
                    {link}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-center mb-8">
                <div className="px-8 py-4 bg-purple-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3">
                  <DoorOpen size={16} /> Portals
                </div>
              </div>
              <div className="bg-slate-50 rounded-[3rem] p-4 space-y-4">
                {['Admin Access', 'Teacher Access', 'Students and Parents'].map((link, idx) => (
                  <button key={idx} onClick={onLogin} className="w-full p-6 bg-white rounded-[2rem] flex items-center justify-center text-sm font-black text-slate-800 shadow-sm hover:shadow-md transition-all border border-slate-50">
                    {link}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-center mb-8">
                <div className="px-8 py-4 bg-orange-400 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3">
                  <MapPin size={16} /> Contact
                </div>
              </div>
              <div className="bg-slate-50 rounded-[3rem] p-4 space-y-4">
                <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm font-black text-slate-800">{schoolProfile.address}</p>
                </div>
                <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-black text-slate-800">{schoolProfile.contactNumber}</p>
                </div>
                <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-black text-slate-800">{schoolProfile.contactEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-slate-100 text-center">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-8 font-black text-xl">N</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} {schoolProfile.name || "School Name"} • All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
