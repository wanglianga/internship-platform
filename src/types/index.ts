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
  majorMatched?: boolean;
  cityMatched?: boolean;
  matchScore?: number;
}

export type ApplicationStatus =
  | 'PENDING_SCREENING'
  | 'APPLIED'
  | 'INTERVIEWING'
  | 'PENDING_HIRE'
  | 'HIRED'
  | 'REJECTED'
  | 'DEPARTMENT_REVIEW'
  | 'AGREEMENT_PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'RENOUNCED';

export interface Application {
  id: number;
  studentId: number;
  jobId: number;
  status: ApplicationStatus;
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
  renounceReason?: string;
  renouncedAt?: string;
  reportTime?: string;
  majorMatched?: boolean;
}

export type AgreementStatus =
  | 'PENDING'
  | 'STAMPED'
  | 'ACTIVE'
  | 'CHANGING'
  | 'BREACHED'
  | 'COMPLETED';

export interface Agreement {
  id: number;
  applicationId: number;
  status: AgreementStatus;
  generatedAt: string;
  stampedAt: string;
  changeReason: string;
  breachReason: string;
  breachParty: string;
  studentName?: string;
  jobTitle?: string;
  enterpriseName?: string;
  location?: string;
  salaryRange?: string;
  mentorName?: string;
  reportTime?: string;
  currentVersion?: number;
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

export interface DuplicateSigningBlockDTO {
  blocked: boolean;
  message: string;
  riskWarning: string;
  employmentOfficeRequirement: string;
  existingAgreement?: Agreement;
  existingEnterpriseName?: string;
  existingJobTitle?: string;
  existingStudentName?: string;
}

export type ChangeRequestStatus =
  | 'PENDING'
  | 'ENTERPRISE_CONFIRMED'
  | 'STUDENT_CONFIRMED'
  | 'COUNSELOR_CONFIRMED'
  | 'COMPLETED'
  | 'REJECTED';

export interface AgreementChangeRequest {
  id: number;
  agreementId: number;
  status: ChangeRequestStatus;

  originalLocation: string;
  newLocation: string;
  originalSalaryRange: string;
  newSalaryRange: string;
  originalMentorName: string;
  newMentorName: string;
  originalReportTime: string;
  newReportTime: string;

  changeReason: string;
  initiatedBy: number;
  initiatedAt: string;

  enterpriseConfirmed: boolean;
  enterpriseConfirmedAt?: string;
  enterpriseComment?: string;

  studentConfirmed: boolean;
  studentConfirmedAt?: string;
  studentComment?: string;

  counselorConfirmed: boolean;
  counselorId?: number;
  counselorConfirmedAt?: string;
  counselorComment?: string;

  employmentOfficeConfirmed: boolean;
  employmentOfficeConfirmedAt?: string;
  employmentOfficeComment?: string;

  completedAt?: string;
  rejectionReason?: string;

  studentName?: string;
  jobTitle?: string;
  enterpriseName?: string;
  initiatedByName?: string;
}

export interface AgreementVersion {
  id: number;
  agreementId: number;
  versionNumber: number;
  location: string;
  salaryRange: string;
  mentorName: string;
  reportTime: string;
  changeDescription: string;
  createdBy: number;
  createdAt: string;
  createdByName?: string;
}
