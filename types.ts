
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  STUDENT_PROFILE = 'STUDENT_PROFILE',
  PARENT_PROFILE = 'PARENT_PROFILE',
  EMPLOYEES = 'EMPLOYEES',
  EMPLOYEE_PROFILE = 'EMPLOYEE_PROFILE',
  FEES = 'FEES',
  EXPENSES = 'EXPENSES',
  RECYCLE_BIN = 'RECYCLE_BIN',
  SCHOOL_PROFILE = 'SCHOOL_PROFILE',
  USER_PROFILE = 'USER_PROFILE',
  SETTINGS = 'SETTINGS',
  LANDING = 'LANDING',
  LOCK = 'LOCK',
  NEW_INQUIRY = 'NEW_INQUIRY'
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  phone: string;
  email: string;
  enrollmentDate: string;
  session?: string;
  isDeleted: boolean;
  deletedAt?: string;
  photo?: string;
  dob?: string;
  address?: string;
  totalAgreedFees?: number;
  backLogs?: number;
}

export interface Inquiry {
  id: string;
  studentName: string;
  grade: string;
  parentName: string;
  phone: string;
  email: string;
  message: string;
  date: string;
  status: 'Pending' | 'Contacted' | 'Enrolled' | 'Closed';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  phone: string;
  email: string;
  joiningDate: string;
  status: 'Active' | 'Resigned';
  photo?: string;
  isDeleted: boolean;
  deletedAt?: string;
  session?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  type: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod?: 'Cash' | 'UPI' | 'Online' | 'Bank Transfer' | 'Cheque';
  description?: string;
  isDeleted: boolean;
  deletedAt?: string;
  session?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'Salary' | 'Maintenance' | 'Utilities' | 'Supplies' | 'Events' | 'Other';
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
  description?: string;
  employeeId?: string;
  isDeleted: boolean;
  deletedAt?: string;
  session?: string;
}

export interface AdmissionTimelineItem {
  label: string;
  value: string;
}

export interface SchoolProfileData {
  name: string;
  address: string;
  contactEmail: string;
  contactNumber?: string;
  motto: string;
  website: string;
  sessions: string[];
  currentSession: string;
  logo?: string;
  logoSize?: number;
  banner?: string;
  bannerEffect?: 'Standard' | 'Blur' | 'Sepia' | 'Grayscale' | 'Dark';
  affiliationNumber?: string;
  principalName?: string;
  board?: string;
  establishedYear?: string;
  termsAndConditions?: string;
  authorizedSignature?: string;
  departments?: string[];
  notice?: string;
  leadershipList?: LeadershipCard[];
  admissionTimeline?: AdmissionTimelineItem[];
  requiredDocuments?: string[];
  eligibilityCriteria?: string;
  prospectusUrl?: string;
  admissionFormUrl?: string;
  campusAcres?: string;
  successRate?: string;
}

export interface LeadershipCard {
  id: string;
  name: string;
  role: string;
  experience: string;
  joined: string;
  degree: string;
  session: string;
  specialization: string;
  office: string;
  image: string;
}

export interface UserProfileData {
  name: string;
  role: string;
  email: string;
  bio: string;
  userId: string;
  dateOfBirth: string;
  contactNumber: string;
  photo?: string;
  joiningDate?: string;
  address?: string;
  experience?: string;
  degree?: string;
  session?: string;
  specialization?: string;
  office?: string;
}

export interface SliderImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

export interface LandingPageSettings {
  enabled: boolean;
  showHero: boolean;
  showProfile: boolean;
  showFacilities: boolean;
  showEvents: boolean;
  showStarStudents: boolean;
  showManagement: boolean;
  showGallery: boolean;
  showEcosystem: boolean;
  showStats: boolean;
  showFooter: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'vibrant' | 'glass' | 'modern' | 'ocean';
  fontSize: number;
  language: string;
  enableNotifications: boolean;
  enableAutoBackup: boolean;
  currency: string;
  notificationLimit: number;
  notificationStyle: 'Modern' | 'Minimal' | 'Vibrant' | 'Glass' | 'Pill' | 'Retro' | 'Dark' | 'Gradient' | 'Outline' | 'Float';
  enableLateFees: boolean;
  lateFeePercentage: number;
  lateFeeGracePeriod: number;
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  sidebarAutoCollapse?: boolean;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    whatsapp?: string;
    gmail?: string;
  };
  imageSlider: {
    enabled: boolean;
    autoplay: boolean;
    interval: number;
    images: SliderImage[];
    showDots?: boolean;
    showArrows?: boolean;
  };
  security: {
    enableAppLock: boolean;
    lockTimeout: number;
    pin?: string;
    requirePinForExport?: boolean;
  };
  adsense?: {
    enabled: boolean;
    clientId: string;
    autoAdsEnabled?: boolean;
    testMode?: boolean;
    units: {
      id: string;
      name: string;
      unitId: string;
      format: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
      placement: 'dashboard_top' | 'dashboard_middle' | 'dashboard_bottom' | 'sidebar' | 'student_list_top' | 'fee_receipt_bottom';
    }[];
  };
  landingPage: LandingPageSettings;
}

export interface Note {
  id: string;
  content: string;
  color: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface AppData {
  students: Student[];
  employees: Employee[];
  inquiries: Inquiry[];
  classes: string[];
  feeCategories: string[];
  fees: FeeRecord[];
  expenses: ExpenseRecord[];
  notes: Note[];
  schoolProfile: SchoolProfileData;
  userProfile: UserProfileData;
  settings: AppSettings;
  lastSyncDate?: string;
}