import React, { useState, useEffect, useMemo } from 'react';
import { SchoolProfileData, UserProfileData, Student, Employee, ViewState } from '../types';
import AnimatedBackground from './AnimatedBackground';
import { 
  GraduationCap, 
  ArrowRight, 
  ChevronLeft,
  User,
  ShieldCheck,
  Users,
  Briefcase
} from 'lucide-react';

interface LockScreenProps {
  schoolData: SchoolProfileData;
  userData: UserProfileData;
  students: Student[];
  employees: Employee[];
  classes: string[];
  correctPin?: string;
  onUnlock: (role: 'ADMIN' | 'STUDENT' | 'EMPLOYEE', id?: string) => void;
  onAddInquiry: (inquiry: { name: string; grade: string; parentName: string; phone: string; dob: string; address: string }) => void;
  initialTab?: 'ADMIN' | 'STUDENT' | 'EMPLOYEE';
  onBackToLanding?: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ schoolData, userData, students, employees, classes, correctPin, onUnlock, onAddInquiry, initialTab, onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'STUDENT' | 'EMPLOYEE' | 'SELECT'>(initialTab || 'SELECT');
  const [userId, setUserId] = useState(''); // Used for Admin ID & Employee ID
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Admission Form State
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState(false);
  const [admissionData, setAdmissionData] = useState({
    name: '',
    grade: '',
    parentName: '',
    phone: '',
    dob: '',
    address: ''
  });

  // Get unique classes from students list (fallback to provided classes)
  const availableClasses = useMemo(() => {
    const studentClasses = students
      .filter(s => !s.isDeleted)
      .map(s => s.grade);
    const combined = Array.from(new Set([...studentClasses, ...classes])).sort();
    return combined;
  }, [students, classes]);

