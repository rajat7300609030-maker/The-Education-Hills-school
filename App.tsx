import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
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
import EmployeeProfile from './components/EmployeeProfile';
import ParentProfile from './components/ParentProfile';
import NotificationToast from './components/NotificationToast';
import LockScreen from './components/LockScreen';
import LandingPage from './components/LandingPage';
import NewInquiry from './components/NewInquiry';
import Attendance from './components/Attendance';
import GooglePhotos from './components/GooglePhotos';
import AnimatedBackground from './components/AnimatedBackground';
import { ViewState, AppData, Student, Employee, Inquiry, FeeRecord, ExpenseRecord, AppSettings, UserProfileData, AppNotification, Note, AttendanceRecord, EmployeeAttendanceRecord } from './types';
import { supabase } from './lib/supabase';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Globe } from 'lucide-react';
import * as VibrantModule from 'node-vibrant/browser';
const { Vibrant } = (VibrantModule as any).default || VibrantModule;

const INITIAL_DATA: AppData = {
  students: [],
  employees: [],
  inquiries: [],
  classes: ['10-A', '11-B', '12-A'],
  feeCategories: ['Tuition', 'Bus', 'Books', 'Uniform'],
  fees: [],
  expenses: [],
  notes: [],
  attendance: [],
  employeeAttendance: [],
  schoolProfile: {
    name: 'Education Hills',
    address: 'Mountain View Campus, City Center',
    contactEmail: 'admin@educationhills.edu',
    contactNumber: '+1 234 567 890',
    motto: 'Knowledge is Power',
    website: 'www.educationhills.edu',
    sessions: ['2024-2025', '2025-2026'],
    currentSession: '2024-2025',
    logo: '',
    affiliationNumber: 'ST-90210',
    principalName: 'Dr. Jane Smith',
    board: 'C.B.S.E',
    establishedYear: '1996',
    bannerEffect: 'Standard',
    logoSize: 100,
    termsAndConditions: '',
    authorizedSignature: '',
    departments: ['Science', 'Commerce', 'Arts'],
    notice: '',
    leadershipList: [],
    campusAcres: '25',
    successRate: '99.8%'
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
    photo: '',
    experience: '28+ Years',
    degree: 'Ph.D. Management',
    session: '2024 - 2025',
    specialization: 'Educational Strategy',
    office: 'Admin Block, Suite 101'
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
      images: []
    },
    security: {
        enableAppLock: true,
        lockTimeout: 0,
        pin: '0000'
    },
    socialMedia: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
      youtube: 'https://youtube.com',
      linkedin: 'https://linkedin.com',
      whatsapp: 'https://wa.me/1234567890',
      gmail: 'mailto:admin@school.com'
    },
    adsense: {
      enabled: false,
      clientId: '',
      autoAdsEnabled: false,
      testMode: false,
      units: []
    },
    landingPage: {
      enabled: true,
      showHero: true,
      showProfile: true,
      showFacilities: true,
      showEvents: true,
      showStarStudents: true,
      showManagement: true,
      showGallery: true,
      showEcosystem: true,
      showStats: true,
      showFooter: true,
      heroTitle: 'Inspiring Future Leaders Today.',
      heroSubtitle: 'Experience a world-class education designed for the 21st-century citizen.',
      primaryColor: '#4F46E5',
      secondaryColor: '#F59E0B'
    },
    loadingScreen: {
      showLogo: true,
      showSchoolName: true,
      showMotto: true,
      showSession: true,
      showProgressBar: true,
      showStatusMessages: true,
      showFooter: true,
      cardColor: '#ffffff',
      backgroundColor: '#f8fafc',
      progressBarColor: '#4F46E5',
      statusMessageColor: '#94a3b8',
      mottoColor: '#4285F4',
      schoolNameColor: '#1e293b',
      logoSize: 100,
      cardRoundness: '3xl',
      animationSpeed: 1,
      showShimmer: true,
      showPulse: true,
      useGradientProgress: true,
      statusMessages: [
        "Connecting to {{school}}",
        "Syncing {{session}} Records",
        "{{motto}}",
        "Optimizing Campus Modules",
        "Finalizing Academic Environment"
      ]
    }
  },
  lastSyncDate: '1970-01-01T00:00:00.000Z'
};

