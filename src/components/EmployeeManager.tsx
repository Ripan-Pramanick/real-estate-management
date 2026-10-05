import React, { useState } from 'react';
import { Employee, Project, UserRole, SystemUserProfile } from '../types';
import { 
  Users, Plus, Trash2, Mail, Phone, Calendar, DollarSign, 
  Briefcase, Filter, UserCheck, UserMinus, X, ShieldAlert, 
  KeyRound, ShieldCheck, Key
} from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  projects: Project[];
  onAddEmployee: (employee: Employee) => void;
  onRemoveEmployee: (id: string) => void;
  onUpdateEmployee: (id: string, updatedFields: Partial<Employee>) => void;
  currentUserRole?: UserRole;
  userProfiles?: SystemUserProfile[];
  onAddUserProfile?: (user: SystemUserProfile) => void;
  onRemoveUserProfile?: (id: string) => void;
  currentUserId?: string;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  projects,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  currentUserRole = 'Admin',
  userProfiles = [],
  onAddUserProfile,
  onRemoveUserProfile,
  currentUserId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'users'>('employees');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Employee['department']>('Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Contractor'>('Active');
  const [assignedProject, setAssignedProject] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Client');
  const [newUserDept, setNewUserDept] = useState('Client Portal');

  const activeStaffCount = employees.filter(e => e.status === 'Active').length;
  const contractorsCount = employees.filter(e => e.status === 'Contractor').length;
  const avgSalary = employees.length > 0 
    ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length) 
    : 0;

  const totalUsers = userProfiles.length;
  const adminUsers = userProfiles.filter(p => p.role === 'Admin').length;
  const clientUsers = userProfiles.filter(p => p.role === 'Client').length;

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !email || !salary) return;

    const newEmp = {
      name,
      role,
      department,
      email,
      phone: phone || null,
      status,
      salary: Number(salary),
      joiningDate: new Date().toISOString().split('T')[0],
      assignedProject: assignedProject || null,
    } as unknown as Employee;

    onAddEmployee(newEmp);
    setShowAddForm(false);

    setName('');
    setRole('');
    setDepartment('Engineering');
    setEmail('');
    setPhone('');
    setSalary('');
    setStatus('Active');
    setAssignedProject('');
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !onAddUserProfile) return;

    const initials = newUserName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

    let colorClass = 'from-blue-500 to-indigo-600 ring-blue-500/20 text-blue-400 bg-blue-950/20 border-blue-900/40';
    if (newUserRole === 'Admin') colorClass = 'from-amber-500 to-orange-600 ring-amber-500/20 text-amber-400 bg-amber-950/20 border-amber-900/40';
    else if (newUserRole === 'ProjectManager') colorClass = 'from-cyan-500 to-blue-600 ring-cyan-500/20 text-cyan-400 bg-cyan-950/20 border-cyan-900/40';
    else if (newUserRole === 'HRManager') colorClass = 'from-emerald-500 to-teal-600 ring-emerald-500/20 text-emerald-400 bg-emerald-950/20 border-emerald-900/40';
    else if (newUserRole === 'PropertyManager') colorClass = 'from-fuchsia-500 to-purple-600 ring-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-950/20 border-fuchsia-900/40';
    else if (newUserRole === 'FinancialOfficer') colorClass = 'from-rose-500 to-red-600 ring-rose-500/20 text-rose-400 bg-rose-950/20 border-rose-900/40';

    const newUser = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      initials,
      passwordDescription: newUserPassword,
      colorClass,
    } as unknown as SystemUserProfile;

    onAddUserProfile(newUser);
    setShowAddUserForm(false);

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('Client');
    setNewUserDept('Client Portal');
  };

  const handleStatusChange = (id: string, newStatus: Employee['status']) => {
    onUpdateEmployee(id, { status: newStatus });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = filterDept === 'all' || emp.department === filterDept;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const filteredUsers = userProfiles.filter(usr => {
    return usr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           usr.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
           usr.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const departments: Employee['department'][] = ['Engineering', 'HR', 'Finance', 'Property Sales', 'Labor', 'Operations'];

  const showSystemLoginsView = currentUserRole === 'Admin';

  return (
    <div className="space-y-6">
      {showSystemLoginsView && (
        <div className="flex border-b border-zinc-850">
          <button
            onClick={() => {
              setActiveSubTab('employees');
              setSearchTerm('');
            }}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'employees'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" /> Operations Staff Roster
          </button>
          <button
            onClick={() => {
              setActiveSubTab('users');
              setSearchTerm('');
            }}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'users'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> System Login Accounts
          </button>
        </div>
      )}

      {activeSubTab === 'employees' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Active Operational Staff</span>
                <h3 className="text-2xl font-semibold text-white mt-1">{activeStaffCount}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Full time payroll coverage</p>
              </div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Subcontractor Roster</span>
                <h3 className="text-2xl font-semibold text-white mt-1">{contractorsCount}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Project-specific contractors</p>
              </div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Average Annual Salary</span>
                <h3 className="text-2xl font-semibold text-white mt-1">${avgSalary.toLocaleString()}/yr</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Market benchmark rate</p>
              </div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
              <input
                type="text"
                placeholder="Search roster by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 w-full sm:w-64"
              />

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="text-xs border border-zinc-800 px-2 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-zinc-800 px-2 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none w-full sm:w-auto"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>

            <button
              id="btn-add-employee"
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer w-full md:w-auto"
            >
              <Plus className="w-4 h-4" /> Recruit New Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id} 
                id={`emp-card-${emp.id}`}
                className="bg-[#111114] border border-zinc-800 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-wider bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                        {emp.id?.substring(0, 8)}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{emp.name}</h4>
                      <p className="text-xs text-zinc-400 font-medium">{emp.role}</p>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold border ${
                      emp.status === 'Active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                      emp.status === 'Contractor' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-900/40' :
                      'bg-amber-950/40 text-amber-400 border-amber-900/40'
                    }`}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] bg-[#09090b] text-zinc-400 px-2 py-1 rounded border border-zinc-850">
                      Dept: {emp.department}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                    {emp.assignedProject && (
                      <div className="flex items-center gap-2 mt-1 bg-zinc-900 text-zinc-300 px-2 py-1 rounded text-[11px] border border-zinc-800">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">On-site: {emp.assignedProject}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Compensation</span>
                    <span className="font-semibold text-white">${emp.salary.toLocaleString()}/yr</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {emp.status === 'Active' ? (
                      <button
                        onClick={() => handleStatusChange(emp.id, 'On Leave')}
                        className="p-1.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-750 hover:bg-zinc-700 transition-colors cursor-pointer"
                        title="Grant Leave"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(emp.id, 'Active')}
                        className="p-1.5 bg-zinc-900 text-white rounded border border-zinc-800 hover:bg-[#111114] transition-colors cursor-pointer"
                        title="Set Active"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      id={`btn-remove-emp-${emp.id}`}
                      onClick={() => onRemoveEmployee(emp.id)}
                      className="p-1.5 bg-rose-950/40 text-rose-400 rounded border border-rose-900/40 hover:bg-rose-900/60 transition-colors cursor-pointer"
                      title="Terminate Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEmployees.length === 0 && (
              <div className="col-span-full bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center">
                <Users className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No employee accounts match the selected filters.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Total Logins</span>
                <h3 className="text-2xl font-semibold text-white mt-1">{totalUsers}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Authorized system identities</p>
              </div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Executive Admins</span>
                <h3 className="text-2xl font-semibold text-amber-400 mt-1">{adminUsers}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Full system root access</p>
              </div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Client Accounts</span>
                <h3 className="text-2xl font-semibold text-blue-400 mt-1">{clientUsers}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">External tenant & buyer portals</p>
              </div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search user accounts by name, email, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 w-full md:w-96"
            />

            <button
              id="btn-register-user"
              onClick={() => setShowAddUserForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer w-full md:w-auto"
            >
              <Plus className="w-4 h-4" /> Register System User & Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredUsers.map(usr => {
              const isMe = usr.id === currentUserId;
              return (
                <div 
                  key={usr.id} 
                  className="bg-[#111114] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${usr.colorClass || 'from-zinc-500 to-zinc-700'} flex items-center justify-center text-white font-bold text-xs`}>
                          {usr.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{usr.name}</h4>
                          <span className="text-[10px] uppercase font-mono tracking-wider bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-850">
                            {usr.id?.substring(0, 8)}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[9px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                        usr.role === 'Admin' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                        usr.role === 'Client' ? 'bg-blue-950/40 text-blue-400 border-blue-900/40' :
                        'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}>
                        {usr.role}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate">{usr.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate">Dept: {usr.department}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded border border-zinc-850 text-white font-semibold">
                        <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Password: <code className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-xs text-zinc-300">{usr.passwordDescription}</code></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-zinc-800 flex items-center justify-between text-xs">
                    {isMe ? (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30">
                        Active Identity (Me)
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Authorized Account</span>
                    )}

                    {!isMe && onRemoveUserProfile && (
                      <button
                        onClick={() => onRemoveUserProfile(usr.id)}
                        className="p-1.5 bg-rose-950/40 text-rose-400 rounded border border-rose-900/40 hover:bg-rose-900/60 transition-colors cursor-pointer"
                        title="Delete User Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="col-span-full bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center">
                <ShieldAlert className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No user access accounts match the selected criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] rounded-lg shadow-xl border border-zinc-800 max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#09090b] border-b border-zinc-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Recruit Corporate Staff</h4>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Full Professional Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Gallagher"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. l.gallagher@apexrealestate.com"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 987-6543"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Target Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Corporate Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Structural Specialist"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Annual Compensation ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Roster Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Active">Active Employee</option>
                    <option value="Contractor">Independent Contractor</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Project Assignment (Optional)
                  </label>
                  <select
                    value={assignedProject}
                    onChange={(e) => setAssignedProject(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="">HQ Pool (No Site Assignment)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded transition-colors cursor-pointer"
                >
                  Record Hires
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddUserForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] rounded-lg shadow-xl border border-zinc-800 max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#09090b] border-b border-zinc-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Register Login User & Role</h4>
              </div>
              <button 
                onClick={() => setShowAddUserForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    User Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Liam Gallagher"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Corporate/Client Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. l.gallagher@apexrealestate.com"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    System Access Role *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      setNewUserRole(role);
                      if (role === 'Client') {
                        setNewUserDept('Client Portal');
                      } else if (role === 'Admin') {
                        setNewUserDept('Executive HQ');
                      } else if (role === 'ProjectManager') {
                        setNewUserDept('Engineering');
                      } else if (role === 'HRManager') {
                        setNewUserDept('Human Resources');
                      } else if (role === 'PropertyManager') {
                        setNewUserDept('Property Sales');
                      } else if (role === 'FinancialOfficer') {
                        setNewUserDept('Finance');
                      }
                    }}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Admin">Executive Admin</option>
                    <option value="ProjectManager">Project & Construction Manager</option>
                    <option value="HRManager">HR & Employee Directory Manager</option>
                    <option value="PropertyManager">Property & Spaces Manager</option>
                    <option value="FinancialOfficer">Financial Officer</option>
                    <option value="Client">External Client / Tenant / Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Credential Passcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="e.g. secure123"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Corporate/Client Department
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    placeholder="e.g. Client Portal"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded transition-colors cursor-pointer"
                >
                  Register Access ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};