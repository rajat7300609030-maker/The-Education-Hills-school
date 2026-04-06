import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, LandingPageSettings, ViewState, UserProfileData } from '../types';
import AnimatedBackground from './AnimatedBackground';
import { 
  GraduationCap, 
  Users, 
  User,
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
  ChevronLeft,
  Trophy,
  Palmtree,
  BookMarked,
  DoorOpen,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  X,
  Download,
  Share2
} from 'lucide-react';

interface LandingPageProps {
  onLogin: (role?: 'ADMIN' | 'STUDENT') => void;
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
    admissionFormUrl?: string;
    campusAcres?: string;
    successRate?: string;
    leadershipList?: import('../types').LeadershipCard[];
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
  userProfile?: UserProfileData;
  imageSlider?: import('../types').AppSettings['imageSlider'];
  students?: import('../types').Student[];
  employees?: import('../types').Employee[];
}

const ALL_HOLIDAYS = [
  // JAN
  { date: '2026-01-01', title: "New Year's Day", type: 'Holiday', color: 'purple' },
  { date: '2026-01-14', title: 'Makar Sankranti', type: 'Holiday', color: 'orange' },
  { date: '2026-01-26', title: 'Republic Day', type: 'Holiday', color: 'blue' },
  // FEB
  { date: '2026-02-14', title: "Valentine's Day", type: 'Event', color: 'pink' },
  { date: '2026-02-15', title: 'Maha Shivratri', type: 'Holiday', color: 'purple' },
  // MAR
  { date: '2026-03-03', title: 'Holi', type: 'Holiday', color: 'pink' },
  { date: '2026-03-20', title: 'Eid-ul-Fitr', type: 'Holiday', color: 'green' },
  { date: '2026-03-29', title: 'Ram Navami', type: 'Holiday', color: 'orange' },
  // APR
  { date: '2026-04-03', title: 'Good Friday', type: 'Holiday', color: 'indigo' },
  { date: '2026-04-05', title: 'Easter Sunday', type: 'Holiday', color: 'rose' },
  { date: '2026-04-14', title: 'Ambedkar Jayanti', type: 'Holiday', color: 'blue' },
  { date: '2026-04-17', title: 'Ram Navami', type: 'Holiday', color: 'orange' },
  { date: '2026-04-21', title: 'Mahavir Jayanti', type: 'Holiday', color: 'emerald' },
  // MAY
  { date: '2026-05-01', title: 'Labour Day', type: 'Holiday', color: 'red' },
  { date: '2026-05-27', title: 'Eid-ul-Adha', type: 'Holiday', color: 'green' },
  // JUN
  { date: '2026-06-21', title: 'International Yoga Day', type: 'Event', color: 'cyan' },
  // JUL
  { date: '2026-07-17', title: 'Muharram', type: 'Holiday', color: 'slate' },
  // AUG
  { date: '2026-08-15', title: 'Independence Day', type: 'Holiday', color: 'orange' },
  { date: '2026-08-28', title: 'Raksha Bandhan', type: 'Holiday', color: 'pink' },
  // SEP
  { date: '2026-09-05', title: "Teacher's Day", type: 'Event', color: 'blue' },
  { date: '2026-09-15', title: 'Ganesh Chaturthi', type: 'Holiday', color: 'orange' },
  // OCT
  { date: '2026-10-02', title: 'Gandhi Jayanti', type: 'Holiday', color: 'slate' },
  { date: '2026-10-21', title: 'Dussehra', type: 'Holiday', color: 'orange' },
  // NOV
  { date: '2026-11-08', title: 'Diwali', type: 'Holiday', color: 'yellow' },
  { date: '2026-11-10', title: 'Bhai Dooj', type: 'Holiday', color: 'pink' },
  { date: '2026-11-24', title: 'Guru Nanak Jayanti', type: 'Holiday', color: 'blue' },
  // DEC
  { date: '2026-12-25', title: 'Christmas Day', type: 'Holiday', color: 'red' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, notes, schoolProfile, socialMedia, landingPageSettings, userProfile, imageSlider, students, employees }) => {
  const [currentFacilityIndex, setCurrentFacilityIndex] = React.useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = React.useState<null | { url: string; title: string }>(null);

  const currentMonthHolidays = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return ALL_HOLIDAYS.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === currentMonth && hDate.getFullYear() === currentYear;
    }).map(h => {
      const d = new Date(h.date);
      const monthStr = d.toLocaleString('default', { month: 'short' }).toUpperCase();
      const dayStr = d.getDate();
      return {
        ...h,
        displayDate: `${monthStr} ${dayStr}`
      };
    });
  }, []);

  const facilities = React.useMemo(() => {
    if (imageSlider?.enabled && imageSlider.images && imageSlider.images.length > 0) {
      return imageSlider.images.map(img => ({
        title: img.title || "Facility",
        description: img.description || "State-of-the-art infrastructure for our students.",
        image: img.url,
        tag: "Infrastructure"
      }));
    }
    return [];
  }, [imageSlider]);

  React.useEffect(() => {
    if (facilities.length === 0) return;
    const timer = setInterval(() => {
      setCurrentFacilityIndex((prev) => (prev + 1) % facilities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [facilities.length]);

  const nextFacility = () => {
    setCurrentFacilityIndex((prev) => (prev + 1) % facilities.length);
  };

  const prevFacility = () => {
    setCurrentFacilityIndex((prev) => (prev - 1 + facilities.length) % facilities.length);
  };

  const starStudents = React.useMemo(() => {
    if (!students) return [];
    return students
      .filter(s => 
        !s.isDeleted && 
        s.photo && 
        s.name && 
        s.grade && 
        s.parentName && 
        s.phone && 
        s.email && 
        s.enrollmentDate && 
        s.dob && 
        s.address
      )
      .slice(0, 10);
  }, [students]);

  if (!schoolProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!landingPageSettings?.enabled && landingPageSettings !== undefined) {
    onLogin('ADMIN');
    return null;
  }

  const primaryColor = landingPageSettings?.primaryColor || '#4F46E5';
  const secondaryColor = landingPageSettings?.secondaryColor || '#F59E0B';

  return (
    <div className="min-h-screen bg-white text-[#1E293B] font-sans overflow-x-hidden" style={{ '--primary': primaryColor, '--secondary': secondaryColor } as any}>
      {/* Header */}
      <header className="sticky top-0 bg-white z-50 border-b border-slate-100 h-24 md:h-28">
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
            onClick={() => onLogin('ADMIN')}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg shrink-0"
          >
            Login <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* News Ticker */}
      <div className="sticky top-24 md:top-28 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-indigo-100/30 z-40 h-10 flex items-center overflow-hidden">
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
        <section className="pt-12 pb-24 px-4 text-center relative overflow-hidden min-h-[80vh] flex items-center justify-center">
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            {schoolProfile.banner ? (
              <img 
                src={schoolProfile.banner} 
                alt="School Banner" 
                className={`w-full h-full object-cover transition-all duration-700 ${
                  schoolProfile.bannerEffect === 'Blur' ? 'blur-md scale-110' :
                  schoolProfile.bannerEffect === 'Sepia' ? 'sepia' :
                  schoolProfile.bannerEffect === 'Grayscale' ? 'grayscale' :
                  schoolProfile.bannerEffect === 'Dark' ? 'brightness-50' : ''
                }`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-100"></div>
            )}
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
                onClick={() => onLogin('STUDENT')}
                className="w-full py-5 text-white font-black rounded-[2rem] text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3"
                style={{ backgroundImage: `linear-gradient(to right, ${secondaryColor}, ${secondaryColor})`, shadowColor: `${secondaryColor}20` }}
              >
                Enroll Now ✨
              </button>
              <button 
                onClick={() => onLogin('ADMIN')}
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
                  {schoolProfile.banner ? (
                    <img 
                      src={schoolProfile.banner} 
                      alt="School Building" 
                      className={`w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ${
                        schoolProfile.bannerEffect === 'Blur' ? 'blur-sm' :
                        schoolProfile.bannerEffect === 'Sepia' ? 'sepia' :
                        schoolProfile.bannerEffect === 'Grayscale' ? 'grayscale' :
                        schoolProfile.bannerEffect === 'Dark' ? 'brightness-50' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-950"></div>
                  )}
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
      {(landingPageSettings?.showFacilities !== false && facilities.length > 0) && (
        <section className="py-24 bg-white px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-4">Campus Environment</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Facilities & Infrastructure</h2>
              <div className="w-20 h-1.5 bg-purple-100 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="relative w-full h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 group animate-scale-in">
                <div 
                  className="absolute inset-0 flex transition-transform duration-1000 ease-out" 
                  style={{ transform: `translateX(-${currentFacilityIndex * 100}%)` }}
                >
                  {facilities.map((facility, idx) => (
                    <div key={idx} className="relative min-w-full h-full">
                      <img 
                        src={facility.image} 
                        className="w-full h-full object-cover cursor-pointer" 
                        alt={facility.title} 
                        referrerPolicy="no-referrer"
                        onClick={() => setSelectedGalleryImage({ url: facility.image, title: facility.title })}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-10 left-10 right-10 text-white max-w-2xl animate-slide-up">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block shadow-lg">
                          {facility.tag}
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 leading-tight">
                          {facility.title}
                        </h3>
                        <p className="text-sm md:text-lg font-medium opacity-80 line-clamp-2 leading-relaxed">
                          {facility.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <button 
                  onClick={prevFacility}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextFacility}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-20"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-6 right-10 flex gap-2 z-20">
                  {facilities.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentFacilityIndex(idx)} 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        currentFacilityIndex === idx ? 'bg-indigo-500 w-8' : 'bg-white/30 hover:bg-white/50 w-3'
                      }`}
                    ></button>
                  ))}
                </div>
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
            {currentMonthHolidays.length > 0 ? (
              currentMonthHolidays.map((event, idx) => {
                const colorMap: Record<string, string> = {
                  purple: 'border-purple-500 bg-purple-50/30 text-purple-600 ring-purple-500/20',
                  orange: 'border-orange-500 bg-orange-50/30 text-orange-600 ring-orange-500/20',
                  blue: 'border-blue-500 bg-blue-50/30 text-blue-600 ring-blue-500/20',
                  pink: 'border-pink-500 bg-pink-50/30 text-pink-600 ring-pink-500/20',
                  green: 'border-green-500 bg-green-50/30 text-green-600 ring-green-500/20',
                  indigo: 'border-indigo-500 bg-indigo-50/30 text-indigo-600 ring-indigo-500/20',
                  rose: 'border-rose-500 bg-rose-50/30 text-rose-600 ring-rose-500/20',
                  emerald: 'border-emerald-500 bg-emerald-50/30 text-emerald-600 ring-emerald-500/20',
                  red: 'border-red-500 bg-red-50/30 text-red-600 ring-red-500/20',
                  cyan: 'border-cyan-500 bg-cyan-50/30 text-cyan-600 ring-cyan-500/20',
                  slate: 'border-slate-500 bg-slate-50/30 text-slate-600 ring-slate-500/20',
                  yellow: 'border-yellow-500 bg-yellow-50/30 text-yellow-600 ring-yellow-500/20',
                };
                const colorClasses = colorMap[event.color] || colorMap.indigo;
                const [borderColor, bgColor, textColor, ringColor] = colorClasses.split(' ');

                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 border-l-8 ${borderColor} shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden ring-1 ${ringColor}`}
                  >
                    {/* Decorative Graphics */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 ${bgColor} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                      <Calendar size={120} className={textColor} />
                    </div>
                    <div className={`absolute bottom-0 right-0 w-24 h-24 border-4 ${borderColor} rounded-full opacity-5 -mb-12 -mr-12 group-hover:scale-150 transition-transform duration-1000`}></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-5">
                        <motion.div 
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          className={`w-14 h-14 rounded-2xl ${bgColor} ${textColor} flex items-center justify-center shadow-inner relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Calendar size={28} />
                        </motion.div>
                        <div>
                          <p className={`text-[10px] font-black ${textColor} uppercase tracking-[0.2em] mb-1`}>{event.displayDate}</p>
                          <h4 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">{event.title}</h4>
                        </div>
                      </div>
                      <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className={`px-4 py-1.5 ${bgColor} ${textColor} text-[9px] font-black uppercase tracking-widest rounded-full border border-current/10 shadow-sm`}
                      >
                        {event.type}
                      </motion.span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 relative z-10">
                      <button className={`text-[10px] font-black ${textColor} uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group/btn`}>
                        View Event Details 
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <ArrowRight size={14} />
                        </motion.span>
                      </button>
                      
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${bgColor} opacity-40`}></div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 font-medium">No holidays scheduled for this month.</p>
              </div>
            )}
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
            <p className="text-xs text-slate-500 font-medium mt-4">Recognizing students with exemplary profile completion and dedication.</p>
          </div>
          
          {starStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {starStudents.map((student, idx) => (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-10 rounded-[3.5rem] shadow-2xl text-center relative overflow-hidden border border-slate-50 group hover:scale-[1.02] transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:bg-rose-100 transition-colors"></div>
                  
                  <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center text-slate-400 relative z-10">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={64} />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-white z-20 shadow-lg">
                      {idx + 1}
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{student.name}</h4>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 bg-indigo-50 inline-block px-4 py-1 rounded-full">
                    Grade {student.grade}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Profile Status</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full"></div>
                      </div>
                      <span className="text-xs font-black text-emerald-600">100%</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-3xl group-hover:scale-125 transition-transform duration-500">🌟</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-[3.5rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                <Users size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">No Star Students Yet</h4>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Students with 100% profile completion and a profile photo will be featured here automatically.
              </p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Management Section */}
      {(landingPageSettings?.showManagement !== false) && (
        <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Governance & Enrollment</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Institutional Management</h2>
            <div className="h-1.5 bg-indigo-100 w-24 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="mb-12">
            {(schoolProfile.leadershipList && schoolProfile.leadershipList.length > 0) && (
              <>
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm">01</span>
                  Our Leadership
                </h3>
                <div className="max-w-3xl mx-auto space-y-8">
                {schoolProfile.leadershipList.map((leader, idx) => (
              <div key={leader.id || idx} className="bg-[#050B1A] rounded-[3.5rem] p-10 text-white overflow-hidden relative shadow-2xl">
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
        </>
      )}
    </div>

        <div className="mt-24 mb-12">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-sm">02</span>
              Admission Details
            </h3>
            
            {/* Admission Details Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3.5rem] p-10 text-white overflow-hidden relative shadow-2xl border border-indigo-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <ClipboardCheck size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Enrollment {schoolProfile.currentSession}</p>
                    <h3 className="text-3xl font-black tracking-tight">Admission Guidelines</h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                        <Clock size={14} /> Admission Timeline
                      </h4>
                      <ul className="space-y-4">
                        {(schoolProfile.admissionTimeline || [
                          { label: 'Registration Starts', value: 'January 15, 2024' },
                          { label: 'Entrance Assessment', value: 'February 20, 2024' },
                          { label: 'Result Declaration', value: 'March 05, 2024' },
                          { label: 'Session Commencement', value: 'April 02, 2024' }
                        ]).map((item, i) => (
                          <li key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <span className="text-xs font-bold text-slate-400">{item.label}</span>
                            <span className="text-xs font-black text-white">{item.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-orange-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Required Documents
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {(schoolProfile.requiredDocuments || [
                          'Original Birth Certificate',
                          'Previous School Transfer Certificate',
                          'Recent Passport Size Photographs (5)',
                          'Aadhar Card of Student & Parents',
                          'Previous Year Report Card'
                        ]).map((doc, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-200">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} /> Eligibility Criteria
                      </h4>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {schoolProfile.eligibilityCriteria || `Admission is granted based on academic merit and performance in the entrance assessment. 
                          Age criteria for Pre-Primary: 3+ years as of March 31st of the academic year.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-indigo-600 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-900/50">
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-black mb-1">Ready to Join Us?</h4>
                    <p className="text-xs font-bold text-indigo-100">Download the prospectus or apply online today.</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => schoolProfile.prospectusUrl && window.open(schoolProfile.prospectusUrl, '_blank')}
                      className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                    >
                      Download Form
                    </button>
                    <button 
                      onClick={() => schoolProfile.admissionFormUrl && window.open(schoolProfile.admissionFormUrl, '_blank')}
                      className="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                    >
                      Apply Online
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Gallery Section */}
      {(landingPageSettings?.showGallery !== false && imageSlider?.images && imageSlider.images.length > 0) && (
        <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Visual Journey</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Campus Life Gallery</h2>
            <div className="w-20 h-1.5 bg-indigo-200 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imageSlider.images.map((img, idx) => (
              <motion.div 
                key={img.id || idx}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => setSelectedGalleryImage({ url: img.url, title: img.title || `Gallery ${idx + 1}` })}
                className="aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white cursor-pointer group relative"
              >
                <img src={img.url} alt={img.title || `Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl">
                    <Trophy size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Image Popup Modal */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-10 animate-fade-in"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white md:text-slate-800 md:bg-slate-100 md:hover:bg-slate-200 transition-all shadow-lg"
              >
                <X size={24} />
              </button>

              {/* Image Area */}
              <div className="md:w-2/3 bg-slate-900 flex items-center justify-center relative group min-h-[300px]">
                <img 
                  src={selectedGalleryImage.url} 
                  alt={selectedGalleryImage.title} 
                  className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info & Actions Area */}
              <div className="md:w-1/3 p-10 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                      🖼️
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Campus Gallery</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">
                        {selectedGalleryImage.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                    Capturing the vibrant life and state-of-the-art infrastructure at {schoolProfile.name}.
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedGalleryImage.url;
                      link.download = `campus-image-${Date.now()}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                  >
                    📥 Download Image
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedGalleryImage.title,
                          text: `Check out this image from ${schoolProfile.name}`,
                          url: selectedGalleryImage.url,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(selectedGalleryImage.url);
                        alert('Image link copied to clipboard! 🔗');
                      }
                    }}
                    className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95"
                  >
                    📤 Share Image
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ecosystem Section */}
      {(landingPageSettings?.showEcosystem !== false) && (
        <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Seamless Integration</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ecosystem of Learning</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-10">
            {[
              { title: 'Administration', desc: 'Robust oversight of school operations and institutional growth.', icon: <ShieldCheck size={40} />, color: 'blue', secondary: 'indigo' },
              { title: 'Employees & Staff', desc: 'AI-assisted lesson planning and real-time student engagement.', icon: <Users size={40} />, color: 'purple', secondary: 'fuchsia' },
              { title: 'Students and Parents', desc: 'Transparency into student progress and behavioral development.', icon: <Users size={40} />, color: 'orange', secondary: 'amber' },
            ].map((item, idx) => {
              const colorMap: Record<string, string> = {
                blue: 'from-blue-600 to-indigo-700 shadow-blue-500/20 ring-blue-500/20 bg-blue-50/50 text-blue-600',
                purple: 'from-purple-600 to-fuchsia-700 shadow-purple-500/20 ring-purple-500/20 bg-purple-50/50 text-purple-600',
                orange: 'from-orange-500 to-amber-600 shadow-orange-500/20 ring-orange-500/20 bg-orange-50/50 text-orange-600',
              };
              const [btnFrom, btnTo, shadowColor, ringColor, iconBg, iconColor] = colorMap[item.color].split(' ');

              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`bg-gradient-to-br from-white via-white to-${item.color}-50/30 p-12 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center group relative overflow-hidden ring-1 ${ringColor}`}
                >
                  {/* Background Decorations */}
                  <div className={`absolute -top-20 -right-20 w-64 h-64 bg-${item.color}-500/5 rounded-full blur-3xl group-hover:bg-${item.color}-500/10 transition-colors duration-700`}></div>
                  <div className={`absolute -bottom-20 -left-20 w-64 h-64 bg-${item.secondary}-500/5 rounded-full blur-3xl group-hover:bg-${item.secondary}-500/10 transition-colors duration-700`}></div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8, ease: "anticipate" }}
                      className={`w-24 h-24 rounded-[2.5rem] ${iconBg} ${iconColor} flex items-center justify-center mb-8 shadow-inner relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {item.icon}
                    </motion.div>
                    
                    <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight group-hover:text-indigo-950 transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 max-w-md mx-auto">{item.desc}</p>
                    
                    <button 
                      onClick={() => {
                        if (item.title === 'Administration' || item.title === 'Employees & Staff') {
                          onLogin('ADMIN');
                        } else {
                          onLogin('STUDENT');
                        }
                      }}
                      className={`w-full py-5 bg-gradient-to-r ${btnFrom} ${btnTo} text-white font-black rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl ${shadowColor} flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all`}
                    >
                      Access Portal <ArrowRight size={18} />
                    </button>
                  </div>

                  {/* Floating Icon Decoration */}
                  <div className={`absolute top-10 right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 rotate-12 group-hover:rotate-0 transition-transform duration-700`}>
                    {item.icon}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Institutional Portal Section */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-indigo-500/10 transition-all duration-700">
            <div className="md:w-1/2 bg-slate-900 text-white p-16 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Verified Institution</p>
                <h3 className="text-5xl font-black uppercase tracking-tighter leading-[0.9]">Institutional<br/><span className="text-indigo-500">Portal</span></h3>
                <p className="text-sm text-slate-400 font-medium mt-8 leading-relaxed max-w-xs">Official digital gateway for verification and institutional transparency.</p>
                
                <div className="mt-12 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <ShieldCheck className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Security Status</p>
                    <p className="text-xs font-bold text-emerald-400 uppercase">Fully Encrypted</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-16 flex flex-col items-center justify-center bg-white relative">
              <div className="bg-slate-50 p-8 rounded-[3.5rem] shadow-inner border-8 border-white mb-10 relative hover:scale-105 hover:-rotate-2 transition-all duration-700 cursor-pointer group/qr ring-1 ring-slate-100">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${schoolProfile.name}|${schoolProfile.address}`)}`} alt="School QR" className="w-56 h-56 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-[3rem]">
                  <span className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">Scan to Verify</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-black text-slate-900 text-2xl uppercase leading-none tracking-tighter mb-3">{schoolProfile.name}</h4>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Institutional Profile</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-black text-emerald-600 uppercase">Verified</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                    <p className="text-xs font-black text-indigo-600 uppercase">Academic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(landingPageSettings?.showStats !== false) && (
        <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-orange-500 text-white" style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-y-16 gap-x-8 text-center">
          <div className="flex flex-col items-center">
            <GraduationCap size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">
              {(students?.length || 0).toLocaleString()}+
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Students</div>
          </div>
          <div className="flex flex-col items-center">
            <Users size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">
              {(employees?.length || 0).toLocaleString()}+
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Employees & Staff</div>
          </div>
          <div className="flex flex-col items-center">
            <Palmtree size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">
              {schoolProfile.campusAcres || '25'}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Campus Acres</div>
          </div>
          <div className="flex flex-col items-center">
            <Award size={40} className="mb-4 opacity-60" />
            <div className="text-5xl font-black mb-2 tracking-tight">
              {schoolProfile.successRate || '99.8%'}
            </div>
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
                {['About Us', 'Calendar'].map((link, idx) => (
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
                  <button key={idx} onClick={() => onLogin(link === 'Students and Parents' ? 'STUDENT' : 'ADMIN')} className="w-full p-6 bg-white rounded-[2rem] flex items-center justify-center text-sm font-black text-slate-800 shadow-sm hover:shadow-md transition-all border border-slate-50">
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
