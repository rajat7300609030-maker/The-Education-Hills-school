import React from 'react';
import { ViewState, SchoolProfileData, AppSettings } from '../types';
import AdSenseUnit from './AdSenseUnit';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  schoolProfile: SchoolProfileData;
  settings: AppSettings;
  userRole?: 'ADMIN' | 'STUDENT';
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isCollapsed, onToggle, schoolProfile, settings, userRole = 'ADMIN', onLogout }) => {
  const isAdmin = userRole === 'ADMIN';
  const isStudent = userRole === 'STUDENT';
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: '📊', visible: true },
    // Student specific labels and restricted views
    { id: ViewState.PARENT_PROFILE, label: 'Parent Group', icon: '👨‍👩‍👧‍👦', visible: isStudent },
    { id: ViewState.FEES, label: 'Fees Manager', icon: '💰', visible: isStudent },
    
    // Admin only views
    { id: ViewState.STUDENTS, label: 'Students', icon: '🎓', visible: isAdmin },
    { id: ViewState.EMPLOYEES, label: 'Employees', icon: '👔', visible: isAdmin },
    { id: ViewState.FEES, label: 'Fees Manager', icon: '💰', visible: isAdmin },
    { id: ViewState.EXPENSES, label: 'Expenses', icon: '💸', visible: isAdmin },
    { id: ViewState.RECYCLE_BIN, label: 'Recycle Bin', icon: '🗑️', visible: isAdmin },
  ];

  const bottomItems = [
    { id: ViewState.SCHOOL_PROFILE, label: 'School Profile', icon: '🏫', visible: isAdmin },
    { id: ViewState.USER_PROFILE, label: 'My Profile', icon: '👤', visible: isAdmin },
    { id: ViewState.STUDENT_PROFILE, label: 'My Profile', icon: '👤', visible: isStudent },
    { id: ViewState.SETTINGS, label: 'App Settings', icon: '⚙️', visible: isAdmin },
  ];

  const handleItemClick = (id: ViewState) => {
    onChangeView(id);
    // Automatically fully hide the sidebar when an option is selected
    if (!isCollapsed) {
      onToggle();
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      if (onLogout) onLogout();
      if (!isCollapsed) onToggle();
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }, 1500);
  };

  const getLightGradient = (view: ViewState) => {
    switch(view) {
      case ViewState.DASHBOARD: return 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50';
      case ViewState.STUDENTS: 
      case ViewState.STUDENT_PROFILE: return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50';
      case ViewState.EMPLOYEES:
      case ViewState.EMPLOYEE_PROFILE: return 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50';
      case ViewState.FEES: return 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50';
      case ViewState.EXPENSES: return 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-100/50';
      case ViewState.RECYCLE_BIN: return 'bg-gradient-to-r from-gray-50 to-stone-50 border border-gray-200/50';
      case ViewState.SCHOOL_PROFILE: return 'bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100/50';
      case ViewState.PARENT_PROFILE: return 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100/50';
      case ViewState.USER_PROFILE: return 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50';
      case ViewState.SETTINGS: return 'bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-200/50';
      case ViewState.NEW_INQUIRY: return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50';
      default: return 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50';
    }
  };

  const getActiveGradient = (view: ViewState) => {
    switch(view) {
      case ViewState.DASHBOARD: 
        return 'bg-gradient-to-r from-slate-900 via-slate-800 to-gray-900 shadow-lg shadow-slate-400/20';
      case ViewState.STUDENTS: 
      case ViewState.STUDENT_PROFILE:
        return 'bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-900 shadow-lg shadow-indigo-400/20';
      case ViewState.EMPLOYEES:
      case ViewState.EMPLOYEE_PROFILE:
        return 'bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 shadow-lg shadow-amber-400/20';
      case ViewState.FEES: 
        return 'bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 shadow-lg shadow-teal-400/20';
      case ViewState.EXPENSES:
        return 'bg-gradient-to-r from-red-900 via-rose-900 to-pink-900 shadow-lg shadow-rose-400/20';
      case ViewState.RECYCLE_BIN: 
        return 'bg-gradient-to-r from-gray-900 via-stone-900 to-neutral-900 shadow-lg shadow-gray-400/20';
      case ViewState.SCHOOL_PROFILE: 
        return 'bg-gradient-to-r from-purple-900 via-fuchsia-900 to-pink-900 shadow-lg shadow-purple-400/20';
      case ViewState.PARENT_PROFILE:
        return 'bg-gradient-to-r from-teal-800 via-cyan-800 to-blue-800 shadow-lg shadow-cyan-400/20';
      case ViewState.USER_PROFILE: 
        return 'bg-gradient-to-r from-indigo-900 via-blue-900 to-sky-900 shadow-lg shadow-blue-400/20';
      case ViewState.SETTINGS: 
        return 'bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 shadow-lg shadow-slate-400/20';
      case ViewState.NEW_INQUIRY:
        return 'bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-900 shadow-lg shadow-indigo-400/20';
      default: 
        return 'bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg shadow-slate-400/20';
    }
  };

  const renderButton = (item: { id: ViewState; label: string; icon: string; visible: boolean }) => {
    if (!item.visible) return null;
    const isActive = currentView === item.id;
    return (
      <button
        key={`${item.id}-${item.label}`}
        onClick={() => handleItemClick(item.id)}
        title={isCollapsed ? item.label : ''}
        data-view-id={item.id}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
          isActive
            ? `${getActiveGradient(item.id)} text-white scale-[1.02] shadow-xl`
            : `${getLightGradient(item.id)} text-slate-600 hover:scale-[1.01] hover:shadow-md hover:border-indigo-200`
        }`}
      >
        <span className={`text-2xl transition-transform duration-300 ${!isActive ? 'group-hover:scale-110' : ''}`}>{item.icon}</span>
        <span className="font-black whitespace-nowrap overflow-hidden w-auto opacity-100 relative uppercase tracking-tight text-[11px]">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      <aside 
        className={`${
          isCollapsed ? 'w-0 border-none' : 'w-64 border-r'
        } bg-white border-slate-200 flex flex-col h-full shrink-0 z-20 transition-all duration-300 ease-in-out relative overflow-hidden`}
      >
        {/* Toggle Button (Only visible when open to close manually) */}
      <button
        onClick={onToggle}
        className={`absolute -right-3 top-6 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full shadow-sm hover:text-indigo-600 hover:border-indigo-200 transition-colors z-50 focus:outline-none ${isCollapsed ? 'hidden' : 'block'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Dynamic Header with School Profile */}
      <div className={`flex flex-col border-b border-slate-100 transition-all duration-300 min-w-[16rem] bg-slate-50/50 ${isCollapsed ? 'p-2 items-center h-20 justify-center' : 'p-4'}`}>
          <div className="flex items-center gap-3 w-full">
               {/* Logo */}
               <div className={`rounded-xl bg-white border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
                    {schoolProfile?.logo ? (
                       <img src={schoolProfile.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                       <span className="text-2xl">🏫</span>
                    )}
               </div>
               
               {/* Text Details */}
               <div className={`flex-col overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'hidden opacity-0' : 'flex opacity-100'}`}>
                    <h1 className="text-base font-black text-slate-800 leading-tight truncate w-44" title={schoolProfile?.name || "School Manager"}>
                       {schoolProfile?.name || "School Manager"}
                    </h1>
                    {schoolProfile?.motto && (
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide truncate mt-0.5 w-44 opacity-80" title={schoolProfile.motto}>
                           {schoolProfile.motto}
                        </p>
                    )}
               </div>
          </div>

          {/* Session Badge (Only shown when expanded) */}
          {!isCollapsed && (
             <div className="mt-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Session</span>
                 <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 rounded">{schoolProfile?.currentSession || 'N/A'}</span>
             </div>
          )}
      </div>

      <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden min-w-[16rem] pt-4 flex flex-col">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 h-5">
           Main
        </div>
        {menuItems.map(renderButton)}
        
        <div className="my-4 border-t border-slate-100"></div>
        
        {isAdmin && (
            <>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 h-5">
                    Settings
                </div>
                {bottomItems.map(renderButton)}
            </>
        )}

        {isStudent && (
            <>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 h-5">
                    Account
                </div>
                {bottomItems.map(renderButton)}
            </>
        )}

        {/* AdSense Sidebar Unit */}
        {settings.adsense?.enabled && settings.adsense.clientId && settings.adsense.units?.find(u => u.placement === 'sidebar') && (
          <div className="mt-4 px-2">
            {(() => {
              const unit = settings.adsense.units.find(u => u.placement === 'sidebar')!;
              return (
                <AdSenseUnit 
                  clientId={settings.adsense.clientId} 
                  unitId={unit.unitId} 
                  format={unit.format} 
                  testMode={settings.adsense.testMode}
                  className="w-full"
                />
              );
            })()}
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-auto pt-4 pb-2">
            <button
                onClick={handleLogoutClick}
                title={isCollapsed ? 'Logout' : ''}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200/50"
            >
                <span className="text-2xl transition-transform duration-300 group-hover:-translate-x-1">🚪</span>
                <span className="font-bold whitespace-nowrap overflow-hidden w-auto opacity-100 relative">
                    Logout
                </span>
            </button>
        </div>
      </nav>

      <div className="p-4 text-xs text-center text-slate-400 whitespace-nowrap overflow-hidden border-t border-slate-50 min-w-[16rem]">
          <span>v1.10.0 • React</span>
      </div>
    </aside>

    {/* Logout Confirmation Modal - Moved outside aside for full-page coverage */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl border border-white/20 animate-scale-in relative overflow-hidden">
          {isLoggingOut ? (
            <div className="py-10 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Logging Out...</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Securing your session</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-red-100/50">🚪</div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">Confirm Logout</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed px-4">Are you sure you want to end your current session?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmLogout}
                  className="w-full py-4 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                >
                  Yes, Logout Now
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-slate-50 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  No, Stay Logged In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Sidebar;