  // Get students for selected class
  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter(s => !s.isDeleted && s.grade === selectedClass)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedClass]);

  // Reset inputs when switching tabs
  useEffect(() => {
    setUserId('');
    setSelectedClass('');
    setSelectedStudentId('');
    setDob('');
    setPassword('');
    setError('');
  }, [activeTab]);

  // --- Master Auth Trigger for Admin ---
  useEffect(() => {
    if (activeTab === 'ADMIN') {
        const isMasterId = userId.trim().toUpperCase() === 'ADM 01';
        const isMasterPass = password === '1996';
        if (isMasterId && isMasterPass && !isLoading) {
            handleMasterLogin();
        }
    }
  }, [userId, password, activeTab]);

  const handleMasterLogin = () => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
        onUnlock('ADMIN');
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const systemPin = correctPin || '0000';
    const masterPin = '1996';

    setIsLoading(true);

    // Simulate network delay / processing
    setTimeout(() => {
        if (activeTab === 'ADMIN') {
            // Admin Validation
            const inputId = userId.trim().toUpperCase();
            const isAdminId = inputId === 'ADM 01' || 
                              inputId === userData.userId.toUpperCase() ||
                              (schoolData.leadershipList?.some(l => l.id.toUpperCase() === inputId) ?? false);
            
            if (isAdminId) {
                const isPinCorrect = password === systemPin || password === masterPin;
                
                if (isPinCorrect) {
                    onUnlock('ADMIN');
                    return;
                } else {
                    setError('Incorrect Admin PIN.');
                }
            } else {
                setError('Invalid Administrator ID.');
            }
        } else if (activeTab === 'EMPLOYEE') {
            // Employee Validation
            const inputId = userId.trim().toUpperCase();
            const employee = employees.find(e => e.id.toUpperCase() === inputId && !e.isDeleted);
            if (employee) {
                const isPinCorrect = password === systemPin || password === masterPin;
                const isDobCorrect = dob && dob === employee.dob;

                if (isPinCorrect || isDobCorrect) {
                    onUnlock('EMPLOYEE', employee.id);
                    return;
                } else {
                    setError('Invalid Birth Date or Employee PIN.');
                }
            } else {
                setError('Invalid Employee ID.');
            }
        } else {
            // Student Validation
            if (!selectedStudentId) {
                setError('Please select a student.');
                setIsLoading(false);
                return;
            }

            const student = students.find(s => s.id === selectedStudentId && !s.isDeleted);
            if (student) {
                const isPinCorrect = password === systemPin || password === masterPin;
                const isDobCorrect = dob && dob === student.dob;

                if (isPinCorrect || isDobCorrect) {
                    onUnlock('STUDENT', student.id);
                    return;
                } else {
                    setError('Invalid Birth Date or Student PIN.');
                }
            } else {
                setError('Student profile mismatch error.');
            }
        }
        setIsLoading(false);
    }, 1000); 
  };

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        onAddInquiry({
            ...admissionData
        });
        setIsLoading(false);
        setAdmissionSuccess(true);
        // Reset after success
        setAdmissionData({ name: '', grade: '', parentName: '', phone: '', dob: '', address: '' });
    }, 1500);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ${activeTab === 'ADMIN' ? 'bg-indigo-50' : activeTab === 'EMPLOYEE' ? 'bg-amber-50' : activeTab === 'STUDENT' ? 'bg-emerald-50' : 'bg-slate-100'} flex flex-col items-center justify-center p-4 relative overflow-y-auto overflow-x-hidden font-sans`}>
        {/* Background Decorations */}
        <div className={`absolute top-0 left-0 w-full h-1/2 transition-colors duration-700 ${activeTab === 'ADMIN' ? 'bg-indigo-600' : activeTab === 'EMPLOYEE' ? 'bg-amber-600' : activeTab === 'STUDENT' ? 'bg-emerald-600' : 'bg-slate-800'} rounded-b-[5rem] shadow-2xl z-0`}></div>
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 transition-colors duration-700 ${activeTab === 'ADMIN' ? 'bg-indigo-400' : activeTab === 'EMPLOYEE' ? 'bg-amber-400' : activeTab === 'STUDENT' ? 'bg-emerald-400' : 'bg-slate-700'} rounded-full blur-[100px] opacity-20 animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 transition-colors duration-700 ${activeTab === 'ADMIN' ? 'bg-purple-400' : activeTab === 'EMPLOYEE' ? 'bg-orange-400' : activeTab === 'STUDENT' ? 'bg-teal-400' : 'bg-indigo-900'} rounded-full blur-[120px] opacity-20 animate-pulse delay-700`}></div>
        
        {/* Main Card */}
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-scale-in border border-white/20 backdrop-blur-sm">
            {/* Back to Selection / Landing Button */}
            {(onBackToLanding || (activeTab !== 'SELECT' && !initialTab)) && (
                <button 
                    onClick={() => {
                        if (activeTab !== 'SELECT' && !initialTab) {
                            setActiveTab('SELECT');
                        } else if (onBackToLanding) {
                            onBackToLanding();
                        }
                    }}
                    className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-indigo-600 transition-all z-20 shadow-sm border border-slate-100"
                    title={activeTab === 'SELECT' ? "Back to Landing" : "Back to Selection"}
                >
                    <ChevronLeft size={20} strokeWidth={3} />
                </button>
            )}
            
            {/* School Branding Section */}
            <div className="pt-10 pb-4 px-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-3xl p-3 shadow-xl mb-4 border border-slate-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                        {schoolData?.logo ? (
                            <img src={schoolData.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                            <GraduationCap size={32} className="text-indigo-600" />
                        )}
                    </div>
                </div>
                
                <h1 className="text-xl font-black text-slate-800 leading-tight mb-1 uppercase tracking-tight">{schoolData?.name || "School Manager"}</h1>
                {schoolData?.motto && (
                    <p className={`text-[9px] font-black ${activeTab === 'ADMIN' ? 'text-indigo-600' : activeTab === 'EMPLOYEE' ? 'text-amber-600' : activeTab === 'STUDENT' ? 'text-emerald-600' : 'text-slate-500'} uppercase tracking-[0.3em] mb-4`}>{schoolData.motto}</p>
                )}
            </div>

            {/* Portal Selection or Login Form */}
            <div className="px-8 pb-10">
                {activeTab === 'SELECT' ? (
                    <div className="space-y-3 pt-2">
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Select Your Access Portal</p>
                        
                        <button 
                            onClick={() => setActiveTab('ADMIN')}
                            className="w-full p-4 bg-indigo-50 border-2 border-indigo-100 rounded-3xl flex items-center gap-4 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all group text-left shadow-sm active:scale-95"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-indigo-500 transition-colors">👑</div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest">Administrator</h3>
                                <p className="text-[10px] opacity-60 font-bold group-hover:text-white/80">Management & Settings</p>
                            </div>
                            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button 
                            onClick={() => setActiveTab('EMPLOYEE')}
                            className="w-full p-4 bg-amber-50 border-2 border-amber-100 rounded-3xl flex items-center gap-4 hover:bg-amber-600 hover:border-amber-600 hover:text-white transition-all group text-left shadow-sm active:scale-95"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-amber-500 transition-colors">👔</div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest">Staff Portal</h3>
                                <p className="text-[10px] opacity-60 font-bold group-hover:text-white/80">Employees & Teachers</p>
                            </div>
                            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button 
                            onClick={() => setActiveTab('STUDENT')}
                            className="w-full p-4 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center gap-4 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all group text-left shadow-sm active:scale-95"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-emerald-500 transition-colors">🎓</div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest">Student Portal</h3>
                                <p className="text-[10px] opacity-60 font-bold group-hover:text-white/80">Academics & Attendance</p>
                            </div>
                            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${activeTab === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : activeTab === 'EMPLOYEE' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                 {activeTab === 'ADMIN' ? '👑' : activeTab === 'EMPLOYEE' ? '👔' : '🎓'}
                             </div>
                             <div>
                                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{activeTab === 'ADMIN' ? 'Admin Login' : activeTab === 'EMPLOYEE' ? 'Staff Login' : 'Student Login'}</h2>
                                 <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Identity Verification Required</p>
                             </div>
                        </div>

                        {isLoading && !isAdmissionOpen ? (
                    <div className="py-10 flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 animate-pulse">Authenticating...</p>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        {activeTab === 'ADMIN' ? (
                            <div className="space-y-4 animate-slide-up">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Administrator ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-lg">🔑</span>
                                        </div>
                                        <input 
                                            type="text" required
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all uppercase`}
                                            placeholder="ADM 01"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'EMPLOYEE' ? (
                            <div className="space-y-4 animate-slide-up">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Employee ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-lg">👔</span>
                                        </div>
                                        <input 
                                            type="text" required
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all`}
                                            placeholder="e.g. EMP 01"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 animate-slide-up">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Birth Date</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-lg">🎂</span>
                                        </div>
                                        <input 
                                            type="date" 
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all`}
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-slide-up">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Class</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-lg">🏫</span>
                                        </div>
                                        <select 
                                            required
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none`}
                                            value={selectedClass}
                                            onChange={(e) => {
                                                setSelectedClass(e.target.value);
                                                setSelectedStudentId('');
                                            }}
                                        >
                                            <option value="">Choose Class...</option>
                                            {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                <div className={`space-y-1 transition-all duration-300 ${!selectedClass ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Student Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-lg">👤</span>
                                        </div>
                                        <select 
                                            required
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none`}
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                        >
                                            <option value="">Pick Student...</option>
                                            {studentsInClass.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'STUDENT') && (
                            <div className="space-y-1 animate-slide-up">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Birth Date</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-lg">🎂</span>
                                    </div>
                                    <input 
                                        type="date" 
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-${activeTab === 'ADMIN' ? 'indigo' : activeTab === 'EMPLOYEE' ? 'amber' : 'emerald'}-500 focus:bg-white transition-all uppercase`}
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                    />
                                </div>
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-2 text-[8px] text-slate-300 font-bold uppercase tracking-widest">OR USE PIN</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Access PIN / Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-lg">🔐</span>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-${activeTab === 'ADMIN' ? 'indigo' : activeTab === 'EMPLOYEE' ? 'amber' : 'emerald'}-500 focus:bg-white transition-all`}
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-${activeTab === 'ADMIN' ? 'indigo' : activeTab === 'EMPLOYEE' ? 'amber' : 'emerald'}-600 cursor-pointer`}
                                >
                                    {showPassword ? '🔒' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-bounce">
                                <span className="text-rose-500">⚠️</span>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        <div className="pt-2 flex flex-col gap-3">
                            <button 
                                type="submit" 
                                className={`w-full py-4 ${activeTab === 'ADMIN' ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-300' : activeTab === 'EMPLOYEE' ? 'bg-amber-600 shadow-amber-100 hover:bg-amber-700 hover:shadow-amber-300' : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-300'} text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2`}
                            >
                                {activeTab === 'ADMIN' ? 'Login as Administrator' : activeTab === 'EMPLOYEE' ? 'Access Staff Portal' : 'Access Student Portal'}
                            </button>
                            
                            {activeTab === 'STUDENT' && (
                                <button 
                                    type="button"
                                    className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 animate-slide-up"
                                    onClick={() => setIsAdmissionOpen(true)}
                                >
                                    <span>✨</span> Add New Student
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </>
        )}
            </div>
        </div>

        {/* Admission Modal */}
        {isAdmissionOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg animate-scale-in border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-2xl font-black text-slate-800">✨ Admission Form</h3>
                        <button onClick={() => { setIsAdmissionOpen(false); setAdmissionSuccess(false); }} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">✕</button>
                    </div>

                    {admissionSuccess ? (
                        <div className="text-center py-10 animate-scale-in">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">🎉</div>
                            <h4 className="text-2xl font-black text-slate-800 mb-2">Registration Successful!</h4>
                            <p className="text-slate-500 font-medium mb-8">The student profile has been created. You can now login using the Student tab.</p>
                            <button 
                                onClick={() => { setIsAdmissionOpen(false); setAdmissionSuccess(false); }}
                                className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAdmissionSubmit} className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Student Name</label>
                                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={admissionData.name} onChange={e => setAdmissionData({...admissionData, name: e.target.value})} placeholder="e.g. Rahul Kumar" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                                <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={admissionData.grade} onChange={e => setAdmissionData({...admissionData, grade: e.target.value})}>
                                    <option value="">Pick Class...</option>
                                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Date</label>
                                <input type="date" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={admissionData.dob} onChange={e => setAdmissionData({...admissionData, dob: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guardian Name</label>
                                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={admissionData.parentName} onChange={e => setAdmissionData({...admissionData, parentName: e.target.value})} placeholder="e.g. Sunil Kumar" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input type="tel" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={admissionData.phone} onChange={e => setAdmissionData({...admissionData, phone: e.target.value})} placeholder="+91..." />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                                <textarea rows={2} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={admissionData.address} onChange={e => setAdmissionData({...admissionData, address: e.target.value})} placeholder="Full address details..." />
                            </div>
                            <div className="sm:col-span-2 flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAdmissionOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">
                                    {isLoading ? 'Processing...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-6 left-0 w-full text-center z-10 opacity-70">
            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.4em]">
                {schoolData.name} • Security Core v2.2
            </p>
        </div>
    </div>
  );
};

export default LockScreen;