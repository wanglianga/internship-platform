import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, GraduationCap, Plus, Briefcase, Building2, Users, Star, AlertTriangle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { getJobs, createJob, withdrawJob, getStudents, createApplication, getRecommendedJobs } from '../services/api';
import { useAppStore } from '../stores/appStore';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import type { Job, Student } from '../types';

export default function Jobs() {
  const { currentRole } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', salaryRange: '', majorRequirements: '', headcount: 1, mentorName: '' });
  const [students, setStudents] = useState<Student[]>([]);
  const [showApply, setShowApply] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'recommended'>('all');
  const [majorMismatchWarning, setMajorMismatchWarning] = useState(false);
  const [mismatchStudent, setMismatchStudent] = useState<Student | null>(null);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.keyword = search;
    if (locationFilter) params.location = locationFilter;
    if (majorFilter) params.majorKeyword = majorFilter;
    getJobs(params)
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [search, locationFilter, majorFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (currentRole === 'student') {
      getStudents().then(setStudents).catch(() => setStudents([]));
    }
  }, [currentRole]);

  const handleCreate = async () => {
    try {
      await createJob({ ...form, enterpriseId: 1, status: 'OPEN' });
      setShowCreate(false);
      setForm({ title: '', description: '', location: '', salaryRange: '', majorRequirements: '', headcount: 1, mentorName: '' });
      fetchJobs();
    } catch { /* handled by interceptor */ }
  };

  const handleWithdraw = async (id: number) => {
    try { await withdrawJob(id); fetchJobs(); } catch { /* */ }
  };

  const handleApply = async () => {
    if (!selectedJob || !selectedStudentId) return;
    setApplying(true);
    try {
      await createApplication({ studentId: selectedStudentId, jobId: selectedJob.id } as any);
      setShowApply(false);
      setSelectedStudentId(null);
      setSelectedJob(null);
      setMajorMismatchWarning(false);
      setMismatchStudent(null);
      fetchJobs();
    } catch {
      /* handled by interceptor */
    } finally {
      setApplying(false);
    }
  };

  const checkMajorMismatch = (studentId: number) => {
    if (!selectedJob) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const majorReqs = selectedJob.majorRequirements.split(/[,，]/).map(m => m.trim()).filter(Boolean);
    const isMatch = majorReqs.some(req => student.major.includes(req) || req.includes(student.major));
    if (!isMatch) {
      setMajorMismatchWarning(true);
      setMismatchStudent(student);
    } else {
      setMajorMismatchWarning(false);
      setMismatchStudent(null);
    }
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    checkMajorMismatch(studentId);
  };

  const handleApplyClick = () => {
    if (!selectedJob) return;
    if (selectedStudentId) {
      checkMajorMismatch(selectedStudentId);
    }
    if (!majorMismatchWarning) {
      setShowApply(true);
    } else {
      setShowApply(true);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (search && !j.title.includes(search) && !j.enterpriseName?.includes(search)) return false;
    if (locationFilter && !j.location.includes(locationFilter)) return false;
    if (majorFilter && !j.majorRequirements.includes(majorFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索岗位名称或企业" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="城市" className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:border-teal-500" />
          </div>
          <div className="relative">
            <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)} placeholder="专业" className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:border-teal-500" />
          </div>
          {currentRole === 'enterprise' && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800 transition-colors">
              <Plus size={16} /> 发布岗位
            </button>
          )}
          {currentRole === 'student' && (
            <div className="flex items-center gap-1">
              <button onClick={() => setViewMode('all')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${viewMode === 'all' ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>全部岗位</button>
              <button onClick={() => setViewMode('recommended')} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${viewMode === 'recommended' ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                <Sparkles size={14} /> 为我推荐
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : viewMode === 'recommended' && currentRole === 'student' ? (
        <RecommendedJobs students={students} onJobSelect={setSelectedJob} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div key={job.id} onClick={() => setSelectedJob(job)} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{job.title}</h3>
                <StatusBadge status={job.status} type="job" />
              </div>
              <p className="text-sm text-slate-500 mb-2">{job.enterpriseName}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">{job.salaryRange}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} />{job.location}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {job.majorRequirements.split(/[,，]/).filter(Boolean).map((m, i) => (
                  <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs">{m.trim()}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>导师: {job.mentorName}</span>
                <span>招{job.headcount}人</span>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && <div className="col-span-3 text-center py-12 text-slate-400">暂无岗位</div>}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="发布岗位" width="max-w-xl">
        <div className="space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="岗位名称" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="岗位描述" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="实习地点" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} placeholder="薪资范围" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            <input value={form.majorRequirements} onChange={(e) => setForm({ ...form, majorRequirements: e.target.value })} placeholder="专业要求(逗号分隔)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            <input type="number" value={form.headcount} onChange={(e) => setForm({ ...form, headcount: Number(e.target.value) })} placeholder="招聘人数" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <input value={form.mentorName} onChange={(e) => setForm({ ...form, mentorName: e.target.value })} placeholder="企业导师姓名" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">发布</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="岗位详情" width="max-w-xl">
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">{selectedJob.title}</h3>
              <StatusBadge status={selectedJob.status} type="job" />
            </div>
            <p className="text-sm text-slate-500">{selectedJob.enterpriseName}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">薪资:</span> <span className="text-orange-500 font-medium">{selectedJob.salaryRange}</span></div>
              <div><span className="text-slate-400">实习地点:</span> {selectedJob.location}</div>
              <div><span className="text-slate-400">企业导师:</span> {selectedJob.mentorName}</div>
              <div><span className="text-slate-400">招聘人数:</span> {selectedJob.headcount}</div>
            </div>
            <div>
              <span className="text-sm text-slate-400">专业要求:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedJob.majorRequirements.split(/[,，]/).filter(Boolean).map((m, i) => (
                  <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs">{m.trim()}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-400">岗位描述:</span>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{selectedJob.description}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {currentRole === 'student' && selectedJob.status === 'OPEN' && (
                <button onClick={handleApplyClick} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">投递申请</button>
              )}
              {currentRole === 'enterprise' && selectedJob.status === 'OPEN' && (
                <button onClick={() => { handleWithdraw(selectedJob.id); setSelectedJob(null); }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">撤回岗位</button>
              )}
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">关闭</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showApply} onClose={() => { setShowApply(false); setMajorMismatchWarning(false); setMismatchStudent(null); }} title="投递申请" width="max-w-md">
        <div className="space-y-3">
          {selectedJob && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p className="font-medium">{selectedJob.title}</p>
              <p className="text-slate-400">{selectedJob.enterpriseName} · {selectedJob.location}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-slate-600 mb-1 block">选择学生身份</label>
            <select
              value={selectedStudentId ?? ''}
              onChange={(e) => handleStudentSelect(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="">请选择学生</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - {s.studentNo} ({s.major})</option>
              ))}
            </select>
          </div>
          {majorMismatchWarning && mismatchStudent && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-700 font-medium">专业不匹配提示</p>
                  <p className="text-amber-600 mt-1">您的专业「{mismatchStudent.major}」与该岗位要求「{selectedJob?.majorRequirements}」不完全匹配。</p>
                  <p className="text-amber-500 mt-1">您仍可投递，但企业可能会优先筛选专业匹配的申请。</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowApply(false); setMajorMismatchWarning(false); setMismatchStudent(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
            <button
              onClick={handleApply}
              disabled={!selectedStudentId || applying}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? '投递中...' : majorMismatchWarning ? '仍要投递' : '确认投递'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RecommendedJobs({ students, onJobSelect }: { students: Student[]; onJobSelect: (job: Job) => void }) {
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const fetchRecommended = useCallback(() => {
    if (!selectedStudentId) return;
    setLoading(true);
    getRecommendedJobs(selectedStudentId)
      .then(setRecommendedJobs)
      .catch(() => setRecommendedJobs([]))
      .finally(() => setLoading(false));
  }, [selectedStudentId]);

  useEffect(() => { fetchRecommended(); }, [fetchRecommended]);

  const currentStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-teal-600" />
          <span className="text-sm font-medium text-slate-700">智能推荐</span>
          {currentStudent && (
            <span className="text-xs text-slate-400">
              根据专业「{currentStudent.major}」和意向城市「{currentStudent.preferredCities}」匹配
            </span>
          )}
          <select
            value={selectedStudentId ?? ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="ml-auto px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.major})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载推荐岗位中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedJobs.map((job) => (
            <div key={job.id} onClick={() => onJobSelect(job)} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow cursor-pointer relative">
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {job.majorMatched && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium">
                    <CheckCircle2 size={12} /> 专业匹配
                  </span>
                )}
                {!job.majorMatched && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-500 rounded text-xs font-medium">
                    <XCircle size={12} /> 专业不匹配
                  </span>
                )}
                {job.cityMatched && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                    <MapPin size={10} /> 城市匹配
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between mb-2 pr-24">
                <h3 className="font-semibold text-slate-800">{job.title}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-2">{job.enterpriseName}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">{job.salaryRange}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} />{job.location}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {job.majorRequirements.split(/[,，]/).filter(Boolean).map((m, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded text-xs ${currentStudent?.major && m.trim().includes(currentStudent.major) ? 'bg-green-50 text-green-700' : 'bg-teal-50 text-teal-700'}`}>{m.trim()}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>导师: {job.mentorName}</span>
                <span>招{job.headcount}人</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Star size={12} className={job.matchScore && job.matchScore >= 2 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                <Star size={12} className={job.matchScore && job.matchScore >= 2 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                <Star size={12} className={job.matchScore && job.matchScore >= 3 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                <span className="text-xs text-slate-400 ml-1">匹配度</span>
              </div>
            </div>
          ))}
          {recommendedJobs.length === 0 && <div className="col-span-3 text-center py-12 text-slate-400">暂无推荐岗位</div>}
        </div>
      )}
    </div>
  );
}
