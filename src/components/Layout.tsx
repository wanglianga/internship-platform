import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, FileCheck, AlertTriangle, UserCircle, ClipboardCheck, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { UserRole } from '../types';

const navItems = [
  { path: '/', label: '工作台', icon: LayoutDashboard },
  { path: '/jobs', label: '岗位池', icon: Briefcase },
  { path: '/applications', label: '投递管理', icon: FileText },
  { path: '/agreements', label: '协议管理', icon: FileCheck },
  { path: '/risks', label: '风险提醒', icon: AlertTriangle },
  { path: '/students', label: '学生档案', icon: UserCircle },
  { path: '/reviews', label: '审核中心', icon: ClipboardCheck },
];

const roleLabels: Record<UserRole, string> = {
  employment_office: '就业办',
  student: '学生',
  enterprise: '企业导师',
  counselor: '院系辅导员',
};

const roleColors: Record<UserRole, string> = {
  employment_office: 'bg-teal-500',
  student: 'bg-blue-500',
  enterprise: 'bg-orange-500',
  counselor: 'bg-purple-500',
};

const roleOptions: UserRole[] = ['employment_office', 'student', 'enterprise', 'counselor'];

const pageTitles: Record<string, string> = {
  '/': '工作台',
  '/jobs': '岗位池',
  '/applications': '投递管理',
  '/agreements': '协议管理',
  '/risks': '风险提醒',
  '/students': '学生档案',
  '/reviews': '审核中心',
};

export default function Layout() {
  const { sidebarCollapsed, toggleSidebar, currentRole, setCurrentRole } = useAppStore();
  const location = useLocation();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] || '实习就业管理平台';

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-300 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="h-14 flex items-center justify-center border-b border-slate-700/50">
          {sidebarCollapsed ? (
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
              <span className="text-white font-bold text-sm">实</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
                <span className="text-white font-bold text-sm">实</span>
              </div>
              <span className="text-white font-bold text-base tracking-wide">实习就业平台</span>
            </div>
          )}
        </div>
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-600/90 text-white shadow-lg shadow-teal-600/20'
                    : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={toggleSidebar}
          className="p-3 border-t border-slate-700/50 hover:bg-slate-800/80 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-300"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 text-sm transition-all duration-200 hover:shadow-sm"
              >
                <span className={`w-2 h-2 rounded-full ${roleColors[currentRole]}`} />
                <span className="font-medium text-slate-700">{roleLabels[currentRole]}</span>
              </button>
              {roleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 min-w-[140px] animate-fade-in-up">
                  {roleOptions.map((role) => (
                    <button
                      key={role}
                      onClick={() => { setCurrentRole(role); setRoleDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                        currentRole === role ? 'text-teal-700 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${roleColors[role]}`} />
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