import EmployeeDashboard from './components/EmployeeDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isInitialized, setIsInitialized] = useState(false);
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem('school_manager_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge logic for settings to ensure new properties like landingPage exist
        return { 
          ...INITIAL_DATA, 
          ...parsed,
          schoolProfile: {
            ...INITIAL_DATA.schoolProfile,
            ...(parsed.schoolProfile || {})
          },
          userProfile: {
            ...INITIAL_DATA.userProfile,
            ...(parsed.userProfile || {})
          },
          settings: {
            ...INITIAL_DATA.settings,
            ...(parsed.settings || {}),
            imageSlider: {
              ...INITIAL_DATA.settings.imageSlider,
              ...(parsed.settings?.imageSlider || {})
            },
            security: {
              ...INITIAL_DATA.settings.security,
              ...(parsed.settings?.security || {})
            },
            socialMedia: {
              ...INITIAL_DATA.settings.socialMedia,
              ...(parsed.settings?.socialMedia || {})
            },
            landingPage: {
              ...INITIAL_DATA.settings.landingPage,
              ...(parsed.settings?.landingPage || {})
            },
            loadingScreen: {
              ...INITIAL_DATA.settings.loadingScreen,
              ...(parsed.settings?.loadingScreen || {})
            },
            adsense: {
              ...INITIAL_DATA.settings.adsense,
              ...(parsed.settings?.adsense || {}),
              units: parsed.settings?.adsense?.units || INITIAL_DATA.settings.adsense?.units || []
            }
          }
        };
      }
    } catch (e) {
      console.warn("Failed to load from localStorage", e);
    }
    return INITIAL_DATA;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<AppNotification[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showPublicGallery, setShowPublicGallery] = useState(false);
  const [loginTab, setLoginTab] = useState<'ADMIN' | 'STUDENT' | 'EMPLOYEE' | undefined>(undefined);
  const [userRole, setUserRole] = useState<'ADMIN' | 'STUDENT' | 'EMPLOYEE'>('ADMIN');
  const [currentStudentId, setCurrentStudentId] = useState<string | undefined>(undefined);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [initialExpenseData, setInitialExpenseData] = useState<Partial<Omit<ExpenseRecord, 'id' | 'isDeleted'>> | null>(null);
  const [studentIdToEdit, setStudentIdToEdit] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<{name: string, phone: string, address: string} | null>(null);
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  useEffect(() => {
    document.body.setAttribute('data-view', currentView);
  }, [currentView]);

  // Auto-update landing page colors based on school logo
  useEffect(() => {
    const logo = data.schoolProfile.logo;
    if (!logo || !isInitialized) return;

    const extractColors = async () => {
      try {
        // Use Vibrant to extract colors from the logo
        const palette = await Vibrant.from(logo).getPalette();
        
        const primary = palette.Vibrant?.hex || palette.Muted?.hex || '#4F46E5';
        const secondary = palette.LightVibrant?.hex || palette.DarkVibrant?.hex || '#F59E0B';

        // Only update if colors are different to avoid unnecessary syncs
        if (data.settings.landingPage.primaryColor !== primary || 
            data.settings.landingPage.secondaryColor !== secondary) {
          
          setData(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              landingPage: {
                ...prev.settings.landingPage,
                primaryColor: primary,
                secondaryColor: secondary
              }
            }
          }));
          
          showNotification("🎨 Landing page colors synced with logo", "info");
        }
      } catch (err) {
        console.warn("Could not extract colors from logo (CORS or invalid URL):", err);
      }
    };

    extractColors();
  }, [data.schoolProfile.logo, isInitialized, data.settings.landingPage.primaryColor, data.settings.landingPage.secondaryColor]);

  const topBarUser = useMemo(() => {
    if (userRole === 'STUDENT' && currentStudentId) {
      const student = data.students.find(s => s.id === currentStudentId);
      if (student) {
        return {
          name: student.name,
          photo: student.photo,
          role: `Student • ${student.grade}`,
          email: student.email || '',
          userId: student.id,
          bio: `Student at ${data.schoolProfile.name}`,
          dateOfBirth: student.dob || '',
          contactNumber: student.phone || '',
          address: student.address || '',
          session: student.session || data.schoolProfile.currentSession
        } as UserProfileData;
      }
    }
    return data.userProfile;
  }, [userRole, currentStudentId, data.students, data.userProfile, data.schoolProfile]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (data?.settings?.enableNotifications || type === 'error') {
        setNotification({ message, type });
    }
    const newNotify: AppNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotificationHistory(prev => [newNotify, ...prev].slice(0, 10));
  };

  useEffect(() => {
    const fetchSupabaseData = async (retries = 2) => {
      try {
        // Fetch sequentially to avoid statement timeout on large data sets
        const studentsResp = await supabase.from('students').select('*').order('name');
        const employeesResp = await supabase.from('employees').select('*').order('name');
        const feesResp = await supabase.from('fees').select('*');
        const expensesResp = await supabase.from('expenses').select('*');
        const notesResp = await supabase.from('notes').select('*').order('createdAt', { ascending: false });
        const inquiriesResp = await supabase.from('inquiries').select('*').order('date', { ascending: false });
        const attendanceResp = await supabase.from('attendance').select('*').order('date', { ascending: false });
        
        let configResp = null;
        try {
            configResp = await supabase.from('config').select('*').eq('id', 1).maybeSingle();
        } catch (confErr) {
            console.warn("Config fetch skipped.");
        }

        const errors = [studentsResp.error, employeesResp.error, feesResp.error, expensesResp.error].filter(Boolean);
        if (errors.length > 0) {
            const timeoutError = errors.find(e => e?.message.toLowerCase().includes('timeout'));
            if (timeoutError && retries > 0) {
                console.warn("Fetch timeout, retrying...", timeoutError.message);
                setTimeout(() => fetchSupabaseData(retries - 1), 3000);
                return;
            }
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
        const fetchedNotes = (notesResp.data || INITIAL_DATA.notes) as Note[];
        const fetchedInquiries = (inquiriesResp.data || []) as Inquiry[];
        const fetchedAttendance = (attendanceResp.data || INITIAL_DATA.attendance) as AttendanceRecord[];

        const mergeById = <T extends { id: string }>(local: T[], remote: T[]): T[] => {
          const remoteIds = new Set(remote.map(r => r.id));
          const localOnly = local.filter(l => !remoteIds.has(l.id));
          return [...remote, ...localOnly];
        };

        setData(prev => {
          // Only merge config if it's newer or if we don't have local data
          const supabaseLastSync = configResp?.data?.last_sync_date;
          const localLastSync = prev.lastSyncDate;
          
          const shouldOverwriteConfig = !localLastSync || (supabaseLastSync && new Date(supabaseLastSync) > new Date(localLastSync));

          return {
            ...prev,
            students: fetchedStudents.length > 0 ? mergeById(prev.students, fetchedStudents) : prev.students,
            employees: fetchedEmployees.length > 0 ? mergeById(prev.employees, fetchedEmployees) : prev.employees,
            fees: fetchedFees.length > 0 ? mergeById(prev.fees, fetchedFees) : prev.fees,
            expenses: fetchedExpenses.length > 0 ? mergeById(prev.expenses, fetchedExpenses) : prev.expenses,
            notes: fetchedNotes.length > 0 ? mergeById(prev.notes, fetchedNotes) : prev.notes,
            inquiries: fetchedInquiries.length > 0 ? mergeById(prev.inquiries, fetchedInquiries) : prev.inquiries,
            attendance: fetchedAttendance.length > 0 ? mergeById(prev.attendance, fetchedAttendance) : prev.attendance,
            schoolProfile: shouldOverwriteConfig ? {
              ...prev.schoolProfile,
              ...(configResp?.data?.school_profile || {})
            } : prev.schoolProfile,
            userProfile: shouldOverwriteConfig ? {
              ...prev.userProfile,
              ...(configResp?.data?.user_profile || {})
            } : prev.userProfile,
            settings: shouldOverwriteConfig ? {
              ...prev.settings,
              ...(configResp?.data?.settings || {}),
              imageSlider: {
                ...prev.settings.imageSlider,
                ...(configResp?.data?.settings?.imageSlider || {})
              },
              security: {
                ...prev.settings.security,
                ...(configResp?.data?.settings?.security || {})
              },
              socialMedia: {
                ...prev.settings.socialMedia,
                ...(configResp?.data?.settings?.socialMedia || {})
              },
              landingPage: {
                ...prev.settings.landingPage,
                ...(configResp?.data?.settings?.landingPage || {})
              },
              loadingScreen: {
                ...prev.settings.loadingScreen,
                ...(configResp?.data?.settings?.loadingScreen || {})
              },
              adsense: {
                ...(prev.settings.adsense || { enabled: false, clientId: '', units: [] }),
                ...(configResp?.data?.settings?.adsense || {}),
                units: configResp?.data?.settings?.adsense?.units || prev.settings.adsense?.units || []
              }
            } : prev.settings,
            classes: (shouldOverwriteConfig && configResp?.data?.classes) || prev.classes,
            feeCategories: (shouldOverwriteConfig && configResp?.data?.fee_categories) || prev.feeCategories,
            lastSyncDate: supabaseLastSync || prev.lastSyncDate
          };
        });

        setIsInitialized(true);

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
        console.error("Database Connection Issue:", err);
        const isNetworkError = err.message?.includes('fetch') || err.name === 'TypeError';
        
        if (retries > 0 && isNetworkError) {
            console.warn("Network issue detected, retrying fetch...", retries);
            setTimeout(() => fetchSupabaseData(retries - 1), 3000);
        } else {
            setSyncStatus('error');
            if (isNetworkError) {
              showNotification("🌐 Connection Issue: Working in Offline Mode (Local Save Active).", "info");
            } else {
              showNotification("⚠️ Cloud Sync Limited: Data saved locally.", "info");
            }
        }
      }
    };
    fetchSupabaseData();
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('school_manager_data', JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }, [data]);

  useEffect(() => {
    if (data.settings.fontSize) {
      document.documentElement.style.fontSize = `${data.settings.fontSize}%`;
    }
  }, [data.settings.fontSize]);

  useEffect(() => {
    const theme = data.settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    // Remove all theme classes first
    const themeClasses = ['theme-light', 'theme-dark', 'theme-vibrant', 'theme-glass', 'theme-modern', 'theme-ocean'];
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(`theme-${theme}`);
  }, [data.settings.theme]);

  // Dynamic AdSense Script Injection
  useEffect(() => {
    const adsense = data?.settings?.adsense;
    if (adsense?.enabled && adsense?.clientId) {
      const scriptId = 'adsense-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      // Determine the correct script source
      // If Auto Ads are enabled, we include the client ID in the URL as per modern AdSense recommendations
      // This automatically enables Auto Ads without needing a separate adsbygoogle.push call
      const baseUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      const expectedSrc = adsense.autoAdsEnabled 
        ? `${baseUrl}?client=${adsense.clientId}`
        : baseUrl;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = expectedSrc;
        document.head.appendChild(script);
      } else if (script.src !== expectedSrc) {
        // If the client ID or Auto Ads setting changed, update the script
        // Note: Re-injecting the script might be necessary if the source changes significantly
        script.src = expectedSrc;
      }

      // We no longer call adsbygoogle.push({ enable_page_level_ads: true })
      // because providing the 'client' parameter in the script URL is the modern
      // and preferred way to enable Auto Ads, and it avoids the "Only one 
      // 'enable_page_level_ads' allowed per page" error.
    }
  }, [data.settings.adsense?.enabled, data.settings.adsense?.clientId, data.settings.adsense?.autoAdsEnabled]);

  useEffect(() => {
    if (!isInitialized) return;

    const syncConfig = async () => {
      setSyncStatus('syncing');
      try {
        const payload: any = {
          id: 1,
          school_profile: data.schoolProfile,
          user_profile: data.userProfile,
          settings: data.settings,
          classes: data.classes,
          fee_categories: data.feeCategories,
          last_sync_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('config').upsert(payload);
        
        if (error) {
          throw error;
        }

        setSyncStatus('synced');
        setData(prev => ({ ...prev, lastSyncDate: payload.last_sync_date }));
      } catch (err: any) {
        setSyncStatus('error');
        console.error("Supabase Config Sync Error:", err);
        const isNetworkError = err.message?.includes('fetch') || err.name === 'TypeError';
        
        if (err.message?.includes('security policy') || err.message?.includes('rls')) {
          showNotification("🚨 Security Block: Settings not saved. Check Supabase RLS.", "error");
        } else if (isNetworkError) {
          // Don't spam if it's just a network glitch
          if (syncStatus !== 'error') {
            showNotification("🌐 Sync Interrupted: Check your internet connection.", "info");
          }
        } else {
          setDbSyncError(err.message);
        }
      }
    };
    const timeout = setTimeout(syncConfig, 1000);
    return () => clearTimeout(timeout);
  }, [isInitialized, data.schoolProfile, data.userProfile, data.settings, data.classes, data.feeCategories]);

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
    setSyncStatus('syncing');
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
      setSyncStatus('error');
      const isNetworkError = error.message?.includes('fetch');
      showNotification(
        isNetworkError 
          ? "🌐 Sync Failed: Network issue, saved locally." 
          : `❌ Sync Failed: ${error.message}. Data saved locally.`, 
        'error'
      );
    } else {
      setSyncStatus('synced');
      showNotification(`✅ Registered ${newStudent.name}`, 'success');
    }
  };

  const handleAddInquiry = async (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: `INQ-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'Pending'
    };
    setData(prev => ({ ...prev, inquiries: [newInquiry, ...prev.inquiries] }));
    const { error } = await supabase.from('inquiries').insert(newInquiry);
    if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
            console.warn("Inquiries table not found or schema cache issue. Keeping in local state.");
            showNotification(`⚠️ Database Sync Issue: Inquiries table missing. Saved locally.`, 'info');
        } else {
            showNotification(`❌ Save Failed: ${error.message}`, 'error');
        }
    } else {
        showNotification(`✅ Inquiry for ${newInquiry.studentName} Submitted!`, 'success');
    }
  };

  const handleUpdateInquiry = async (inquiry: Inquiry) => {
    setData(prev => ({ ...prev, inquiries: prev.inquiries.map(i => i.id === inquiry.id ? inquiry : i) }));
    const { error } = await supabase.from('inquiries').upsert(inquiry);
    if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
            showNotification(`⚠️ Update Saved Locally. Database sync issue.`, 'info');
        } else {
            showNotification(`❌ Update Failed: ${error.message}`, 'error');
        }
    } else {
        showNotification(`✅ Status updated for ${inquiry.studentName}`, 'success');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    setData(prev => ({ ...prev, inquiries: prev.inquiries.filter(i => i.id !== id) }));
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
            showNotification(`🗑️ Inquiry removed locally. Database sync issue.`, 'info');
        } else {
            showNotification(`❌ Delete Failed: ${error.message}`, 'error');
        }
    } else {
        showNotification(`🗑️ Inquiry removed`, 'info');
    }
  };

  const handleConvertToStudent = async (inquiry: Inquiry) => {
    // Try to parse DOB and Address from message if it follows the pattern
    let dob = '';
    let address = '';
    if (inquiry.message?.includes('Address:')) {
      const parts = inquiry.message.split('Address: ')[1]?.split('. DOB: ');
      if (parts) {
        address = parts[0] || '';
        dob = parts[1] || '';
      }
    }

    const nextNum = (data.students.length > 0 ? Math.max(...data.students.map(s => parseInt((s.id || '').replace(/\D/g, '')) || 0)) : 0) + 1;
    const newId = `STU${nextNum.toString().padStart(3, '0')}`;
    
    const newStudent: Student = {
      id: newId,
      name: inquiry.studentName,
      grade: inquiry.grade,
      parentName: inquiry.parentName,
      phone: inquiry.phone,
      email: inquiry.email || '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      isDeleted: false,
      dob: dob || '',
      address: address || '',
      session: data.schoolProfile.currentSession
    };

    // 1. Add Student
    setData(prev => ({ ...prev, students: [newStudent, ...prev.students] }));
    const { error: stuError } = await supabase.from('students').insert(newStudent);
    
    if (stuError) {
      showNotification(`❌ Conversion Failed: ${stuError.message}`, 'error');
      return;
    }

    // 2. Delete Inquiry
    await handleDeleteInquiry(inquiry.id);

    // 3. Navigate and notify
    showNotification(`🎓 ${inquiry.studentName} enrolled successfully!`, 'success');
    setStudentIdToEdit(newId);
    setCurrentView(ViewState.STUDENTS);
  };

  const handleAddEmployee = async (employee: Omit<Employee, 'id' | 'isDeleted'>) => {
    const currentSession = data.schoolProfile.currentSession;
    const nextNum = (data.employees.length > 0 ? Math.max(...data.employees.map(e => parseInt((e.id || '').replace(/\D/g, '')) || 0)) : 0) + 1;
    const newId = `EMP${nextNum.toString().padStart(3, '0')}`;
    const newEmployee: Employee = { ...employee, id: newId, session: currentSession, isDeleted: false };
    setData(prev => ({ ...prev, employees: [...(prev.employees || []), newEmployee] }));
    const { error } = await supabase.from('employees').insert(newEmployee);
    if (error) {
      // Keep in local state
      showNotification(`❌ Sync Failed: ${error.message}. Data saved locally.`, 'error');
    }
  };

  const handleEditEmployee = async (updatedEmployee: Employee) => {
    setData(prev => ({ ...prev, employees: prev.employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e) }));
    const { error } = await supabase.from('employees').upsert(updatedEmployee);
    if (error) {
      showNotification(`❌ Update Failed: ${error.message}`, 'error');
    } else {
      showNotification('✅ Employee profile updated', 'success');
    }
  };

  const handleRecordEmployeePayment = (employeeId: string) => {
    const employee = data.employees.find(e => e.id === employeeId);
    if (!employee) return;

    setInitialExpenseData({
      title: `Salary Payment: ${employee.name}`,
      amount: employee.salary,
      category: 'Salary',
      description: `Monthly salary for ${employee.name} (${employee.role})`,
      employeeId: employee.id,
      date: new Date().toISOString().split('T')[0]
    });
    setCurrentView(ViewState.EXPENSES);
  };

  const handleDeleteEmployee = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, employees: prev.employees.map(e => e.id === id ? { ...e, isDeleted: true, deletedAt: now } : e) }));
    const { error } = await supabase.from('employees').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    if (error) {
      showNotification(`❌ Delete Failed: ${error.message}`, 'error');
    } else {
      showNotification('🗑️ Employee moved to Recycle Bin', 'info');
    }
  };

  const handleAddFee = async (fee: Omit<FeeRecord, 'id' | 'isDeleted'>) => {
    setSyncStatus('syncing');
    const currentSession = data.schoolProfile.currentSession;
    const newFee: FeeRecord = { 
        ...fee, 
        id: `FEE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, 
        isDeleted: false, 
        session: currentSession 
    };
    
    setData(prev => ({ ...prev, fees: [...prev.fees, newFee] }));
    const { error } = await supabase.from('fees').insert(newFee);
    if (error) {
      setSyncStatus('error');
      // Keep in local state
      showNotification(`🚨 Record Error: ${error.message}. Saved locally.`, 'error');
    } else {
      setSyncStatus('synced');
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
    const { error } = await supabase.from('fees').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    if (error) {
      showNotification(`❌ Delete Failed: ${error.message}`, 'error');
    }
  };

  const handleAddExpense = async (expense: Omit<ExpenseRecord, 'id' | 'isDeleted'>) => {
    const currentSession = data.schoolProfile.currentSession;
    const newExpense: ExpenseRecord = { 
        ...expense, 
        id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, 
        isDeleted: false, 
        session: currentSession 
    };
    
    setData(prev => ({ ...prev, expenses: [...(prev.expenses || []), newExpense] }));
    const { error } = await supabase.from('expenses').insert({ ...newExpense, description: newExpense.description || '' });
    
    if (error) {
      // Keep in local state
      showNotification(`❌ Database Sync Failed: ${error.message}. Saved locally.`, 'error');
    } else {
      showNotification('✅ Expense history permanently saved 🔒', 'success');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === id ? { ...e, isDeleted: true, deletedAt: now } : e) }));
    const { error } = await supabase.from('expenses').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    if (error) {
      showNotification(`❌ Delete Failed: ${error.message}`, 'error');
    } else {
      showNotification('🗑️ Expense moved to Recycle Bin', 'info');
    }
  };

  const handleEditStudent = async (updatedStudent: Student) => {
    setSyncStatus('syncing');
    setData(prev => ({ ...prev, students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s) }));
    const { error } = await supabase.from('students').upsert(updatedStudent);
    if (error) {
      setSyncStatus('error');
      showNotification(`❌ Update Failed: ${error.message}`, 'error');
    } else {
      setSyncStatus('synced');
      showNotification('✅ Student profile updated', 'success');
    }
  };

  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    setSyncStatus('syncing');
    const updatedAttendance = [...data.attendance];
    
    records.forEach(newRecord => {
      const index = updatedAttendance.findIndex(r => r.studentId === newRecord.studentId && r.date === newRecord.date);
      if (index > -1) {
        updatedAttendance[index] = newRecord;
      } else {
        updatedAttendance.push(newRecord);
      }
    });

    setData(prev => ({ ...prev, attendance: updatedAttendance }));
    
    const { error } = await supabase.from('attendance').upsert(records);
    if (error) {
      if (error.message.includes('relation "attendance" does not exist') || error.message.includes('schema cache') || error.message.includes('Could not find the table')) {
          setSyncStatus('synced');
          showNotification('✅ Attendance saved locally (Network Only)', 'info');
      } else {
          setSyncStatus('error');
          showNotification(`❌ Attendance Save Failed: ${error.message}`, 'error');
      }
    } else {
      setSyncStatus('synced');
      showNotification('✅ Attendance recorded successfully', 'success');
    }
  };

  const handleSaveEmployeeAttendance = async (records: EmployeeAttendanceRecord[]) => {
    setSyncStatus('syncing');
    const updatedAttendance = [...data.employeeAttendance];
    
    records.forEach(newRecord => {
      const index = updatedAttendance.findIndex(r => r.employeeId === newRecord.employeeId && r.date === newRecord.date);
      if (index > -1) {
        updatedAttendance[index] = newRecord;
      } else {
        updatedAttendance.push(newRecord);
      }
    });

    setData(prev => ({ ...prev, employeeAttendance: updatedAttendance }));
    
    const { error } = await supabase.from('employee_attendance').upsert(records);
    if (error) {
       if (error.message.includes('relation "employee_attendance" does not exist') || 
           error.message.includes('schema cache') || 
           error.message.includes('Could not find the table') ||
           error.message.includes('row-level security')) {
          setSyncStatus('synced');
          showNotification('✅ Employee attendance saved locally (Permissions Pending)', 'info');
       } else {
          setSyncStatus('error');
          showNotification(`❌ Employee Attendance Failed: ${error.message}`, 'error');
       }
    } else {
      setSyncStatus('synced');
      showNotification('✅ Employee attendance synchronized', 'success');
    }
  };

  const handleSoftDeleteStudent = async (id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({ ...prev, students: prev.students.map(s => s.id === id ? { ...s, isDeleted: true, deletedAt: now } : s) }));
    const { error } = await supabase.from('students').update({ isDeleted: true, deletedAt: now }).eq('id', id);
    if (error) {
      showNotification(`❌ Delete Failed: ${error.message}`, 'error');
    } else {
      showNotification('🗑️ Student moved to Recycle Bin', 'info');
    }
  };

  const handleRestoreStudent = async (id: string) => {
    setData(prev => ({ 
      ...prev, 
      students: prev.students.map(s => s.id === id ? { ...s, isDeleted: false, deletedAt: undefined } : s) 
    }));
    const { error } = await supabase.from('students').update({ isDeleted: false, deletedAt: null }).eq('id', id);
    if (error) {
      showNotification(`❌ Restore Failed: ${error.message}`, 'error');
    } else {
      showNotification('✅ Student restored to active records', 'success');
    }
  };

  const handleAddNote = async (content: string, color: string) => {
    const newNote: Note = {
      id: `NOTE-${Date.now()}`,
      content,
      color,
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    setData(prev => ({ ...prev, notes: [newNote, ...(prev.notes || [])] }));
    const { error } = await supabase.from('notes').insert(newNote);
    if (error) {
      // Keep in local state
      showNotification(`❌ Note Save Failed: ${error.message}. Saved locally.`, 'error');
    }
  };

  const handleDeleteNote = async (id: string) => {
    setData(prev => ({ ...prev, notes: (prev.notes || []).filter(n => n.id !== id) }));
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      showNotification(`❌ Note Delete Failed: ${error.message}`, 'error');
    }
  };

  const handleTogglePinNote = async (id: string) => {
    const note = (data.notes || []).find(n => n.id === id);
    if (!note) return;
    const updatedNote = { ...note, isPinned: !note.isPinned };
    setData(prev => ({ ...prev, notes: (prev.notes || []).map(n => n.id === id ? updatedNote : n) }));
    const { error } = await supabase.from('notes').update({ isPinned: updatedNote.isPinned }).eq('id', id);
    if (error) {
      showNotification(`❌ Note Update Failed: ${error.message}`, 'error');
    }
  };

  const handleUpdateSettings = (settings: AppSettings) => {
    setData(prev => ({ ...prev, settings }));
    showNotification('⚙️ Settings updated', 'info');
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      const payload: any = {
        id: 1,
        school_profile: data.schoolProfile,
        user_profile: data.userProfile,
        settings: data.settings,
        classes: data.classes,
        fee_categories: data.feeCategories,
        updated_at: new Date().toISOString()
      };

      if (!window.localStorage.getItem('supabase_missing_last_sync_date')) {
        payload.last_sync_date = new Date().toISOString();
      }

      const { error: configError } = await supabase.from('config').upsert(payload);

      if (configError) {
        if (configError.message.includes('last_sync_date') && configError.message.includes('column')) {
          window.localStorage.setItem('supabase_missing_last_sync_date', 'true');
          delete payload.last_sync_date;
          const { error: retryError } = await supabase.from('config').upsert(payload);
          if (retryError) throw retryError;
        } else {
          throw configError;
        }
      }
      
      setData(prev => ({ ...prev, lastSyncDate: new Date().toISOString() }));
      setSyncStatus('synced');
      setDbSyncError(null);
      showNotification('✅', 'success');
    } catch (err: any) {
      setSyncStatus('error');
      setDbSyncError(err.message || 'Unknown sync error');
      showNotification(`❌ Sync Failed: ${err.message}`, 'error');
    }
  };

  const handleFactoryReset = async () => {
    try {
      showNotification('⏳ Clearing records...', 'info');
      localStorage.removeItem('school_manager_data');
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

  const isEmployeePortal = currentView === ViewState.EMPLOYEE_DASHBOARD;
  const currentSession = data.schoolProfile?.currentSession;
  const sessionStudents = data.students.filter(s => s.session === currentSession);
  const sessionEmployees = (data.employees || []).filter(e => e.session === currentSession);
  const sessionFees = data.fees.filter(f => f.session === currentSession);
  const sessionExpenses = (data.expenses || []).filter(e => e.session === currentSession);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard 
          data={data} 
          currency={currencySymbol} 
          onUpdateSettings={handleUpdateSettings} 
          onNavigateToFees={() => setCurrentView(ViewState.FEES)} 
          onNavigateToExpenses={() => setCurrentView(ViewState.EXPENSES)} 
          onNavigateToEmployees={() => setCurrentView(ViewState.EMPLOYEES)}
          onViewStudentProfile={id => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }} 
          onNavigateToSettings={() => setCurrentView(ViewState.SETTINGS)} 
          onDeleteFee={handleDeleteFee} 
          onDeleteExpense={handleDeleteExpense} 
          onEditStudent={(id) => { setStudentIdToEdit(id); setCurrentView(ViewState.STUDENTS); }}
          onSoftDeleteStudent={handleSoftDeleteStudent}
          onRestoreStudent={handleRestoreStudent}
          onPayFees={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onTogglePinNote={handleTogglePinNote}
          onLogoutPortal={() => { setLoginTab('EMPLOYEE'); setShowLanding(false); setIsLocked(true); }}
          userRole={userRole} 
          currentStudentId={currentStudentId} 
          syncStatus={syncStatus} 
          onManualSync={handleManualSync} 
        />;
      case ViewState.STUDENTS:
        return <Students students={sessionStudents} classes={data.classes} fees={sessionFees} currency={currencySymbol} settings={data.settings} onAddStudent={handleAddStudent} onEditStudent={handleEditStudent} onDeleteStudent={handleSoftDeleteStudent} onAddClass={(name) => setData(prev => ({ ...prev, classes: [...prev.classes, name] }))} onDeleteClass={(name) => setData(prev => ({ ...prev, classes: prev.classes.filter(c => c !== name) }))} onNavigateToFees={id => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }} onViewProfile={id => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }} onViewParent={s => { setSelectedParent({ name: s.parentName, phone: s.phone, address: s.address || '' }); setCurrentView(ViewState.PARENT_PROFILE); }} onNavigateToInquiry={() => setCurrentView(ViewState.NEW_INQUIRY)} onNavigateToAttendance={() => setCurrentView(ViewState.ATTENDANCE)} initialEditingId={studentIdToEdit} onClearEditingId={() => setStudentIdToEdit(null)} syncStatus={syncStatus} onManualSync={handleManualSync} session={data.schoolProfile.currentSession} />;
      case ViewState.ATTENDANCE:
        return <Attendance 
          students={sessionStudents} 
          classes={data.classes} 
          attendance={data.attendance} 
          onSaveAttendance={handleSaveAttendance} 
          onBack={() => setCurrentView(ViewState.STUDENTS)} 
          onEditStudent={(id) => { setStudentIdToEdit(id); setCurrentView(ViewState.STUDENTS); }}
          onViewProfile={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }}
          onPayFees={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }}
          onSoftDeleteStudent={handleSoftDeleteStudent}
          onRestoreStudent={handleRestoreStudent}
        />;
      case ViewState.EMPLOYEES:
        return <Employees 
          employees={sessionEmployees} 
          attendance={data.employeeAttendance}
          onSaveAttendance={handleSaveEmployeeAttendance}
          currency={currencySymbol} 
          onAddEmployee={handleAddEmployee} 
          onEditEmployee={handleEditEmployee} 
          onDeleteEmployee={handleDeleteEmployee} 
          onViewProfile={id => { setSelectedEmployeeId(id); setCurrentView(ViewState.EMPLOYEE_PROFILE); }} 
          onRecordPayment={handleRecordEmployeePayment} 
          onNotify={showNotification} 
          syncStatus={syncStatus} 
          onManualSync={handleManualSync} 
          session={data.schoolProfile.currentSession} 
        />;
      case ViewState.EMPLOYEE_PROFILE:
        {
           const employee = sessionEmployees.find(e => e.id === selectedEmployeeId);
           if (!employee) return <div className="p-8 text-center text-slate-500 font-bold">Employee not found.</div>;
           return <EmployeeProfile employee={employee} expenses={sessionExpenses} schoolData={data.schoolProfile} currency={currencySymbol} onBack={() => setCurrentView(ViewState.EMPLOYEES)} onNavigateToEdit={(id) => { setSelectedEmployeeId(id); setCurrentView(ViewState.EMPLOYEES); }} onDelete={(id) => { handleDeleteEmployee(id); setCurrentView(ViewState.EMPLOYEES); }} onRecordPayment={handleRecordEmployeePayment} onNotify={showNotification} />;
        }
      case ViewState.STUDENT_PROFILE:
        {
           const studentIdToView = userRole === 'STUDENT' ? currentStudentId : selectedStudentId;
           const student = sessionStudents.find(s => s.id === studentIdToView);
           if (!student) return <div className="p-8 text-center text-slate-500 font-bold">Student not found.</div>;
           return <StudentProfile student={student} fees={sessionFees} attendance={data.attendance} schoolData={data.schoolProfile} currency={currencySymbol} onBack={() => setCurrentView(userRole === 'STUDENT' ? ViewState.DASHBOARD : ViewState.STUDENTS)} onNavigateToFees={id => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }} onNavigateToEdit={(id) => { setStudentIdToEdit(id); setCurrentView(ViewState.STUDENTS); }} onDelete={(id) => { handleSoftDeleteStudent(id); setCurrentView(ViewState.STUDENTS); }} onUpdateStudent={handleEditStudent} onNotify={showNotification} userRole={userRole} />;
        }
      case ViewState.PARENT_PROFILE:
        {
            let parentData = selectedParent;
            if (userRole === 'STUDENT' && currentStudentId) {
                const s = data.students.find(std => std.id === currentStudentId);
                if (s) parentData = { name: s.parentName, phone: s.phone, address: s.address || '' };
            }
            if (!parentData) return <div className="p-8 text-center text-slate-500 font-bold">Parent data not available.</div>;
            return <ParentProfile 
              parentName={parentData.name} 
              parentPhone={parentData.phone} 
              parentAddress={parentData.address} 
              students={sessionStudents} 
              fees={sessionFees} 
              currency={currencySymbol} 
              schoolProfile={data.schoolProfile}
              settings={data.settings}
              onBack={() => setCurrentView(userRole === 'STUDENT' ? ViewState.DASHBOARD : ViewState.STUDENTS)} 
              onNavigateToStudent={id => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_PROFILE); }} 
              onNavigateToFees={(studentId) => { if (studentId) setSelectedStudentId(studentId); setCurrentView(ViewState.FEES); }} 
              userRole={userRole} 
            />;
        }
      case ViewState.FEES:
        {
            const studentIdFilter = userRole === 'STUDENT' ? currentStudentId : selectedStudentId;
            return <Fees fees={sessionFees} students={sessionStudents} classes={data.classes} feeCategories={data.feeCategories} schoolProfile={data.schoolProfile} currency={currencySymbol} settings={data.settings} onAddFee={handleAddFee} onUpdateFee={handleUpdateFee} onDeleteFee={handleDeleteFee} onUpdateFeeStatus={async (id, status) => { setData(prev => ({ ...prev, fees: prev.fees.map(f => f.id === id ? { ...f, status } : f) })); const { error } = await supabase.from('fees').update({ status }).eq('id', id); if (error) showNotification(`❌ Update Failed: ${error.message}`, 'error'); }} initialStudentId={studentIdFilter} userRole={userRole} syncStatus={syncStatus} onManualSync={handleManualSync} />;
        }
      case ViewState.EXPENSES:
        return <Expenses expenses={sessionExpenses} currency={currencySymbol} onAddExpense={handleAddExpense} onEditExpense={async e => { setData(prev => ({ ...prev, expenses: prev.expenses.map(old => old.id === e.id ? e : old) })); const { error } = await supabase.from('expenses').upsert(e); if (error) showNotification(`❌ Update Failed: ${error.message}`, 'error'); }} onDeleteExpense={handleDeleteExpense} initialFormData={initialExpenseData || undefined} onClearInitialData={() => setInitialExpenseData(null)} syncStatus={syncStatus} onManualSync={handleManualSync} session={data.schoolProfile.currentSession} />;
      case ViewState.RECYCLE_BIN:
        const recycleData = { ...data, students: sessionStudents, employees: sessionEmployees, fees: sessionFees, expenses: sessionExpenses };
        return <RecycleBin data={recycleData} currency={currencySymbol} onRestoreStudent={async id => { setData(prev => ({ ...prev, students: prev.students.map(s => s.id === id ? { ...s, isDeleted: false, deletedAt: undefined } : s) })); const { error } = await supabase.from('students').update({ isDeleted: false, deletedAt: null }).eq('id', id); if (error) showNotification(`❌ Restore Failed: ${error.message}`, 'error'); }} onRestoreEmployee={async id => { setData(prev => ({ ...prev, employees: prev.employees.map(e => e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e) })); const { error } = await supabase.from('employees').update({ isDeleted: false, deletedAt: null }).eq('id', id); if (error) showNotification(`❌ Restore Failed: ${error.message}`, 'error'); }} onRestoreFee={async id => { setData(prev => ({ ...prev, fees: prev.fees.map(f => f.id === id ? { ...f, isDeleted: false, deletedAt: undefined } : f) })); const { error } = await supabase.from('fees').update({ isDeleted: false, deletedAt: null }).eq('id', id); if (error) showNotification(`❌ Restore Failed: ${error.message}`, 'error'); }} onRestoreExpense={async id => { setData(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e) })); const { error } = await supabase.from('expenses').update({ isDeleted: false, deletedAt: null }).eq('id', id); if (error) showNotification(`❌ Restore Failed: ${error.message}`, 'error'); }} onHardDeleteStudent={async id => { setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) })); const { error } = await supabase.from('students').delete().eq('id', id); if (error) showNotification(`❌ Delete Failed: ${error.message}`, 'error'); }} onHardDeleteEmployee={async id => { setData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== id) })); const { error } = await supabase.from('employees').delete().eq('id', id); if (error) showNotification(`❌ Delete Failed: ${error.message}`, 'error'); }} onHardDeleteFee={async id => { setData(prev => ({ ...prev, fees: prev.fees.filter(f => f.id !== id) })); const { error } = await supabase.from('fees').delete().eq('id', id); if (error) showNotification(`❌ Delete Failed: ${error.message}`, 'error'); }} onHardDeleteExpense={async id => { setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) })); const { error } = await supabase.from('expenses').delete().eq('id', id); if (error) showNotification(`❌ Delete Failed: ${error.message}`, 'error'); }} onNotify={showNotification} syncStatus={syncStatus} onManualSync={handleManualSync} session={data.schoolProfile.currentSession} />;
      case ViewState.SCHOOL_PROFILE:
        return (
          <Profiles 
            type="SCHOOL" 
            schoolData={data.schoolProfile} 
            userData={data.userProfile} 
            students={data.students} 
            fees={data.fees} 
            expenses={data.expenses} 
            onUpdateSchool={p => setData(prev => ({ ...prev, schoolProfile: p }))} 
            onUpdateUser={u => setData(prev => ({ ...prev, userProfile: u }))} 
            onNotify={showNotification} 
            onNavigateToDashboard={() => setCurrentView(ViewState.DASHBOARD)} 
            syncStatus={syncStatus}
            onManualSync={handleManualSync}
            session={data.schoolProfile.currentSession}
          />
        );
      case ViewState.USER_PROFILE:
        if (userRole === 'STUDENT') {
            const student = sessionStudents.find(s => s.id === currentStudentId);
            if (!student) return <div className="p-8 text-center text-slate-500 font-bold">Student not found.</div>;
            return <StudentProfile student={student} fees={sessionFees} attendance={data.attendance} schoolData={data.schoolProfile} currency={currencySymbol} onBack={() => setCurrentView(ViewState.DASHBOARD)} onNavigateToFees={id => { setSelectedStudentId(id); setCurrentView(ViewState.FEES); }} onNavigateToEdit={(id) => { setStudentIdToEdit(id); setCurrentView(ViewState.STUDENTS); }} onDelete={(id) => { handleSoftDeleteStudent(id); setCurrentView(ViewState.STUDENTS); }} onUpdateStudent={handleEditStudent} onNotify={showNotification} userRole={userRole} />;
        }
        return (
          <Profiles 
            type="USER" 
            schoolData={data.schoolProfile} 
            userData={data.userProfile} 
            onUpdateSchool={p => setData(prev => ({ ...prev, schoolProfile: p }))} 
            onUpdateUser={u => setData(prev => ({ ...prev, userProfile: u }))} 
            onNotify={showNotification} 
            syncStatus={syncStatus}
            onManualSync={handleManualSync}
            session={data.schoolProfile.currentSession}
          />
        );
      case ViewState.SETTINGS:
        return (
          <Settings 
            settings={data.settings} 
            data={data} 
            onUpdateSettings={handleUpdateSettings} 
            onLoadData={newData => setData(newData)} 
            onFactoryReset={handleFactoryReset} 
            onNotify={showNotification}
            syncStatus={syncStatus}
            dbSyncError={dbSyncError}
            onManualSync={handleManualSync}
            session={data.schoolProfile.currentSession}
          />
        );
      case ViewState.GOOGLE_PHOTOS:
        return <GooglePhotos settings={data.settings} />;
      case ViewState.EMPLOYEE_DASHBOARD:
        return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest leading-tight">Redirecting to Staff Portal...</div>;
      case ViewState.NEW_INQUIRY:
        return (
          <NewInquiry 
            classes={data.classes} 
            inquiries={data.inquiries}
            onAddInquiry={handleAddInquiry}
            onUpdateInquiry={handleUpdateInquiry}
            onDeleteInquiry={handleDeleteInquiry}
            onConvertToStudent={handleConvertToStudent}
            onBack={() => setCurrentView(ViewState.STUDENTS)} 
            onNotify={showNotification} 
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500 font-bold">Please select an option.</div>;
    }
  };

  const [activeStatusIdx, setActiveStatusIdx] = useState(0);

  useEffect(() => {
    if (!isInitialized && data.settings.loadingScreen.showStatusMessages) {
      const interval = setInterval(() => {
        setActiveStatusIdx(prev => (prev + 1) % data.settings.loadingScreen.statusMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, data.settings.loadingScreen.showStatusMessages, data.settings.loadingScreen.statusMessages.length]);

  if (!isInitialized) {
    const ls = data.settings.loadingScreen;
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-screen flex flex-col items-center justify-center overflow-hidden relative font-sans"
        style={{ backgroundColor: ls.backgroundColor }}
      >
        {/* Modern Abstract Mesh Background */}
        <div className="absolute inset-0 z-0">
          {/* Animated Mesh Gradient */}
          <motion.div 
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 20%, #e0e7ff 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, #e0e7ff 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, #e0e7ff 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, #e0e7ff 0%, transparent 50%)",
                "radial-gradient(circle at 20% 20%, #e0e7ff 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-40"
          />

          {/* Floating Geometric Outlines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                rotate: 360,
                x: [0, 100, -100, 0],
                y: [0, -50, 50, 0],
              }}
              transition={{ 
                duration: 20 + i * 5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute border border-indigo-200/30 rounded-3xl pointer-events-none"
              style={{ 
                width: 200 + i * 100, 
                height: 200 + i * 100, 
                top: `${20 + i * 10}%`, 
                left: `${10 + i * 15}%`,
                opacity: 0.1 + i * 0.05
              }}
            />
          ))}

          {/* Subtle Particle Field */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [-20, 20, -20],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ 
                  duration: 3 + i % 4, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%` 
                }}
              />
            ))}
          </div>

          {/* Vignette Overlay */}
          <div 
            className="absolute inset-0" 
            style={{ background: `radial-gradient(circle at 50% 50%, transparent 0%, ${ls.backgroundColor}cc 100%)` }}
          />
        </div>
        
        <div className="max-w-xl w-full mx-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`p-12 md:p-16 flex flex-col items-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] relative overflow-hidden rounded-${ls.cardRoundness}`}
            style={{ backgroundColor: ls.cardColor }}
          >
            {/* Google Photos inspired multi-color top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="flex-1 bg-[#4285F4]"></div>
              <div className="flex-1 bg-[#EA4335]"></div>
              <div className="flex-1 bg-[#FBBC05]"></div>
              <div className="flex-1 bg-[#34A853]"></div>
            </div>

            {/* Subtle Card Shimmer Effect */}
            {ls.showShimmer && (
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4 / ls.animationSpeed, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/30 to-transparent -skew-x-12 pointer-events-none"
              />
            )}

            {/* Logo in Center */}
            {ls.showLogo && (
              <div className="relative mb-12">
                <div
                  className="bg-white rounded-[2rem] p-5 shadow-lg flex items-center justify-center overflow-hidden border border-slate-100 relative z-10"
                  style={{ width: ls.logoSize, height: ls.logoSize }}
                >
                  {data.schoolProfile.logo ? (
                    <img 
                      src={data.schoolProfile.logo} 
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span style={{ fontSize: ls.logoSize / 2.5 }}>🏫</span>
                  )}
                </div>
                
                {/* Subtle Pulse Effect */}
                {ls.showPulse && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3 / ls.animationSpeed, repeat: Infinity }}
                    className="absolute inset-0 rounded-[2rem] bg-[#4285F4]/10 -z-10"
                  />
                )}
              </div>
            )}

            {/* Identity & Status */}
            <div className="text-center space-y-6 w-full">
              <div>
                {ls.showSchoolName && (
                  <h1 
                    className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2"
                    style={{ color: ls.schoolNameColor }}
                  >
                    {data.schoolProfile.name || 'Education Hills'}
                  </h1>
                )}
                {ls.showMotto && (
                  <p 
                    className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] italic"
                    style={{ color: ls.mottoColor }}
                  >
                    "{data.schoolProfile.motto || 'Excellence in Education'}"
                  </p>
                )}
              </div>

              {/* Session Card */}
              <div className="flex flex-col items-center gap-4">
                {ls.showSession && (
                  <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#34A853] rounded-full animate-pulse"></span>
                      Academic Session: {data.schoolProfile.currentSession}
                    </span>
                  </div>
                )}

                {/* Processing Bar */}
                {ls.showProgressBar && (
                  <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ 
                        x: ['-100%', '100%'],
                      }}
                      transition={{ 
                        duration: 2.5 / ls.animationSpeed, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className={`h-full w-1/2 rounded-full ${ls.useGradientProgress ? 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05]' : ''}`}
                      style={{ backgroundColor: ls.useGradientProgress ? undefined : ls.progressBarColor }}
                    />
                  </div>
                )}
              </div>

              {/* Technical Status Messages */}
              {ls.showStatusMessages && (
                <div className="h-12 flex flex-col items-center justify-center overflow-hidden">
                  <motion.div 
                    key={activeStatusIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-8"
                  >
                    <span 
                      className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap"
                      style={{ color: ls.statusMessageColor }}
                    >
                      {ls.statusMessages[activeStatusIdx]
                        ?.replace('{{school}}', data.schoolProfile.name || 'School')
                        ?.replace('{{session}}', data.schoolProfile.currentSession || 'Current Session')
                        ?.replace('{{motto}}', data.schoolProfile.motto || 'Excellence in Education')}
                    </span>
                  </motion.div>
                </div>
              )}

              {/* Minimal Info */}
              <div className="pt-6 border-t border-slate-100 flex justify-center items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] gap-2">
                <span>{data.schoolProfile.name}</span>
                <span className="text-slate-200">•</span>
                <span>Session {data.schoolProfile.currentSession}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Professional Footer */}
        {ls.showFooter && (
          <div className="absolute bottom-12 w-full text-center z-10">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.8em]">
              Enterprise Grade Security • Encrypted Session
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  if (showPublicGallery) {
      return (
        <div className="h-screen flex flex-col">
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => setShowPublicGallery(false)}
              className="flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 transition-colors"
            >
              <span>←</span> Back to Home
            </button>
            <button 
              onClick={() => { setShowPublicGallery(false); setShowLanding(false); }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100"
            >
              Login to Portal
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <GooglePhotos settings={data.settings} />
          </div>
        </div>
      );
  }

  if (showLanding && isLocked) {
      return <LandingPage onLogin={(role) => { setLoginTab(role); setShowLanding(false); }} notes={data.notes} schoolProfile={data.schoolProfile as any} socialMedia={data.settings.socialMedia} landingPageSettings={data.settings.landingPage} userProfile={data.userProfile} imageSlider={data.settings.imageSlider} students={data.students} employees={data.employees} onNavigateToGooglePhotos={() => setShowPublicGallery(true)} />;
  }

  if (isLocked) {
      return <LockScreen 
        schoolData={data.schoolProfile} 
        userData={data.userProfile} 
        students={data.students} 
        employees={data.employees}
        classes={data.classes} 
        correctPin={data.settings.security.pin} 
        initialTab={loginTab} 
        onUnlock={(role, id) => { 
          setIsLocked(false); 
          setUserRole(role); 
          if (role === 'STUDENT') {
            setCurrentStudentId(id || null);
            setCurrentView(ViewState.DASHBOARD);
          } else if (role === 'EMPLOYEE') {
            setCurrentEmployeeId(id || null);
            setCurrentView(ViewState.EMPLOYEE_DASHBOARD);
          }
        }} 
        onAddInquiry={(inq) => handleAddInquiry({ studentName: inq.name, grade: inq.grade, parentName: inq.parentName, phone: inq.phone, email: '', message: `Initial Admission Application. Address: ${inq.address}. DOB: ${inq.dob}` })} 
        onBackToLanding={() => setShowLanding(true)} 
      />;
  }

  if (isEmployeePortal) {
    if (userRole === 'EMPLOYEE' && currentEmployeeId) {
      const employee = data.employees.find(e => e.id === currentEmployeeId);
      if (employee) {
        return (
          <div className="h-screen w-screen overflow-y-auto bg-white">
             {notification && <NotificationToast message={notification.message} type={notification.type} styleVariant={data.settings.notificationStyle} onClose={() => setNotification(null)} />}
             <EmployeeDashboard 
                employee={employee}
                attendance={data.employeeAttendance || []}
                students={sessionStudents}
                studentAttendance={data.attendance}
                classes={data.classes}
                onSaveStudentAttendance={handleSaveAttendance}
                expenses={data.expenses}
                schoolProfile={data.schoolProfile}
                onLogout={() => { setIsLocked(true); setCurrentView(ViewState.DASHBOARD); }}
                onViewAttendance={() => { /* Navigation handled internally now */ }}
                onNotify={showNotification}
              />
          </div>
        );
      }
    }
  }

  return (
    <div className="flex h-screen bg-transparent font-sans text-slate-900 overflow-hidden">
      {notification && <NotificationToast message={notification.message} type={notification.type} styleVariant={data.settings.notificationStyle} onClose={() => setNotification(null)} />}
      <Sidebar currentView={currentView} onChangeView={view => { setCurrentView(view); if (userRole !== 'STUDENT') { setSelectedStudentId(null); setSelectedParent(null); } }} isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} schoolProfile={data.schoolProfile} settings={data.settings} userRole={userRole} onLogout={() => setIsLocked(true)} />
      <main className="flex-1 overflow-y-auto flex flex-col relative bg-transparent">
        <AnimatedBackground view={currentView} />
        <TopBar 
          currentView={currentView} 
          user={topBarUser} 
          session={data.schoolProfile.currentSession} 
          notifications={notificationHistory} 
          onClearNotifications={handleClearNotifications} 
          isSidebarCollapsed={isSidebarCollapsed} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          onOpenProfile={() => setCurrentView(userRole === 'STUDENT' ? ViewState.STUDENT_PROFILE : ViewState.USER_PROFILE)} 
          userRole={userRole}
          syncStatus={syncStatus}
        />
        <div className="flex-1 overflow-auto p-4 md:p-8 z-10 relative flex flex-col">
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