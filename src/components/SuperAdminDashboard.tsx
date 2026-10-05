import React, { useState, useMemo } from 'react';
import { SaasTenant, UserRole } from '../types';
import { 
  ShieldCheck, Building2, Users, DollarSign, Plus, Trash2, 
  Search, Sparkles, ShieldAlert, CheckCircle, Ban, TrendingUp, 
  Calendar, Briefcase, Globe, Settings, Mail, Phone, Layers, 
  FileText, AlertTriangle, Info, ExternalLink
} from 'lucide-react';

interface SuperAdminDashboardProps {
  saasTenants: SaasTenant[];
  onAddTenant: (tenant: SaasTenant, adminPass: string) => void;
  onRemoveTenant: (id: string) => void;
  onUpdateTenant: (id: string, fields: Partial<SaasTenant>) => void;
  onTriggerNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  saasTenants,
  onAddTenant,
  onRemoveTenant,
  onUpdateTenant,
  onTriggerNotification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'Basic' | 'Business'>('Business');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly' | 'Lifetime'>('Monthly');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1299);
  const [contactPhone, setContactPhone] = useState('');
  const [projectsLimit, setProjectsLimit] = useState<number>(20);
  const [propertiesLimit, setPropertiesLimit] = useState<number>(100);
  const [notes, setNotes] = useState('');

  const [selectedTenant, setSelectedTenant] = useState<SaasTenant | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const calculatePricingAndLimits = (plan: 'Basic' | 'Business', cycle: 'Monthly' | 'Yearly' | 'Lifetime') => {
    if (plan === 'Basic') {
      const price = cycle === 'Monthly' ? 299 : cycle === 'Yearly' ? 199 : 2499;
      return { price, projects: 2, properties: 10 };
    } else {
      const price = cycle === 'Monthly' ? 1299 : cycle === 'Yearly' ? 999 : 11999;
      return { price, projects: 20, properties: 100 };
    }
  };

  const handlePlanOrCycleChange = (plan: 'Basic' | 'Business', cycle: 'Monthly' | 'Yearly' | 'Lifetime') => {
    setSubscriptionPlan(plan);
    setBillingCycle(cycle);
    const config = calculatePricingAndLimits(plan, cycle);
    setPurchaseAmount(config.price);
    setProjectsLimit(config.projects);
    setPropertiesLimit(config.properties);
  };

  const stats = useMemo(() => {
    const safeTenants = saasTenants || [];
    const totalRev = safeTenants.reduce((acc, t) => acc + (t.purchaseAmount || 0), 0);
    const activeCount = safeTenants.filter(t => t.status === 'Active').length;
    const basicCount = safeTenants.filter(t => t.subscriptionPlan === 'Basic').length;
    const businessCount = safeTenants.filter(t => t.subscriptionPlan === 'Business').length;
    
    return {
      totalRevenue: totalRev,
      activeSubscribers: activeCount,
      totalCount: safeTenants.length,
      basicCount,
      businessCount,
      averageTicket: safeTenants.length > 0 ? Math.round(totalRev / safeTenants.length) : 0
    };
  }, [saasTenants]);

