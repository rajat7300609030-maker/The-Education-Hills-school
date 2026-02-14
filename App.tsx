import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Employees from './components/Employees';
import Fees from './components/Fees';
import Expenses from './components/Expenses';
import RecycleBin from './components/RecycleBin';
import Profiles from './components/Profiles';
import Settings from './components/Settings';
import StudentProfile from './components/StudentProfile';
import ParentProfile from './components/ParentProfile';
import NotificationToast from './components/NotificationToast';
import LockScreen from './components/LockScreen';
import { ViewState, AppData, Student, Employee, FeeRecord, ExpenseRecord, AppSettings, UserProfileData, AppNotification } from './types';
import { supabase } from './lib/supabase';

const INITIAL_DATA: AppData = {
  students: [],
  employees: [],
  classes: ['10-A', '11-B', '12-A'],
  feeCategories: ['Tuition', 'Bus', 'Books', 'Uniform'],
  fees: [],
  expenses: [],
  schoolProfile: {
    name: 'Education Hills',
    address: 'Mountain View Campus, City Center',
    contactEmail: 'admin@educationhills.edu',
    contactNumber: '+1 234 567 890',
    motto: 'Knowledge is Power',
    website: 'www.educationhills.edu',
    sessions: ['2024-2025', '2025-2026'],
    currentSession: '2024-2025',
    affiliationNumber: 'ST-90210',
    principalName: 'Dr. Jane Smith',
    board: 'C.B.S.E',
    establishedYear: '1996',
    bannerEffect: 'Standard',
    logoSize: 100,
    termsAndConditions: '',
    authorizedSignature: '',
    departments: ['Science', 'Commerce', 'Arts']
  },
  userProfile: {
    name: 'Administrator',
    role: 'Principal',
    email: 'admin@school.com',
    bio: 'Dedicated to excellence in education and school management.',
    userId: 'ADM-001',
    dateOfBirth: '1985-05-15',
    contactNumber: '+1 987 654 321',
    joiningDate: new Date().toISOString().split('T')[0],
    address: 'Faculty Residence, Block A',
    photo: ''
  },
  settings: {
    theme: 'light',
    fontSize: 100,
    language: 'English (US)',
    enableNotifications: true,
    enableAutoBackup: true,
    currency: 'INR',
    notificationLimit: 10,
    notificationStyle: 'Modern',
    enableLateFees: false,
    lateFeePercentage: 0,
    lateFeeGracePeriod: 0,
    imageSlider: {
      enabled: true,
      autoplay: true,
      interval: 4000,
      images: [
          {
              id: 'default-1',
              url: 'https://images.unsplash.com/photo-1523050853063-913ec9823dd2?auto=format&fit=crop&w=1200&q=80',
              title: 'Welcome to Our Campus',
              description: 'Providing a world-class environment for the next generation of leaders.'
          }
      ]
    },
    security: {
        enableAppLock: true,
        lockTimeout: 0,
        pin: '0000'
    }
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<AppNotification[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'STUDENT'>('ADMIN');
  const [currentStudentId, setCurrentStudentId] = useState<string | undefined>(undefined);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentIdToEdit, setStudentIdToEdit] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<{name: string, phone: string, address: string} | null>(null);
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (data.settings.enableNotifications || type === 'error') {
        setNotification({ message, type });
    }
    const newNotify: AppNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotificationHistory(prev => [newNotify, ...prev].slice(0, 10));
  };

  useEffect(() => {
    const fetchSupabaseData = async (retries = 2) => {
      try {
        const [studentsResp, employeesResp, feesResp, expensesResp] = await Promise.all([
          supabase.from('students').select('*').order('name'),
          supabase.from('employees').select('*').order('name'),
          supabase.from('fees').select('*'),
          supabase.from('expenses').select('*')
        ]);
        
        let configResp = null;
        try {
            configResp = await supabase.from('config').select('*').eq('id', 1).maybeSingle();
        } catch (confErr) {
            console.warn("Config fetch skipped.");
        }

        if (expensesResp.error) {
            const errMsg = expensesResp.error.message.toLowerCase();
            if (errMsg.includes('security policy') || errMsg.includes('rls')) {
                setDbSyncError("RLS_BLOCKED");
                showNotification("🚨 Security Block: Row-Level Security is preventing data saves. Run the SQL fix.", "error");
            } else if (errMsg.includes('column "session" does not exist') || errMsg.includes('scheme cache')) {
                setDbSyncError("MISSING_COLUMN");
                showNotification("🚨 Database Cache Error: Session column is missing. Run the SQL fix.", "error");
            }
        } else {
            setDbSyncError(null);
        }

        const fetchedFees = (feesResp.data || INITIAL_DATA.fees) as FeeRecord[];
        const fetchedStudents = (studentsResp.data || INITIAL_DATA.students) as Student[];
        const fetchedEmployees = (employeesResp.data || INITIAL_DATA.employees) as Employee[];
        const fetchedExpenses = (expensesResp.data || INITIAL_DATA.expenses) as ExpenseRecord[];

        setData(prev => ({
          ...prev,
          students: fetchedStudents,
          employees: fetchedEmployees,
          fees: fetchedFees,
          expenses: fetchedExpenses,
          schoolProfile: configResp?.data?.school_profile || prev.schoolProfile,
          userProfile: configResp?.data?.user_profile || prev.userProfile,
          settings: configResp?.data?.settings || prev.settings,
          classes: configResp?.data?.classes || prev.classes,
          feeCategories: configResp?.data?.fee_categories || prev.feeCategories,
        }));

        // --- UNIFIED 30-DAY AUTO-CLEANUP LOGIC ---
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let totalCleaned = 0;

        const cleanupTable = async (table: string, items: any[]) => {
            const expired = items.filter(i => i.isDeleted && i.deletedAt && new Date(i.deletedAt) < thirtyDaysAgo);
            if (expired.length > 0) {
                const expiredIds = expired.map(i => i.id);
                await supabase.from(table).delete().in('id', expiredIds);
                totalCleaned += expired.length;
                return expiredIds;
            }
            return [];
        };

        const cleanedFees = await cleanupTable('fees', fetchedFees);
        const cleanedStudents = await cleanupTable('students', fetchedStudents);
        const cleanedEmployees = await cleanupTable('employees', fetchedEmployees);
        const cleanedExpenses = await cleanupTable('expenses', fetchedExpenses);

        if (totalCleaned > 0) {
            setData(prev => ({
                ...prev,
                fees: prev.fees.filter(f => !cleanedFees.includes(f.id)),
                students: prev.students.filter(s => !cleanedStudents.includes(s.id)),
                employees: prev.employees.filter(e => !cleanedEmployees.includes(e.id)),
                expenses: prev.expenses.filter(ex => !cleanedExpenses.includes(ex.id)),
            }));
            showNotification(`🧹 Auto-cleanup: Removed ${totalCleaned} items older than 30 days`, 'info');
        }

      } catch (err: any) {
        console.error("Database Connection Issue:", err.message || "Network Error");
        if (retries > 0) {
            setTimeout(() => fetchSupabaseData(retries - 1), 2000);
        } else {
            showNotification("⚠️ Offline Mode: Cloud sync is limited.", "info");
        }
      }
    };
    fetchSupabaseData();
  }, []);

  useEffect(() => {
    if (data.settings.fontSize) {
      document.documentElement.style.fontSize = `${data.settings.fontSize}%`;
    }
  }, [data.settings.fontSize]);

  useEffect(() => {
    const syncConfig = async () => {
      if (data.students.length === 0 && data.schoolProfile.name === INITIAL_DATA.schoolProfile.name) return;
      try {
        await supabase.from('config').upsert({
          id: 1,
          school_profile: data.schoolProfile,
          user_profile: data.userProfile,
          settings: data.settings,
          classes: data.classes,
          fee_categories: data.feeCategories,
          updated_at: new Date().toISOString()
        });
      } catch (err) {}
    };
    const timeout = setTimeout(syncConfig, 5000);
    return () => clearTimeout(timeout);
  }, [data.schoolProfile, data.userProfile, data.settings, data.classes, data.feeCategories]);

  const handleClearNotifications = () => {
    setNotificationHistory([]);
    showNotification('🔔 Notification history cleared', 'info');
  };

  const currencySymbol = useMemo(() => {
    switch(data.settings.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return data.settings.currency;
    }
  }, [data.settings.currency]);

  const handleAddStudent = async (student: Omit<Student, 'id' | 'isDeleted'>) => {
    const currentSession = data.schoolProfile.currentSession;
    const existingIds = data.students.map(s => {
      const match = s.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const nextNum = (existingIds.length > 0 ? Math.max(...existingIds) : 0) + 1;
    const newId = `ST${nextNum.toString().padStart(2, '0')}`;
    const newStudent: Student = { ...student, id: newId, session: currentSession, isDeleted: false };
    setData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    const { error } = await supabase.from('students').insert(newStudent);
    if (error) {
      setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== newId) }));
      showNotification(`❌ Sync Failed: ${error.message}`, 'error');
    } else {
      showNotification(`✅ Registered ${newStudent.name}`, 'success');
    }
  };

  const handleAddEmployee = async (employee: Omit<Employee, 'id' | 'isDeleted'>) => {
    const currentSession = data.schoolProfile.currentSession;
    const nextNum = (data.employees.length > 0 ? Math.max(...data.employees.map(e => parseInt(e.id.replace(/\D/g, '')) || 0)) : 0) + 1;
    const newId = `EMP${nextNum.toString().padStart(3, '0')}`;
    const newEmployee: Employee = { ...employee, id: newId, session: currentSession, isDeleted: false };
    setData(prev => ({ ...prev, employees: [...(prev.employees || []), newEmployee] }));
    const { error } = await supabase.from('employees').insert(newEmployee);
    if (error) {
      setData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== newId) }));
      showNotification(`❌ Sync Failed: ${error.message}`, 'error');
    }
  };

  const handleEditEmployee = async (updatedEmployee: Employee) => {
    setData(prev => ({ ...prev, employees: prev.employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e) }));
    await supabase.from('employees').upsert(updatedEmployee);
  };

  const handleDeleteEmployee = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, employees: prev.employees.map(e => e.id === id ? { ...e, isDeleted: true, deletedAt: now } : e) }));
    await supabase.from('employees').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    showNotification('🗑️ Employee moved to Recycle Bin', 'info');
  };

  const handleAddFee = async (fee: Omit<FeeRecord, 'id' | 'isDeleted'>) => {
    const currentSession = data.schoolProfile.currentSession;
    const newFee: FeeRecord = { 
        ...fee, 
        id: `FEE-${Date.now()}`, 
        isDeleted: false, 
        session: currentSession 
    };
    
    setData(prev => ({ ...prev, fees: [...prev.fees, newFee] }));
    const { error } = await supabase.from('fees').insert(newFee);
    if (error) {
      setData(prev => ({ ...prev, fees: prev.fees.filter(f => f.id !== newFee.id) }));
      showNotification(`🚨 Record Error: ${error.message}`, 'error');
    } else {
      showNotification('✅ Fee payment recorded', 'success');
    }
  };

  const handleUpdateFee = async (updatedFee: FeeRecord) => {
    setData(prev => ({ 
      ...prev, 
      fees: prev.fees.map(f => f.id === updatedFee.id ? updatedFee : f) 
    }));
    const { error } = await supabase.from('fees').upsert(updatedFee);
    if (error) {
      showNotification(`🚨 Record Sync Error: ${error.message}`, 'error');
    } else {
      showNotification('✅ Fee record updated', 'success');
    }
  };

  const handleDeleteFee = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, fees: prev.fees.map(f => f.id === id ? { ...f, isDeleted: true, deletedAt: now } : f) }));
    await supabase.from('fees').update({ isDeleted: true, deletedAt: now }).eq('id', id);
  };

  const handleAddExpense = async (expense: Omit<ExpenseRecord, 'id' | 'isDeleted'>) => {
    const currentSession = data.schoolProfile.currentSession;
    const newExpense: ExpenseRecord = { 
        ...expense, 
        id: `EXP-${Date.now()}`, 
        isDeleted: false, 
        session: currentSession 
    };
    
    setData(prev => ({ ...prev, expenses: [...(prev.expenses || []), newExpense] }));
    const { error } = await supabase.from('expenses').insert({ ...newExpense, description: newExpense.description || '' });
    
    if (error) {
      setData(prev => ({ ...prev, expenses: (prev.expenses || []).filter(e => e.id !== newExpense.id) }));
      showNotification(`❌ Database Sync Failed: ${error.message}`, 'error');
    } else {
      showNotification('✅ Expense history permanently saved 🔒', 'success');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === id ? { ...e, isDeleted: true, deletedAt: now } : e) }));
    await supabase.from('expenses').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    showNotification('🗑️ Expense moved to Recycle Bin', 'info');
  };

  const handleEditStudent = async (updatedStudent: Student) => {
    setData(prev => ({ ...prev, students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s) }));
    await supabase.from('students').upsert(updatedStudent);
    showNotification('✅ Student profile updated', 'success');
  };

  const handleSoftDeleteStudent = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, students: prev.students.map(s => s.id === id ? { ...s, isDeleted: true, deletedAt: now } : s) }));
    await supabase.from('students').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    showNotification('🗑️ Student moved to Recycle Bin', 'info');
  };

  const handleUpdateSettings = (settings: AppSettings) => {
    setData(prev => ({ ...prev, settings }));
    showNotification('⚙️ Settings updated', 'info');
  };

  const handleFactoryReset = async () => {
    try {
      showNotification('⏳ Clearing records...', 'info');
      await Promise.all([
        supabase.from('students').delete().neq('id', 'NONE'),
        supabase.from('employees').delete().neq('id', 'NONE'),
        supabase.from('fees').delete().neq('id', 'NONE'),
        supabase.from('expenses').delete().neq('id', 'NONE')
      ]);
      setData(INITIAL_DATA);
      showNotification('🔥 Database factory reset complete', 'success');
    } catch (err) {
      showNotification('❌ Reset failed', 'error');
    }
  };

  const renderContent = () => {
    const currentSession = data.schoolProfile.currentSession;
    const sessionStudents = data.students.filter(s => s.session === currentSession);
    const sessionEmployees = (data.employees || []).filter(e => e.session === currentSession);
    const sessionFees = data.fees.filter(f => f.session === currentSession);
    const sessionExpenses = (data.expenses || []).filter(e => e.session === currentSession);

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard data={data} currency={currencySymbol} onUpdateSettings={handleUpdateSettings} onNavigateToFees={() => setCurrentView(ViewState.FEES)} onNavigateToExpenses={() => setCurrentView(ViewState.EXPENSES)} onViewStudentProfile={id => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }} onNavigateToSettings={() => setCurrentView(ViewState.SETTINGS)} onDeleteFee={handleDeleteFee} onDeleteExpense={handleDeleteExpense} userRole={userRole} currentStudentId={currentStudentId} />;
      case ViewState.STUDENTS:
        return <Students students={sessionStudents} classes={data.classes} fees={sessionFees} currency={currencySymbol} onAddStudent={handleAddStudent} onEditStudent={handleEditStudent} onDeleteStudent={handleSoftDeleteStudent} onAddClass={(name) => setData(prev => ({ ...prev, classes: [...prev.classes, name] }))} onDeleteClass={(name) => setData(prev => ({ ...prev, classes: prev.classes.filter(c => c !== name) }))} onNavigateToFees={id => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }} onViewProfile={id => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }} onViewParent={s => { setSelectedParent({ name: s.parentName, phone: s.phone, address: s.address || '' }); setCurrentView(ViewState.PARENT_PROFILE); }} initialEditingId={studentIdToEdit} onClearEditingId={() => setStudentIdToEdit(null)} />;
      case ViewState.EMPLOYEES:
        return <Employees employees={sessionEmployees} currency={currencySymbol} onAddEmployee={handleAddEmployee} onEditEmployee={handleEditEmployee} onDeleteEmployee={handleDeleteEmployee} onNotify={showNotification} />;
      case ViewState.STUDENT_PROFILE:
        {
           const studentIdToView = userRole === 'STUDENT' ? currentStudentId : selectedStudentId;
           const student = sessionStudents.find(s => s.id === studentIdToView);
           if (!student) return <div className="p-8 text-center text-slate-500 font-bold">Student not found.</div>;
           return <StudentProfile student={student} fees={sessionFees} schoolData={data.schoolProfile} currency={currencySymbol} onBack={() => setCurrentView(userRole === 'STUDENT' ? ViewState.DASHBOARD : ViewState.STUDENTS)} onNavigateToFees={id => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }} onNavigateToEdit={(id) => { setStudentIdToEdit(id); setCurrentView(ViewState.STUDENTS); }} onDelete={(id) => { handleSoftDeleteStudent(id); setCurrentView(ViewState.STUDENTS); }} onNotify={showNotification} userRole={userRole} />;
        }
      case ViewState.PARENT_PROFILE:
        {
            let parentData = selectedParent;
            if (userRole === 'STUDENT' && currentStudentId) {
                const s = data.students.find(std => std.id === currentStudentId);
                if (s) parentData = { name: s.parentName, phone: s.phone, address: s.address || '' };
            }
            if (!parentData) return <div className="p-8 text-center text-slate-500 font-bold">Parent data not available.</div>;
            return <ParentProfile parentName={parentData.name} parentPhone={parentData.phone} parentAddress={parentData.address} students={sessionStudents} fees={sessionFees} currency={currencySymbol} onBack={() => setCurrentView(userRole === 'STUDENT' ? ViewState.DASHBOARD : ViewState.STUDENTS)} onNavigateToStudent={id => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }} onNavigateToFees={(studentId) => { if (studentId) setSelectedStudentId(studentId); setCurrentView(ViewState.FEES); }} userRole={userRole} />;
        }
      case ViewState.FEES:
        {
            const studentIdFilter = userRole === 'STUDENT' ? currentStudentId : selectedStudentId;
            return <Fees fees={sessionFees} students={sessionStudents} classes={data.classes} feeCategories={data.feeCategories} schoolProfile={data.schoolProfile} currency={currencySymbol} onAddFee={handleAddFee} onUpdateFee={handleUpdateFee} onDeleteFee={handleDeleteFee} onUpdateFeeStatus={async (id, status) => { setData(prev => ({ ...prev, fees: prev.fees.map(f => f.id === id ? { ...f, status } : f) })); await supabase.from('fees').update({ status }).eq('id', id); }} initialStudentId={studentIdFilter} userRole={userRole} />;
        }
      case ViewState.EXPENSES:
        return <Expenses expenses={sessionExpenses} currency={currencySymbol} onAddExpense={handleAddExpense} onEditExpense={async e => { setData(prev => ({ ...prev, expenses: prev.expenses.map(old => old.id === e.id ? e : old) })); await supabase.from('expenses').upsert(e); }} onDeleteExpense={handleDeleteExpense} />;
      case ViewState.RECYCLE_BIN:
        const recycleData = { ...data, students: sessionStudents, employees: sessionEmployees, fees: sessionFees, expenses: sessionExpenses };
        return <RecycleBin data={recycleData} currency={currencySymbol} onRestoreStudent={async id => { setData(prev => ({ ...prev, students: prev.students.map(s => s.id === id ? { ...s, isDeleted: false, deletedAt: undefined } : s) })); await supabase.from('students').update({ isDeleted: false, deletedAt: null }).eq('id', id); }} onRestoreEmployee={async id => { setData(prev => ({ ...prev, employees: prev.employees.map(e => e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e) })); await supabase.from('employees').update({ isDeleted: false, deletedAt: null }).eq('id', id); }} onRestoreFee={async id => { setData(prev => ({ ...prev, fees: prev.fees.map(f => f.id === id ? { ...f, isDeleted: false, deletedAt: undefined } : f) })); await supabase.from('fees').update({ isDeleted: false, deletedAt: null }).eq('id', id); }} onRestoreExpense={async id => { setData(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e) })); await supabase.from('expenses').update({ isDeleted: false, deletedAt: null }).eq('id', id); }} onHardDeleteStudent={async id => { setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) })); await supabase.from('students').delete().eq('id', id); }} onHardDeleteEmployee={async id => { setData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== id) })); await supabase.from('employees').delete().eq('id', id); }} onHardDeleteFee={async id => { setData(prev => ({ ...prev, fees: prev.fees.filter(f => f.id !== id) })); await supabase.from('fees').delete().eq('id', id); }} onHardDeleteExpense={async id => { setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) })); await supabase.from('expenses').delete().eq('id', id); }} onNotify={showNotification} />;
      case ViewState.SCHOOL_PROFILE:
        return <Profiles type="SCHOOL" schoolData={data.schoolProfile} userData={data.userProfile} students={data.students} fees={data.fees} expenses={data.expenses} onUpdateSchool={p => setData(prev => ({ ...prev, schoolProfile: p }))} onUpdateUser={u => setData(prev => ({ ...prev, userProfile: u }))} onNotify={showNotification} onNavigateToDashboard={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.USER_PROFILE:
        return <Profiles type="USER" schoolData={data.schoolProfile} userData={data.userProfile} onUpdateSchool={p => setData(prev => ({ ...prev, schoolProfile: p }))} onUpdateUser={u => setData(prev => ({ ...prev, userProfile: u }))} onNotify={showNotification} />;
      case ViewState.SETTINGS:
        return <Settings settings={data.settings} data={data} onUpdateSettings={handleUpdateSettings} onLoadData={newData => setData(newData)} onFactoryReset={handleFactoryReset} onNotify={showNotification} />;
      default:
        return <div className="p-8 text-center text-slate-500 font-bold">Please select an option.</div>;
    }
  };

  if (isLocked) {
      return <LockScreen schoolData={data.schoolProfile} userData={data.userProfile} students={data.students} classes={data.classes} correctPin={data.settings.security.pin} onUnlock={(role, id) => { setIsLocked(false); setUserRole(role); setCurrentStudentId(id); if (role === 'STUDENT') setCurrentView(ViewState.DASHBOARD); }} onAddStudent={handleAddStudent} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {notification && <NotificationToast message={notification.message} type={notification.type} styleVariant={data.settings.notificationStyle} onClose={() => setNotification(null)} />}
      <Sidebar currentView={currentView} onChangeView={view => { setCurrentView(view); if (userRole !== 'STUDENT') { setSelectedStudentId(null); setSelectedParent(null); } }} isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} schoolProfile={data.schoolProfile} userRole={userRole} onLogout={() => setIsLocked(true)} />
      <main className="flex-1 overflow-hidden flex flex-col relative bg-slate-50">
        <TopBar currentView={currentView} user={data.userProfile} session={data.schoolProfile.currentSession} notifications={notificationHistory} onClearNotifications={handleClearNotifications} isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} onOpenProfile={() => setCurrentView(ViewState.USER_PROFILE)} userRole={userRole} />
        <div className="flex-1 overflow-auto p-4 md:p-8 z-10 relative scrollbar-hide flex flex-col">
            {dbSyncError && (
                <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-[2rem] shadow-xl animate-bounce">
                    <h3 className="text-red-800 font-black flex items-center gap-2 mb-2">
                        <span>🚨</span> DATABASE REPAIR REQUIRED
                    </h3>
                    <p className="text-red-700 text-sm mb-4 font-medium">
                        Row-Level Security is blocking saves.
                    </p>
                </div>
            )}
            <div className="flex-1">
                {renderContent()}
            </div>
            <footer className="py-12 mt-12 text-center border-t border-slate-200/60 opacity-60">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                   Database Integrity Active 🔒
                </p>
            </footer>
        </div>
      </main>
    </div>
  );
};

export default App;