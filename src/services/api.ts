import axios from 'axios';
import type {
  DashboardData,
  Job,
  Application,
  Agreement,
  Review,
  RiskAlert,
  Student,
  Enterprise,
  Counselor,
  DuplicateSigningBlockDTO,
  AgreementChangeRequest,
  AgreementVersion,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  },
);

export const getDashboard = () => api.get<DashboardData>('/dashboard').then((r) => r.data);

export const getJobs = (params?: Record<string, string>) => api.get<Job[]>('/jobs', { params }).then((r) => r.data);
export const getJob = (id: number) => api.get<Job>(`/jobs/${id}`).then((r) => r.data);
export const createJob = (data: Partial<Job>) => api.post<Job>('/jobs', data).then((r) => r.data);
export const updateJob = (id: number, data: Partial<Job>) => api.put<Job>(`/jobs/${id}`, data).then((r) => r.data);
export const withdrawJob = (id: number) => api.put<Job>(`/jobs/${id}/withdraw`).then((r) => r.data);

export const getApplications = (params?: Record<string, string>) => api.get<Application[]>('/applications', { params }).then((r) => r.data);
export const createApplication = (data: Partial<Application>) => api.post<Application>('/applications', data).then((r) => r.data);
export const getApplication = (id: number) => api.get<Application>(`/applications/${id}`).then((r) => r.data);
export const interviewApplication = (id: number, data: { interviewTime: string; interviewLocation: string; interviewMethod: string }) =>
  api.put<Application>(`/applications/${id}/interview`, data).then((r) => r.data);
export const hireApplication = (id: number) => api.put<Application>(`/applications/${id}/hire`).then((r) => r.data);
export const hireApplicationWithRenounce = (
  id: number,
  data: { renounceApplicationId?: number; renounceReason: string },
) => api.put<Application>(`/applications/${id}/hire-with-renounce`, data).then((r) => r.data);
export const rejectApplication = (id: number) => api.put<Application>(`/applications/${id}/reject`).then((r) => r.data);
export const renounceApplication = (id: number, data: { renounceReason: string }) =>
  api.put<Application>(`/applications/${id}/renounce`, data).then((r) => r.data);
export const checkDuplicateSigning = (studentId: number, jobId: number) =>
  api.get<DuplicateSigningBlockDTO>('/applications/check-duplicate', { params: { studentId, jobId } }).then((r) => r.data);

export const getAgreements = (params?: Record<string, string>) => api.get<Agreement[]>('/agreements', { params }).then((r) => r.data);
export const createAgreement = (data: Partial<Agreement>) => api.post<Agreement>('/agreements', data).then((r) => r.data);
export const getAgreement = (id: number) => api.get<Agreement>(`/agreements/${id}`).then((r) => r.data);
export const stampAgreement = (id: number) => api.put<Agreement>(`/agreements/${id}/stamp`).then((r) => r.data);
export const changeAgreement = (id: number, data: { changeReason: string }) =>
  api.put<Agreement>(`/agreements/${id}/change`, { reason: data.changeReason }).then((r) => r.data);
export const breachAgreement = (id: number, data: { breachReason: string; breachParty: string }) =>
  api.put<Agreement>(`/agreements/${id}/breach`, { reason: data.breachReason, party: data.breachParty }).then((r) => r.data);
export const activateAgreement = (id: number) => api.put<Agreement>(`/agreements/${id}/activate`).then((r) => r.data);
export const completeAgreement = (id: number) => api.put<Agreement>(`/agreements/${id}/complete`).then((r) => r.data);

export const getChangeRequests = (params?: Record<string, string>) =>
  api.get<AgreementChangeRequest[]>('/agreement-changes', { params }).then((r) => r.data);
export const getChangeRequest = (id: number) => api.get<AgreementChangeRequest>(`/agreement-changes/${id}`).then((r) => r.data);
export const createChangeRequest = (data: {
  agreementId: number;
  initiatedBy: number;
  changeReason: string;
  newLocation?: string;
  newSalaryRange?: string;
  newMentorName?: string;
  newReportTime?: string;
}) => api.post<AgreementChangeRequest>('/agreement-changes', data).then((r) => r.data);
export const confirmChangeRequest = (
  id: number,
  data: { role: string; comment?: string; counselorId?: number },
) => api.put<AgreementChangeRequest>(`/agreement-changes/${id}/confirm`, data).then((r) => r.data);
export const rejectChangeRequest = (
  id: number,
  data: { role: string; rejectionReason: string },
) => api.put<AgreementChangeRequest>(`/agreement-changes/${id}/reject`, data).then((r) => r.data);
export const getAgreementVersions = (agreementId: number) =>
  api.get<AgreementVersion[]>(`/agreement-changes/versions/${agreementId}`).then((r) => r.data);

export const getReviews = (params?: Record<string, string>) => api.get<Review[]>('/reviews', { params }).then((r) => r.data);
export const approveReview = (id: number, data: { comment: string }) => api.put<Review>(`/reviews/${id}/approve`, data).then((r) => r.data);
export const rejectReview = (id: number, data: { comment: string }) => api.put<Review>(`/reviews/${id}/reject`, data).then((r) => r.data);

export const getStudents = (params?: Record<string, string>) => api.get<Student[]>('/students', { params }).then((r) => r.data);
export const getStudent = (id: number) => api.get<Student>(`/students/${id}`).then((r) => r.data);
export const updateStudent = (id: number, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data).then((r) => r.data);

export const getRisks = (params?: Record<string, string>) => api.get<RiskAlert[]>('/risks', { params }).then((r) => r.data);
export const getRisk = (id: number) => api.get<RiskAlert>(`/risks/${id}`).then((r) => r.data);
export const resolveRisk = (id: number, data: { resolution: string }) => api.put<RiskAlert>(`/risks/${id}/resolve`, data).then((r) => r.data);

export const getCounselors = () => api.get<Counselor[]>('/counselors').then((r) => r.data);
export const getEnterprises = () => api.get<Enterprise[]>('/enterprises').then((r) => r.data);
export const getEnterprise = (id: number) => api.get<Enterprise>(`/enterprises/${id}`).then((r) => r.data);

export default api;
