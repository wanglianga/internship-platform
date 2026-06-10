export interface Student {
  id: number;
  name: string;
  studentNo: string;
  major: string;
  grade: string;
  phone: string;
  email: string;
  preferredCities: string;
  resume: string;
  courses: string;
  hasBreachRecord: boolean;
}

export interface Enterprise {
  id: number;
  name: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
}

export interface Job {
  id: number;
  enterpriseId: number;
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  majorRequirements: string;
  headcount: number;
  status: 'OPEN' | 'FILLED' | 'WITHDRAWN' | 'CLOSED';
  mentorName: string;
  createdAt: string;
  enterpriseName?: string;
}

export interface Application {
  id: number;
  studentId: number;
  jobId: number;
  status: 'APPLIED' | 'INTERVIEWING' | 'HIRED' | 'REJECTED' | 'DEPARTMENT_REVIEW' | 'AGREEMENT_PENDING' | 'ACTIVE' | 'COMPLETED';
  interviewTime: string;
  interviewLocation: string;
  interviewMethod: string;
  appliedAt: string;
  interviewedAt: string;
  hiredAt: string;
  studentName?: string;
  jobTitle?: string;
  studentMajor?: string;
  jobMajorRequirements?: string;
}

export interface Agreement {
  id: number;
  applicationId: number;
  status: 'PENDING' | 'STAMPED' | 'ACTIVE' | 'CHANGING' | 'BREACHED' | 'COMPLETED';
  generatedAt: string;
  stampedAt: string;
  changeReason: string;
  breachReason: string;
  breachParty: string;
  studentName?: string;
  jobTitle?: string;
  enterpriseName?: string;
}

export interface Review {
  id: number;
  applicationId: number;
  counselorId: number;
  type: 'DEPARTMENT' | 'AGREEMENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment: string;
  reviewedAt: string;
  counselorName?: string;
  studentName?: string;
  jobTitle?: string;
}

export interface RiskAlert {
  id: number;
  type: 'MAJOR_MISMATCH' | 'DUPLICATE_SIGNING' | 'JOB_WITHDRAWN' | 'STUDENT_BREACH';
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'RESOLVED';
  description: string;
  relatedStudentId: number;
  relatedJobId: number;
  relatedAgreementId: number;
  resolution: string;
  detectedAt: string;
  resolvedAt: string;
  studentName?: string;
  jobTitle?: string;
}

export interface Counselor {
  id: number;
  name: string;
  department: string;
  phone: string;
  email: string;
}

export interface DashboardData {
  stats: {
    jobCount: number;
    applicationCount: number;
    pendingReviewCount: number;
    activeAgreementCount: number;
  };
  recentApplications: Array<{
    id: number;
    title: string;
    type: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  pendingReviews: Array<{
    id: number;
    title: string;
    type: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  activeRisks: Array<{
    id: number;
    type: string;
    level: string;
    description: string;
  }>;
  recentActivities: Array<{
    id: number;
    content: string;
    timestamp: string;
    type: string;
  }>;
}

export type UserRole = 'employment_office' | 'student' | 'enterprise' | 'counselor';
