import { useState, useEffect, useCallback } from 'react';
import { UserCircle, MapPin, BookOpen, FileText } from 'lucide-react';
import { getStudents, getStudent, updateStudent } from '../services/api';
import { useAppStore } from '../stores/appStore';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { Student } from '../types';

const profileTabs = [
  { key: 'basic', label: '基本信息', icon: UserCircle },
  { key: 'resume', label: '简历', icon: FileText },
  { key: 'courses', label: '课程安排', icon: BookOpen },
  { key: 'cities', label: '意向城市', icon: MapPin },
];

export default function Students() {
  const { currentRole } = useAppStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});

  const fetchStudents = useCallback(() => {
    setLoading(true);
    getStudents()
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openDetail = async (student: Student) => {
    try {
      const detail = await getStudent(student.id);
      setSelectedStudent(detail);
      setEditForm(detail);
      setEditMode(false);
    } catch {
      setSelectedStudent(student);
      setEditForm(student);
      setEditMode(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    try {
      await updateStudent(selectedStudent.id, editForm);
      setEditMode(false);
      fetchStudents();
      openDetail(selectedStudent);
    } catch { /* */ }
  };

  if (currentRole === 'student') {
    return <StudentProfile student={students[0] || null} loading={loading} />;
  }

  const columns = [
    { key: 'name', title: '姓名' },
    { key: 'studentNo', title: '学号' },
    { key: 'major', title: '专业' },
    { key: 'grade', title: '年级' },
    { key: 'phone', title: '联系电话' },
    { key: 'hasBreachRecord', title: '违约记录', render: (v: unknown) => (v ? <span className="text-red-500 text-xs">有</span> : <span className="text-slate-400 text-xs">无</span>) },
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : (
        <DataTable columns={columns} data={students} onRowClick={openDetail} />
      )}

      <Modal isOpen={!!selectedStudent} onClose={() => { setSelectedStudent(null); setEditMode(false); }} title="学生详情" width="max-w-xl">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              {profileTabs.map((tab) => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setEditMode(false); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg text-sm ${activeTab === tab.key ? 'text-teal-700 border-b-2 border-teal-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'basic' && (
              <div className="space-y-3">
                {editMode ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-slate-500">姓名</label><input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                      <div><label className="text-xs text-slate-500">学号</label><input value={editForm.studentNo || ''} onChange={(e) => setEditForm({ ...editForm, studentNo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" readOnly /></div>
                      <div><label className="text-xs text-slate-500">专业</label><input value={editForm.major || ''} onChange={(e) => setEditForm({ ...editForm, major: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                      <div><label className="text-xs text-slate-500">年级</label><input value={editForm.grade || ''} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                      <div><label className="text-xs text-slate-500">电话</label><input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                      <div><label className="text-xs text-slate-500">邮箱</label><input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">取消</button>
                      <button onClick={handleSave} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800">保存</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-400">姓名:</span> {selectedStudent.name}</div>
                      <div><span className="text-slate-400">学号:</span> {selectedStudent.studentNo}</div>
                      <div><span className="text-slate-400">专业:</span> {selectedStudent.major}</div>
                      <div><span className="text-slate-400">年级:</span> {selectedStudent.grade}</div>
                      <div><span className="text-slate-400">电话:</span> {selectedStudent.phone}</div>
                      <div><span className="text-slate-400">邮箱:</span> {selectedStudent.email}</div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setEditMode(true)} className="px-4 py-2 border border-teal-700 text-teal-700 rounded-lg text-sm hover:bg-teal-50">编辑</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedStudent.resume || '暂无简历'}</div>
            )}
            {activeTab === 'courses' && (
              <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedStudent.courses || '暂无课程安排'}</div>
            )}
            {activeTab === 'cities' && (
              <div className="flex flex-wrap gap-2">
                {selectedStudent.preferredCities ? selectedStudent.preferredCities.split(/[,，]/).filter(Boolean).map((city, i) => (
                  <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm">{city.trim()}</span>
                )) : <span className="text-sm text-slate-400">暂无意向城市</span>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function StudentProfile({ student, loading }: { student: Student | null; loading: boolean }) {
  const [activeTab, setActiveTab] = useState('basic');

  if (loading) return <div className="text-center py-12 text-slate-400">加载中...</div>;
  if (!student) return <div className="text-center py-12 text-slate-400">暂无学生信息</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <UserCircle size={28} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{student.name}</h3>
            <p className="text-sm text-slate-500">{student.major} · {student.grade}</p>
          </div>
        </div>
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {profileTabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg text-sm ${activeTab === tab.key ? 'text-teal-700 border-b-2 border-teal-700 font-medium' : 'text-slate-500'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
        <div className="pt-4">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">学号:</span> {student.studentNo}</div>
              <div><span className="text-slate-400">电话:</span> {student.phone}</div>
              <div><span className="text-slate-400">邮箱:</span> {student.email}</div>
            </div>
          )}
          {activeTab === 'resume' && <div className="text-sm text-slate-600 whitespace-pre-wrap">{student.resume || '暂无简历'}</div>}
          {activeTab === 'courses' && <div className="text-sm text-slate-600 whitespace-pre-wrap">{student.courses || '暂无课程安排'}</div>}
          {activeTab === 'cities' && (
            <div className="flex flex-wrap gap-2">
              {student.preferredCities ? student.preferredCities.split(/[,，]/).filter(Boolean).map((city, i) => (
                <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm">{city.trim()}</span>
              )) : <span className="text-sm text-slate-400">暂无意向城市</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