  const handleSubmitTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !adminName.trim() || !adminEmail.trim()) {
      onTriggerNotification('Validation Failed', 'Please populate all mandatory fields.', 'error');
      return;
    }

    if (!adminEmail.includes('@')) {
      onTriggerNotification('Invalid Email', 'Please input a correct corporate email address.', 'warning');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    if (billingCycle === 'Monthly') {
      expiry.setMonth(expiry.getMonth() + 1);
    } else if (billingCycle === 'Yearly') {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setFullYear(expiry.getFullYear() + 100);
    }
    const expiryStr = expiry.toISOString().split('T')[0];

    const newTenant = {
      id: `TEN-${Math.floor(1000 + Math.random() * 9000)}`, 
      companyName: companyName.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      subscriptionPlan,
      status: 'Active',
      purchaseAmount,
      purchaseDate: today,
      expiryDate: expiryStr,
      propertiesLimit,
      projectsLimit,
      contactPhone: contactPhone.trim() || null,
      notes: notes.trim() || null,
      billingCycle
    } as unknown as SaasTenant;

    onAddTenant(newTenant, adminPassword);
    
    setCompanyName('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('admin123');
    setContactPhone('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleToggleStatus = (tenant: SaasTenant) => {
    const newStatus = tenant.status === 'Active' ? 'Suspended' : 'Active';
    onUpdateTenant(tenant.id, { status: newStatus });
    
    onTriggerNotification(
      `Tenant ${newStatus}`,
      `Subscription for ${tenant.companyName || 'Unknown'} has been ${newStatus.toLowerCase()}.`,
      newStatus === 'Active' ? 'success' : 'warning'
    );
  };

  const handleSaveNotes = () => {
    if (!selectedTenant) return;
    onUpdateTenant(selectedTenant.id, { notes: editingNotes });
    setSelectedTenant({ ...selectedTenant, notes: editingNotes });
    onTriggerNotification('Notes Saved', `Updated annotations for ${selectedTenant.companyName || 'Tenant'}`, 'info');
  };

  const filteredTenants = useMemo(() => {
    const safeTenants = saasTenants || [];
    const searchLower = searchTerm.toLowerCase();
    
    return safeTenants.filter(t => {
      const company = (t.companyName || '').toLowerCase();
      const admin = (t.adminName || '').toLowerCase();
      const email = (t.adminEmail || '').toLowerCase();
      const tId = (t.id || '').toLowerCase();

      const matchesSearch = 
        company.includes(searchLower) ||
        admin.includes(searchLower) ||
        email.includes(searchLower) ||
        tId.includes(searchLower);
      
      const matchesPlan = planFilter === 'All' || t.subscriptionPlan === planFilter;
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [saasTenants, searchTerm, planFilter, statusFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto select-none">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-violet-500 font-mono">Platform Control Centre</span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
            <ShieldCheck className="w-6 h-6 text-violet-500" /> SaaS Subscription Suite
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Global deployment analytics, recurring revenue counters, and automated customer tenant provisioning.
          </p>
        </div>
        
        <div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded shadow-lg transition-all cursor-pointer border border-violet-500/30"
          >
            {showAddForm ? 'View Directory' : 'Provision New Tenant'} <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111114] border border-zinc-850 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">Annual Recurring Rev</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">${(stats.totalRevenue * 12).toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-500 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">ARR</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-zinc-400">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span>Monthly contract MRR: ${stats.totalRevenue.toLocaleString()}/mo</span>
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-850 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Building2 className="w-24 h-24 text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">Subscribed Tenants</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.activeSubscribers}</span>
            <span className="text-xs text-zinc-500">of {stats.totalCount} registered</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>No pending domain suspensions</span>
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-850 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Layers className="w-24 h-24 text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">Subscription Tiers</span>
          <div className="flex items-center gap-3 mt-3 text-xs font-mono">
            <div className="flex-1 bg-[#09090b] border border-zinc-800 p-1.5 rounded text-center">
              <span className="block text-[10px] text-zinc-500 uppercase">Basic</span>
              <span className="text-sm font-black text-cyan-400">{stats.basicCount}</span>
            </div>
            <div className="flex-1 bg-[#09090b] border border-zinc-800 p-1.5 rounded text-center">
              <span className="block text-[10px] text-zinc-500 uppercase">Business</span>
              <span className="text-sm font-black text-violet-400">{stats.businessCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-850 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-24 h-24 text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block">Average Ticket Size</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">${stats.averageTicket.toLocaleString()}</span>
            <span className="text-xs text-zinc-500">/ tenant / month</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-zinc-400">
            <span className="text-violet-400 font-bold">Enterprise Heavy</span>
            <span>Multi-project focus</span>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-[#111114] border border-violet-900/30 rounded-xl overflow-hidden shadow-2xl animate-fade-in relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 via-indigo-400 to-violet-600"></div>
          
          <div className="p-5 sm:p-6 bg-[#141417] border-b border-zinc-850">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" /> Provision Tenant & Executive Admin Workspace
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Add details of the corporate entity that has purchased the SaaS subscription. This automatically generates a dedicated **Executive Admin Profile** allowing them to log in instantly.
            </p>
          </div>

          <form onSubmit={handleSubmitTenant} className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
                  1. Corporate Identity
                </h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Tenant Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Skyline Structures Ltd"
                    className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-3 w-3.5 h-3.5 text-zinc-600" />
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Platform Operational Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add specific SLA details or service arrangements..."
                    className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
                  2. Executive Admin Login Credentials
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Executive Admin Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Sophia Jenkins"
                    className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Admin Corporate Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-3 w-3.5 h-3.5 text-zinc-600" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@skyline.com"
                      className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Passcode / Security Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Credential key for quick login"
                    className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2.5 text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <span className="text-[9px] text-zinc-500 mt-1 block">
                    Admins can use this key at the Login Screen Corporate Preset.
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
                  3. SaaS Pricing & Limits
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Subscription Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([ 'Basic', 'Business' ] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handlePlanOrCycleChange(tier, billingCycle)}
                        className={`py-2 text-[10px] font-bold border rounded transition-all cursor-pointer uppercase tracking-wider ${
                          subscriptionPlan === tier 
                            ? 'bg-violet-950/40 text-violet-400 border-violet-800' 
                            : 'bg-[#09090b] text-zinc-500 border-zinc-850 hover:border-zinc-800'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Billing Cycle
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([ 'Monthly', 'Yearly', 'Lifetime' ] as const).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => handlePlanOrCycleChange(subscriptionPlan, cycle)}
                        className={`py-2 text-[10px] font-bold border rounded transition-all cursor-pointer uppercase tracking-wider ${
                          billingCycle === cycle 
                            ? 'bg-violet-950/40 text-violet-400 border-violet-800' 
                            : 'bg-[#09090b] text-zinc-500 border-zinc-850 hover:border-zinc-800'
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Purchase Cost ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                      className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2.5 text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Billing Term
                    </label>
                    <div className="w-full text-xs bg-[#09090b] border border-zinc-850 rounded px-3 py-2.5 text-zinc-400 font-mono">
                      {billingCycle === 'Lifetime' ? 'One-time Pay' : billingCycle === 'Yearly' ? 'Annual Recur' : 'Monthly Recur'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Max Projects Limit
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={projectsLimit}
                      onChange={(e) => setProjectsLimit(Number(e.target.value))}
                      className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:ring-1 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Max Units Limit
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={propertiesLimit}
                      onChange={(e) => setPropertiesLimit(Number(e.target.value))}
                      className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:ring-1 font-mono"
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-300 px-4 py-2.5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-2 border border-zinc-300"
              >
                Confirm SaaS Purchase <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#111114] border border-zinc-850 rounded-xl overflow-hidden shadow-xl">
        
        <div className="p-4 bg-[#141417] border-b border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, admin name, or token ID..."
              className="w-full text-xs bg-[#09090b] border border-zinc-800/80 rounded pl-10 pr-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Plan</span>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="text-xs bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="All">All Tiers</option>
                <option value="Basic">Basic Plan</option>
                <option value="Business">Business Plan</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Trial">Trial</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141417]/40 border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Company ID & Name</th>
                <th className="py-3 px-4">Administrator Email</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Rate</th>
                <th className="py-3 px-4">Allocations</th>
                <th className="py-3 px-4">Expiration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    No active corporate subscriptions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isSuspended = tenant.status === 'Suspended';
                  return (
                     <tr 
                      key={tenant.id}
                      className={`hover:bg-zinc-900/20 transition-colors ${
                        isSuspended ? 'opacity-60 bg-rose-950/5' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold font-mono text-xs ${
                            tenant.subscriptionPlan === 'Business' 
                              ? 'bg-violet-950/40 text-violet-400 border border-violet-900/40' 
                              : 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30'
                          }`}>
                            {(tenant.companyName || 'NA').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block group-hover:text-violet-400 transition-colors">
                              {tenant.companyName || 'Unnamed Tenant'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">{tenant.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <span className="font-semibold text-zinc-300 block">{tenant.adminName || 'Unknown Admin'}</span>
                          <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">{tenant.adminEmail || 'No Email'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            tenant.subscriptionPlan === 'Business'
                              ? 'bg-violet-950 text-violet-400 border-violet-900'
                              : 'bg-cyan-950 text-cyan-400 border-cyan-900/50'
                          }`}>
                            {tenant.subscriptionPlan || 'Unknown'}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">
                            {tenant.billingCycle || 'Monthly'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-white font-mono">
                        ${(tenant.purchaseAmount || 0).toLocaleString()}
                        <span className="text-[10px] font-normal text-zinc-500">
                          /{tenant.billingCycle === 'Lifetime' ? 'lifetime' : tenant.billingCycle === 'Yearly' ? 'yr' : 'mo'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1 text-[10px] font-mono">
                          <span className="text-zinc-400 block">
                            Projects: <span className="text-white font-bold">{tenant.projectsLimit || 0} Max</span>
                          </span>
                          <span className="text-zinc-400 block">
                            Properties: <span className="text-white font-bold">{tenant.propertiesLimit || 0} Max</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-zinc-400 font-mono text-[11px]">
                        {tenant.expiryDate || 'N/A'}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tenant.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                            : tenant.status === 'Suspended'
                            ? 'bg-rose-950 text-rose-400 border-rose-900'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          {tenant.status || 'Unknown'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tenant.subscriptionPlan === 'Basic' && (
                            <button
                              onClick={() => {
                                onUpdateTenant(tenant.id, { 
                                  subscriptionPlan: 'Business',
                                  projectsLimit: 20,
                                  propertiesLimit: 100,
                                  purchaseAmount: tenant.billingCycle === 'Monthly' ? 1299 : tenant.billingCycle === 'Yearly' ? 999 : 11999
                                });
                                onTriggerNotification('Tenant Upgraded', `${tenant.companyName || 'Tenant'} upgraded to Business Plan!`, 'success');
                              }}
                              className="p-1.5 bg-violet-950/40 hover:bg-violet-900/60 text-violet-400 hover:text-white rounded border border-violet-900/40 cursor-pointer flex items-center gap-1"
                              title="Upgrade to Business Plan"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider hidden lg:inline">Upgrade</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setEditingNotes(tenant.notes || '');
                            }}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 cursor-pointer"
                            title="View / Annotate SLA details"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            className={`p-1.5 rounded border cursor-pointer transition-all ${
                              isSuspended 
                                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border-emerald-900' 
                                : 'bg-rose-950 hover:bg-rose-900 text-rose-400 border-rose-900'
                            }`}
                            title={isSuspended ? 'Re-Activate Subscription' : 'Suspend Account'}
                          >
                            {isSuspended ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => onRemoveTenant(tenant.id)}
                            className="p-1.5 bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded border border-zinc-800 hover:border-rose-900/40 cursor-pointer"
                            title="Deregister Tenant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#141417]/50 border-t border-zinc-850 text-center sm:text-left text-[11px] text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
          <span>Active SaaS Telemetry Node: Sector HQ Gateway</span>
          <span>Showing {filteredTenants.length} of {saasTenants?.length || 0} corporate systems</span>
        </div>
      </div>

      {selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#111114] border border-zinc-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in">
            
            <div className="p-5 bg-[#141417] border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTenant.companyName || 'Tenant'}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Subscription Record Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-zinc-500 hover:text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-[#09090b] border border-zinc-850 p-3 rounded text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Tenant Code</span>
                  <span className="text-zinc-200 font-bold">{selectedTenant.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Plan Tier</span>
                  <span className="text-violet-400 font-bold">{selectedTenant.subscriptionPlan || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Primary Admin</span>
                  <span className="text-zinc-200 font-bold">{selectedTenant.adminName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Admin Email</span>
                  <span className="text-zinc-200 block truncate" title={selectedTenant.adminEmail}>{selectedTenant.adminEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Purchased Price</span>
                  <span className="text-emerald-400 font-bold">
                    ${selectedTenant.purchaseAmount || 0} ({selectedTenant.billingCycle || 'Monthly'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Purchase Date</span>
                  <span className="text-zinc-400">{selectedTenant.purchaseDate || 'N/A'}</span>
                </div>
              </div>

              {selectedTenant.subscriptionPlan === 'Basic' && (
                <div className="bg-violet-950/20 border border-violet-900/40 p-3 rounded flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-violet-300 block">Basic Subscription Plan</span>
                    <span className="text-zinc-400 text-[10px]">Upgrade to unlock Projects & Vendors.</span>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateTenant(selectedTenant.id, { 
                        subscriptionPlan: 'Business',
                        projectsLimit: 20,
                        propertiesLimit: 100,
                        purchaseAmount: selectedTenant.billingCycle === 'Monthly' ? 1299 : selectedTenant.billingCycle === 'Yearly' ? 999 : 11999
                      });
                      setSelectedTenant({
                        ...selectedTenant,
                        subscriptionPlan: 'Business',
                        projectsLimit: 20,
                        propertiesLimit: 100,
                        purchaseAmount: selectedTenant.billingCycle === 'Monthly' ? 1299 : selectedTenant.billingCycle === 'Yearly' ? 999 : 11999
                      });
                      onTriggerNotification('Tenant Upgraded', `${selectedTenant.companyName || 'Tenant'} upgraded to Business Plan!`, 'success');
                    }}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer transition-colors"
                  >
                    Upgrade to Business
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  SLA / Corporate Contract Details (Editable)
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={4}
                  className="w-full text-xs bg-[#09090b] border border-zinc-800 rounded p-3 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans resize-none"
                  placeholder="Record custom service level agreement details, additional developer keys, or notes..."
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <div className="flex-1 text-[10px] text-zinc-500 italic">
                  * Changes are persisted to operational databases.
                </div>
                <button
                  onClick={() => {
                    handleSaveNotes();
                    setSelectedTenant(null);
                  }}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  Save & Exit
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};