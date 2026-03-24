import React, { useState, useRef, useEffect } from 'react';
import { ViewState, UserProfileData, AppNotification, SchoolProfileData } from '../types';

interface TopBarProps {
  currentView: ViewState;
  user: UserProfileData;
  schoolProfile: SchoolProfileData;
  session: string;
  notifications?: AppNotification[];
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenProfile: () => void;
  onClearNotifications?: () => void;
  userRole?: 'ADMIN' | 'STUDENT';
  syncStatus?: 'synced' | 'syncing' | 'error';
}

const TopBar: React.FC<TopBarProps> = ({ 
  currentView, 
  user, 
  schoolProfile,
  session, 
  notifications = [], 
  isSidebarCollapsed, 
  onToggleSidebar, 
  onOpenProfile,
  onClearNotifications,
  userRole = 'ADMIN',
  syncStatus = 'synced'
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const getTitle = (view: ViewState) => {
    switch(view) {
      case ViewState.DASHBOARD: return '📊 Dashboard';
      case ViewState.STUDENTS: return '🎓 Students';
      case ViewState.STUDENT_PROFILE: return '👤 Student Profile';
      case ViewState.PARENT_PROFILE: return '👨‍👩‍👧‍👦 Parent Profile';
      case ViewState.EMPLOYEES: return '👔 Employees';
      case ViewState.EMPLOYEE_PROFILE: return '👤 Employee Profile';
      case ViewState.FEES: return '💰 Fees Manager';
      case ViewState.EXPENSES: return '💸 Expenses';
      case ViewState.RECYCLE_BIN: return '🗑️ Recycle Bin';
      case ViewState.SCHOOL_PROFILE: return '🏫 School Profile';
      case ViewState.USER_PROFILE: return '👤 User Profile';
      case ViewState.SETTINGS: return '⚙️ App Settings';
      default: return '🏫 EmojiSchool';
    }
  };

  const getGradientClass = (view: ViewState) => {
    switch(view) {
      case ViewState.DASHBOARD: return 'from-slate-900 via-slate-800 to-gray-900';
      case ViewState.STUDENTS: 
      case ViewState.STUDENT_PROFILE:
      case ViewState.PARENT_PROFILE: return 'from-blue-900 via-indigo-900 to-violet-900';
      case ViewState.EMPLOYEES:
      case ViewState.EMPLOYEE_PROFILE: return 'from-amber-900 via-orange-900 to-yellow-900';
      case ViewState.FEES: return 'from-emerald-900 via-teal-900 to-cyan-900';
      case ViewState.EXPENSES: return 'from-red-900 via-rose-900 to-pink-900';
      case ViewState.RECYCLE_BIN: return 'from-gray-900 via-stone-900 to-neutral-900';
      case ViewState.SCHOOL_PROFILE: return 'from-purple-900 via-fuchsia-900 to-pink-900';
      case ViewState.USER_PROFILE: return 'from-indigo-900 via-blue-900 to-sky-900';
      case ViewState.SETTINGS: return 'from-slate-800 via-gray-800 to-zinc-800';
      default: return 'from-slate-900 to-slate-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '🚨';
      default: return 'ℹ️';
    }
  };

  return (
    <header className={`h-16 pt-[env(safe-area-inset-top)] bg-gradient-to-r ${getGradientClass(currentView)} shadow-md flex items-center px-6 z-40 shrink-0 border-b border-white/10`}>
      <button 
        onClick={onToggleSidebar}
        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <div className="flex-1 flex items-center justify-start gap-4 md:gap-6 ml-4">
        <h1 className="text-lg md:text-xl font-black text-white tracking-tight animate-fade-in">
          {getTitle(currentView)}
        </h1>
        <div className="h-4 w-px bg-white/20 hidden md:block"></div>
        <span className="text-[10px] md:text-xs font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 tracking-widest">
          {session}
        </span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative" ref={popoverRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all relative active:scale-90"
          >
            <span className="text-xl">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-800 text-sm tracking-tight">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={onClearNotifications}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-3xl mb-2">🔔</div>
                    <p className="text-slate-400 text-xs font-bold">No new notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                      <span className="text-lg shrink-0">{getNotificationIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(n.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/10 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-sm font-black shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[10px] font-black leading-none opacity-60 uppercase tracking-widest">{userRole}</p>
            <p className="text-xs font-bold leading-tight truncate max-w-[100px]">{user.name}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;