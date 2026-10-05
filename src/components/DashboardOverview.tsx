import React from 'react';
import { Project, Employee, Asset, Expense, Apartment } from '../types';
import { 
  Building2, Briefcase, DollarSign, Users, ShieldAlert, 
  Wrench, CheckCircle, TrendingUp, Percent
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface DashboardOverviewProps {
  projects: Project[];
  employees: Employee[];
  assets: Asset[];
  expenses: Expense[];
  apartments: Apartment[];
  onNavigateToRole: (role: any) => void;
  isBasicPlan?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  employees,
  assets,
  expenses,
  apartments,
  onNavigateToRole,
  isBasicPlan = false
}) => {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const totalAssetValue = assets.reduce((sum, a) => sum + a.value, 0);
  const totalEmployees = employees.length;
  
  const occupiedCount = apartments.filter(a => a.status === 'Rented' || a.status === 'Sold').length;
  const occupancyRate = apartments.length > 0 ? Math.round((occupiedCount / apartments.length) * 100) : 0;
  
  const approvedExpenses = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

  const projectChartData = projects.map(p => ({
    name: p.name.length > 18 ? p.name.substring(0, 15) + '...' : p.name,
    Budget: p.budget / 1000,
    Spent: p.spent / 1000,
  }));

  const expenseByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
  const expenseChartData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  }));

  const safetyAlerts = projects.filter(p => p.safetyRating === 'Pending' && p.status !== 'Planning');
  const assetAlerts = assets.filter(a => a.status === 'Needs Repair' || a.status === 'Under Maintenance');
  const pendingExpensesAlerts = expenses.filter(e => e.status === 'Pending' && e.amount > 20000);

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${isBasicPlan ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4`}>
        {!isBasicPlan && (
          <div id="metric-budget-spent" className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Total Portfolio CapEx</span>
              <h3 className="text-2xl font-semibold text-white mt-1">${(totalBudget / 1000000).toFixed(1)}M</h3>
              <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">${(totalSpent / 1000000).toFixed(1)}M spent</span>
                <span className="text-zinc-600">({Math.round((totalSpent / totalBudget) * 100)}%)</span>
              </p>
            </div>
            <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        )}

        <div id="metric-occupancy" className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Occupancy (Built Spaces)</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{occupancyRate}%</h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-zinc-300 font-semibold">{occupiedCount} units filled</span>
              <span className="text-zinc-600">of {apartments.length} total</span>
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {!isBasicPlan && (
          <div id="metric-assets" className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Heavy Assets & Tools</span>
              <h3 className="text-2xl font-semibold text-white mt-1">${(totalAssetValue / 1000).toFixed(0)}k</h3>
              <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                <span className="text-amber-400 font-semibold">{assets.length} items logged</span>
                <span className="text-zinc-600">fleet: 85% ok</span>
              </p>
            </div>
            <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        )}

        <div id="metric-workforce" className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Workforce & HR</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{totalEmployees} Members</h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-cyan-400 font-semibold">{employees.filter(e => e.status === 'Active').length} active</span>
              <span className="text-zinc-600">{employees.filter(e => e.status === 'Contractor').length} contractors</span>
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isBasicPlan ? '' : 'lg:grid-cols-3'} gap-6`}>
        {!isBasicPlan && (
          <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-white">Project Capital Budgets vs Spent</h4>
                <p className="text-xs text-zinc-500">Values in thousands of dollars ($k)</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded">Live Sync</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e24" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toLocaleString()}k`, '']}
                    contentStyle={{ backgroundColor: '#09090b', borderRadius: '4px', color: '#fff', border: '1px solid #27272a' }}
                    labelStyle={{ fontWeight: 'bold', color: '#ffffff' }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#71717a' }} />
                  <Bar dataKey="Budget" fill="#ffffff" radius={[2, 2, 0, 0]} barSize={20} />
                  <Bar dataKey="Spent" fill="#52525b" radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={`${isBasicPlan ? 'w-full' : ''} bg-[#111114] border border-zinc-800 rounded-lg p-6 flex flex-col justify-between`}>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-tight text-white mb-1">Expense Categorization</h4>
            <p className="text-xs text-zinc-500 mb-4">Aggregate allocation of all operational ledger expenses</p>
          </div>
          <div className="h-52 flex items-center justify-center relative">
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-500 text-xs">No expenses found</div>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-white">${((approvedExpenses + pendingExpenses) / 1000).toFixed(0)}k</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Ledger</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {expenseChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.name}</span>
                <span className="font-semibold text-white ml-auto">${(item.value / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isBasicPlan ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {!isBasicPlan && (
          <div className="bg-[#111114] border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <h4 className="text-sm font-bold uppercase tracking-tight text-white">Construction Safety & Status</h4>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 3).map(p => (
                <div key={p.id} className="p-3 bg-[#09090b] border border-zinc-800 rounded flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-semibold text-white">{p.name}</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Supervisor: {p.siteSupervisor}</p>
                    </div>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 font-bold rounded ${
                      p.safetyRating.includes('A') 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                        : 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                    }`}>
                      Safety {p.safetyRating}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigateToRole('ProjectManager')} 
              className="w-full mt-4 py-2 border border-zinc-800 text-[10px] text-zinc-400 hover:bg-zinc-850 hover:text-white rounded transition-colors uppercase font-bold tracking-widest"
            >
              Review Site Milestones →
            </button>
          </div>
        )}

        {!isBasicPlan && (
          <div className="bg-[#111114] border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-zinc-400" />
              <h4 className="text-sm font-bold uppercase tracking-tight text-white">Fleet & Equipment Maintenance</h4>
            </div>
            <div className="space-y-3">
              {assetAlerts.length > 0 ? (
                assetAlerts.map(a => (
                  <div key={a.id} className="p-3 bg-[#09090b] border border-zinc-800 rounded flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">{a.name}</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Location: {a.location}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      a.status === 'Needs Repair' 
                        ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' 
                        : 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-zinc-500 bg-[#09090b] border border-zinc-800/80 rounded">
                  <CheckCircle className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
                  All {assets.length} heavy assets operational. No maintenance requests.
                </div>
              )}
            </div>
            <button 
              onClick={() => onNavigateToRole('Admin')}
              className="w-full mt-4 py-2 border border-zinc-800 text-[10px] text-zinc-400 hover:bg-zinc-850 hover:text-white rounded transition-colors uppercase font-bold tracking-widest"
            >
              Manage Machinery Register →
            </button>
          </div>
        )}

        <div className="bg-[#111114] border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
            <h4 className="text-sm font-bold uppercase tracking-tight text-white">Capital Expense Flags</h4>
          </div>
          <div className="space-y-3">
            {pendingExpensesAlerts.length > 0 ? (
              pendingExpensesAlerts.map(e => (
                <div key={e.id} className="p-3 bg-[#09090b] border border-zinc-800 rounded flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">{e.description}</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Project: {e.projectName || 'Operations'}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-white">${e.amount.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-500">Signoff Required</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-zinc-500 bg-[#09090b] border border-zinc-800/80 rounded">
                <CheckCircle className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
                No high-value pending expenses flagged.
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigateToRole('FinancialOfficer')} 
            className="w-full mt-4 py-2 border border-zinc-800 text-[10px] text-zinc-400 hover:bg-zinc-850 hover:text-white rounded transition-colors uppercase font-bold tracking-widest"
          >
            Open Expense Approvals Ledger →
          </button>
        </div>
      </div>
    </div>
  );
};