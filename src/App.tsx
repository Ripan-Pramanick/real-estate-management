import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Project, Employee, Asset, Expense, Apartment, SystemUserProfile, Material, Vendor, SystemNotification, Bill, SaasTenant, MaintenanceTicket, Bid, Tender, ProjectMilestone, GanttTask } from './types';
import { RoleSelector } from './components/RoleSelector';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectManager } from './components/ProjectManager';
import { EmployeeManager } from './components/EmployeeManager';
import { AssetManager } from './components/AssetManager';
import { PropertyManager } from './components/PropertyManager';
import { ExpenseTracker } from './components/ExpenseTracker';
import { ClientDashboard } from './components/ClientDashboard';
import { Login } from './components/Login';
import { MaterialManager } from './components/MaterialManager';
import { VendorManager } from './components/VendorManager';
import { BillingManager } from './components/BillingManager';
import { SaaSSupabaseCenter } from './components/SaaSSupabaseCenter';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { supabase } from './lib/supabase';

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export default function App() {
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('re_ms_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const savedUser = localStorage.getItem('re_ms_current_user');
      if (savedUser) {
        return JSON.parse(savedUser).role;
      }
    } catch { }
    return 'Admin';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem('re_ms_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        switch (parsed.role) {
          case 'Admin': return 'overview';
          case 'SuperAdmin': return 'super-admin';
          case 'ProjectManager': return 'projects';
          case 'HRManager': return 'employees';
          case 'PropertyManager': return 'properties';
          case 'FinancialOfficer': return 'expenses';
          case 'Client': return 'client-dashboard';
        }
      }
    } catch { }
    return 'overview';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('domus-theme') as 'light' | 'dark') || 'dark';
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'alert' } | null>(null);

  const [userProfiles, setUserProfiles] = useState<SystemUserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [saasTenants, setSaasTenants] = useState<SaasTenant[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);

  const activeTenant = useMemo(() => {
    if (!currentUser || !currentUser.email) return null;

    return saasTenants.find(t => {
      const adminEmail = t?.adminEmail || '';
      const userEmail = currentUser?.email || '';
      const companyName = t?.companyName || '';
      const userDept = currentUser?.department || '';

      const isEmailMatch = adminEmail.toLowerCase() === userEmail.toLowerCase();
      const isDomainMatch = userEmail.includes('@') && adminEmail.includes('@') &&
        adminEmail.split('@')[1].toLowerCase() === userEmail.split('@')[1].toLowerCase();
      const isDeptMatch = Boolean(companyName && userDept && companyName.toLowerCase() === userDept.toLowerCase());

      return isEmailMatch || isDomainMatch || isDeptMatch;
    });
  }, [currentUser, saasTenants]);

  const isBasicPlan = activeTenant?.subscriptionPlan === 'Basic';

  const toDB = (obj: any) => {
    if (!obj) return obj;
    const dbObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === 'targetDate') {
          dbObj['due_date'] = obj[key];
        } else if (key === 'isCompleted') {
          dbObj['status'] = obj[key] ? 'Completed' : 'Pending';
        } else {
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          dbObj[snakeKey] = obj[key];
        }
      }
    }
    return dbObj;
  };

  const showToast = (message: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('domus-theme', nextTheme);
  };

  useEffect(() => {
    if (!supabase) return;

    const syncUserFromSession = (session: any) => {
      if (session?.user) {
        const userRole = (session.user.user_metadata?.role as UserRole) || 'Client';
        const userDepartment = session.user.user_metadata?.department || 'General';
        const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';

        const loggedInUser: LoggedInUser = {
          id: session.user.id,
          name: userName,
          email: session.user.email!,
          role: userRole,
          department: userDepartment,
        };

        setCurrentUser(loggedInUser);
        localStorage.setItem('re_ms_current_user', JSON.stringify(loggedInUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('re_ms_current_user');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserFromSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserFromSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchAllData = async () => {
      setIsDbLoading(true);
      try {
        const [
          prj, emp, ast, exp, apt, mat, ven, not, bil, ten, tck, tnd, mls, gnt, usr
        ] = await Promise.all([
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('employees').select('*'),
          supabase.from('assets').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('apartments').select('*'),
          supabase.from('materials').select('*'),
          supabase.from('vendors').select('*'),
          supabase.from('system_notifications').select('*'),
          supabase.from('bills').select('*'),
          supabase.from('saas_tenants').select('*'),
          supabase.from('maintenance_tickets').select('*'),
          supabase.from('tenders').select('*'),
          supabase.from('project_milestones').select('*'),
          supabase.from('gantt_tasks').select('*'),
          supabase.from('user_profiles').select('*')
        ]);

        if (prj.data) setProjects(prj.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, startDate: d.start_date || d.startDate, endDate: d.end_date || d.endDate, siteSupervisor: d.site_supervisor || d.siteSupervisor, safetyRating: d.safety_rating || d.safetyRating })));
        if (emp.data) setEmployees(emp.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, joiningDate: d.joining_date || d.joiningDate, assignedProject: d.assigned_project || d.assignedProject })));
        if (ast.data) setAssets(ast.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, purchaseDate: d.purchase_date || d.purchaseDate, lastServiceDate: d.last_service_date || d.lastServiceDate, assignedProject: d.assigned_project || d.assignedProject })));
        if (exp.data) setExpenses(exp.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, projectName: d.project_name || d.projectName })));
        if (apt.data) setApartments(apt.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, buildingName: d.building_name || d.buildingName, unitNumber: d.unit_number || d.unitNumber, areaSqft: d.area_sq_ft || d.area_sqft || d.areaSqft, tenantName: d.tenant_name || d.tenantName, leaseStart: d.lease_start || d.leaseStart, leaseEnd: d.lease_end || d.leaseEnd, monthlyRent: d.monthly_rent || d.monthlyRent })));
        if (mat.data) setMaterials(mat.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, minStockLevel: d.min_stock_level || d.minStockLevel, unitPrice: d.unit_price || d.unitPrice, supplierName: d.supplier_name || d.supplierName, lastUpdated: d.last_updated || d.lastUpdated })));
        if (ven.data) setVendors(ven.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, contactPerson: d.contact_person || d.contactPerson, suppliedItems: d.supplied_items || d.suppliedItems, activeContractsCount: d.active_contracts_count || d.activeContractsCount })));
        if (not.data) setNotifications(not.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId })));
        if (bil.data) setBills(bil.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, billNumber: d.bill_number || d.billNumber, apartmentId: d.apartment_id || d.apartmentId, buildingName: d.building_name || d.buildingName, unitNumber: d.unit_number || d.unitNumber, propertyType: d.property_type || d.propertyType, billingType: d.billing_type || d.billingType, customerName: d.customer_name || d.customerName, customerEmail: d.customer_email || d.customerEmail, dueDate: d.due_date || d.dueDate, issuedDate: d.issued_date || d.issuedDate, paymentMethod: d.payment_method || d.paymentMethod })));
        if (ten.data) setSaasTenants(ten.data.map((d: any) => ({ ...d, companyName: d.company_name || d.companyName, adminName: d.admin_name || d.adminName, adminEmail: d.admin_email || d.adminEmail, subscriptionPlan: d.subscription_plan || d.subscriptionPlan, purchaseAmount: d.purchase_amount || d.purchaseAmount, purchaseDate: d.purchase_date || d.purchaseDate, expiryDate: d.expiry_date || d.expiryDate, propertiesLimit: d.properties_limit || d.propertiesLimit, projectsLimit: d.projects_limit || d.projectsLimit, contactPhone: d.contact_phone || d.contactPhone, billingCycle: d.billing_cycle || d.billingCycle })));
        if (tck.data) setMaintenanceTickets(tck.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, apartmentId: d.apartment_id || d.apartmentId, buildingName: d.building_name || d.buildingName, unitNumber: d.unit_number || d.unitNumber, tenantName: d.tenant_name || d.tenantName, tenantEmail: d.tenant_email || d.tenantEmail, createdAt: d.created_at || d.createdAt, slaDeadline: d.sla_deadline || d.slaDeadline, assignedStaff: d.assigned_staff || d.assignedStaff, resolutionNotes: d.resolution_notes || d.resolutionNotes })));
        if (tnd.data) setTenders(tnd.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, projectName: d.project_name || d.projectName, dueDate: d.due_date || d.dueDate, awardedBidId: d.awarded_bid_id || d.awardedBidId })));
        if (mls.data) setProjectMilestones(mls.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, projectId: d.project_id || d.projectId, targetDate: d.due_date || d.targetDate, isCompleted: d.status === 'Completed' || d.isCompleted })));
        if (gnt.data) setGanttTasks(gnt.data.map((d: any) => ({ ...d, tenantId: d.tenant_id || d.tenantId, projectId: d.project_id || d.projectId, startDate: d.start_date || d.startDate, endDate: d.end_date || d.endDate })));
        if (usr.data) setUserProfiles(usr.data.map((d: any) => ({ ...d, passwordDescription: d.password_description || d.passwordDescription, colorClass: d.color_class || d.colorClass })));
        
      } catch (error) {
        showToast('Data synchronization failed.', 'alert');
      } finally {
        setIsDbLoading(false);
      }
    };

    fetchAllData();
  }, [currentUser]);

  useEffect(() => {
    if (isBasicPlan && (activeTab === 'projects' || activeTab === 'materials' || activeTab === 'vendors')) {
      setActiveTab('overview');
    }
  }, [isBasicPlan, activeTab]);

  const handleAddProject = async (p: Project) => {
    const { data, error } = await supabase.from('projects').insert([toDB(p)]).select();
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    
    if (data && data.length > 0) {
      const newProject = data[0];
      const formattedProject = {
        ...newProject,
        tenantId: newProject.tenant_id,
        startDate: newProject.start_date,
        endDate: newProject.end_date,
        siteSupervisor: newProject.site_supervisor,
        safetyRating: newProject.safety_rating,
      };
      setProjects([formattedProject as unknown as Project, ...projects]);
      showToast(`Site "${p.name}" successfully commissioned!`, 'success');
    }
  };

  const handleUpdateProject = async (id: string, updatedFields: Partial<Project>) => {
    const { error } = await supabase.from('projects').update(toDB(updatedFields)).eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setProjects(projects.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    showToast(`Project metrics updated.`, 'info');
  };

  const handleAddEmployee = async (e: Employee) => {
    const { error } = await supabase.from('employees').insert([toDB(e)]);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setEmployees([e, ...employees]);
    showToast(`Recruited ${e.name} to department: ${e.department}`, 'success');
  };

  const handleRemoveEmployee = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setEmployees(employees.filter(e => e.id !== id));
    if (emp) showToast(`Decommissioned corporate account for ${emp.name}.`, 'alert');
  };

  const handleUpdateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
    const { error } = await supabase.from('employees').update(toDB(updatedFields)).eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setEmployees(employees.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    showToast(`Employee status modified.`, 'info');
  };

  const handleAddAsset = async (a: Asset) => {
    const { error } = await supabase.from('assets').insert([toDB(a)]);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setAssets([a, ...assets]);
    showToast(`Heavy equipment "${a.name}" logged on-site.`, 'success');
  };

  const handleRemoveAsset = async (id: string) => {
    const asset = assets.find(a => a.id === id);
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setAssets(assets.filter(a => a.id !== id));
    if (asset) showToast(`Asset "${asset.name}" decommissioned.`, 'alert');
  };

  const handleUpdateAsset = async (id: string, updatedFields: Partial<Asset>) => {
    const { error } = await supabase.from('assets').update(toDB(updatedFields)).eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setAssets(assets.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    showToast(`Asset register updated.`, 'info');
  };

  const handleAddExpense = async (exp: Expense) => {
    const { error } = await supabase.from('expenses').insert([toDB(exp)]);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setExpenses([exp, ...expenses]);
    showToast(`Expense invoice of $${exp.amount.toLocaleString()} logged.`, 'info');
  };

  const handleRemoveExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setExpenses(expenses.filter(e => e.id !== id));
    showToast(`Expense transaction deleted.`, 'alert');
  };

  const handleApproveExpense = async (id: string) => {
    const expenseToApprove = expenses.find(e => e.id === id);
    if (!expenseToApprove || expenseToApprove.status !== 'Pending') return;

    const { error: expError } = await supabase.from('expenses').update({ status: 'Approved' }).eq('id', id);
    if (expError) return showToast(expError.message, 'alert');

    const projectToUpdate = projects.find(p => p.name === expenseToApprove.projectName);
    if (projectToUpdate) {
      const { error: prjError } = await supabase.from('projects').update({ spent: projectToUpdate.spent + expenseToApprove.amount }).eq('id', projectToUpdate.id);
      if (prjError) return showToast(prjError.message, 'alert');
      setProjects(projects.map(p => p.id === projectToUpdate.id ? { ...p, spent: p.spent + expenseToApprove.amount } : p));
    }

    setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'Approved' } : e));
    showToast(`Invoice approved.`, 'success');
  };

  const handleRejectExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').update({ status: 'Rejected' }).eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'Rejected' } : e));
    showToast(`Expense invoice rejected.`, 'alert');
  };

  const handleAddApartment = async (apt: Apartment) => {
    const { error } = await supabase.from('apartments').insert([toDB(apt)]);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setApartments([apt, ...apartments]);
    showToast(`Registered finished property`, 'success');
  };

  const handleRemoveApartment = async (id: string) => {
    const apt = apartments.find(a => a.id === id);
    const { error } = await supabase.from('apartments').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setApartments(apartments.filter(a => a.id !== id));
    if (apt) showToast(`Unit removed from portfolios.`, 'alert');
  };

  const handleUpdateApartment = async (id: string, updatedFields: Partial<Apartment>) => {
    const { error } = await supabase.from('apartments').update(toDB(updatedFields)).eq('id', id);
    if (error) {
      showToast(error.message, 'alert');
      return;
    }
    setApartments(apartments.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    showToast(`Property lease registry modified.`, 'success');
  };

  const handleAddMaterial = async (m: Material) => {
    const { error } = await supabase.from('materials').insert([toDB(m)]);
    if (error) return showToast(error.message, 'alert');
    setMaterials([m, ...materials]);
  };

  const handleRemoveMaterial = async (id: string) => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleUpdateMaterial = async (id: string, updatedFields: Partial<Material>) => {
    const { error } = await supabase.from('materials').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setMaterials(materials.map(m => m.id === id ? { ...m, ...updatedFields } : m));
  };

  const handleAddVendor = async (v: Vendor) => {
    const { error } = await supabase.from('vendors').insert([toDB(v)]);
    if (error) return showToast(error.message, 'alert');
    setVendors([v, ...vendors]);
  };

  const handleRemoveVendor = async (id: string) => {
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setVendors(vendors.filter(v => v.id !== id));
  };

  const handleUpdateVendor = async (id: string, updatedFields: Partial<Vendor>) => {
    const { error } = await supabase.from('vendors').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setVendors(vendors.map(v => v.id === id ? { ...v, ...updatedFields } : v));
  };

  const handleTriggerNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', targetTenantId?: string) => {
    const tId = targetTenantId || activeTenant?.id || 'TEN-001';
    const newNot: SystemNotification = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId: tId,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    
    const { error } = await supabase.from('system_notifications').insert([toDB(newNot)]);
    if (error) return showToast(error.message, 'alert');
    
    setNotifications([newNot, ...notifications]);
    showToast(title, type === 'warning' || type === 'error' ? 'alert' : 'success');
  };

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase.from('system_notifications').update({ read: true }).eq('id', id);
    if (error) return;
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    const tenantId = activeTenant?.id || 'TEN-001';
    const { error } = await supabase.from('system_notifications').update({ read: true }).eq('tenant_id', tenantId);
    if (error) return;
    setNotifications(notifications.map(n => (n.tenantId || 'TEN-001') === tenantId ? { ...n, read: true } : n));
    showToast('All alerts marked as read', 'success');
  };

  const handleClearNotifications = async () => {
    const tenantId = activeTenant?.id || 'TEN-001';
    const { error } = await supabase.from('system_notifications').delete().eq('tenant_id', tenantId);
    if (error) return showToast(error.message, 'alert');
    setNotifications(notifications.filter(n => (n.tenantId || 'TEN-001') !== tenantId));
    showToast('Cleared notification ledger', 'info');
  };

  const handleAddBill = async (b: Bill) => {
    const { error } = await supabase.from('bills').insert([toDB(b)]);
    if (error) return showToast(error.message, 'alert');
    setBills([b, ...bills]);
  };

  const handleRemoveBill = async (id: string) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setBills(bills.filter(b => b.id !== id));
  };

  const handleUpdateBill = async (id: string, updatedFields: Partial<Bill>) => {
    const { error } = await supabase.from('bills').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setBills(bills.map(b => b.id === id ? { ...b, ...updatedFields } : b));
  };

  const handleAddSaasTenant = async (tenant: SaasTenant, adminPass: string) => {
    const { data: funcData, error: funcError } = await supabase.functions.invoke('create-admin', {
      body: {
        email: tenant.adminEmail,
        password: adminPass,
        name: tenant.adminName,
        department: tenant.companyName,
        role: 'Admin',
      },
    });

    if (funcError || (funcData && funcData.error)) {
      console.error('Auth Creation Error:', funcError || funcData?.error);
      return showToast(`Failed to create admin login: ${funcError?.message || funcData?.error}`, 'alert');
    }

    const safeTenantId = tenant.id || `TEN-${Date.now()}`;
    
    const dbTenant = {
      id: safeTenantId,
      company_name: tenant.companyName || 'Unknown Company',
      admin_name: tenant.adminName || 'Unknown Admin',
      admin_email: tenant.adminEmail || 'no-email@example.com',
      subscription_plan: tenant.subscriptionPlan || 'Business',
      status: tenant.status || 'Active',
      purchase_amount: tenant.purchaseAmount || 0,
      purchase_date: tenant.purchaseDate || new Date().toISOString().split('T')[0],
      expiry_date: tenant.expiryDate || new Date().toISOString().split('T')[0],
      properties_limit: tenant.propertiesLimit || 10,
      projects_limit: tenant.projectsLimit || 5,
      contact_phone: tenant.contactPhone || '',
      notes: tenant.notes || '',
      billing_cycle: tenant.billingCycle || 'Monthly'
    };

    const { error } = await supabase.from('saas_tenants').insert([dbTenant]);
    
    if (error) {
       console.error("Tenant Insert Error:", error);
       return showToast(`Tenant Error: ${error.message}`, 'alert');
    }
    
    const updatedTenant = { ...tenant, id: safeTenantId };
    setSaasTenants([updatedTenant, ...saasTenants]);
    
    const nameParts = tenant.adminName ? tenant.adminName.split(' ') : ['A', 'D'];
    const initials = nameParts.map(n => n[0] || '').join('').toUpperCase().substring(0, 2) || 'AD';
    
    const newProfileDb = {
      id: `EMP-${Date.now()}`,
      name: tenant.adminName,
      email: tenant.adminEmail,
      role: 'Admin' as UserRole,
      department: tenant.companyName,
      initials: initials,
      password_description: adminPass,
      color_class: 'from-amber-500 to-orange-600 ring-amber-500/20 text-amber-400 bg-amber-950/20 border-amber-900/40'
    };
    
    const { error: profileError } = await supabase.from('user_profiles').insert([newProfileDb]);
    
    if (!profileError) {
       const newProfileUI: SystemUserProfile = {
           id: newProfileDb.id,
           name: newProfileDb.name,
           email: newProfileDb.email,
           role: 'Admin',
           department: newProfileDb.department,
           initials: newProfileDb.initials,
           passwordDescription: newProfileDb.password_description,
           colorClass: newProfileDb.color_class
       };
       setUserProfiles([...userProfiles, newProfileUI]);
    }
    
    handleTriggerNotification(
      'New SaaS Subscription',
      `Tenant system ${tenant.companyName} has successfully purchased a ${tenant.subscriptionPlan} subscription. Admin login generated.`,
      'success'
    );
    showToast(`Provisioned Tenant: ${tenant.companyName} and Auth created!`, 'success');
  };
  
  const handleRemoveSaasTenant = async (id: string) => {
    const { error } = await supabase.from('saas_tenants').delete().eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setSaasTenants(saasTenants.filter(t => t.id !== id));
    showToast(`Deregistered SaaS Tenant`, 'info');
  };

  const handleUpdateSaasTenant = async (id: string, updatedFields: Partial<SaasTenant>) => {
    const { error } = await supabase.from('saas_tenants').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setSaasTenants(saasTenants.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const handleAddTicket = async (t: MaintenanceTicket) => {
    const { error } = await supabase.from('maintenance_tickets').insert([toDB(t)]);
    if (error) return showToast(error.message, 'alert');
    setMaintenanceTickets([t, ...maintenanceTickets]);
    showToast(`Maintenance Request "${t.title}" successfully logged!`, 'success');
  };

  const handleUpdateTicket = async (id: string, updatedFields: Partial<MaintenanceTicket>) => {
    const { error } = await supabase.from('maintenance_tickets').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setMaintenanceTickets(maintenanceTickets.map(t => t.id === id ? { ...t, ...updatedFields } : t));
    showToast(`Maintenance Request status modified.`, 'info');
  };

  const handleAddTender = async (t: Tender) => {
    const { error } = await supabase.from('tenders').insert([toDB(t)]);
    if (error) return showToast(error.message, 'alert');
    setTenders([t, ...tenders]);
    showToast(`Procurement Tender "${t.title}" published!`, 'success');
  };

  const handleUpdateTender = async (id: string, updatedFields: Partial<Tender>) => {
    const { error } = await supabase.from('tenders').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setTenders(tenders.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const handleAddBid = async (tenderId: string, b: Bid) => {
    const tender = tenders.find(t => t.id === tenderId);
    if (!tender) return;
    const newBids = [...(tender.bids || []), b];
    const { error } = await supabase.from('tenders').update({ bids: newBids }).eq('id', tenderId);
    if (error) return showToast(error.message, 'alert');
    setTenders(tenders.map(t => t.id === tenderId ? { ...t, bids: newBids } : t));
  };

  const handleAddMilestone = async (m: ProjectMilestone) => {
    const { error } = await supabase.from('project_milestones').insert([toDB(m)]);
    if (error) return showToast(error.message, 'alert');
    setProjectMilestones([m, ...projectMilestones]);
    showToast(`Project Milestone "${m.title}" logged.`, 'success');
  };

  const handleUpdateMilestone = async (id: string, updatedFields: Partial<ProjectMilestone>) => {
    const { error } = await supabase.from('project_milestones').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setProjectMilestones(projectMilestones.map(m => m.id === id ? { ...m, ...updatedFields } : m));
  };

  const handleAddGanttTask = async (g: GanttTask) => {
    const { error } = await supabase.from('gantt_tasks').insert([toDB(g)]);
    if (error) return showToast(error.message, 'alert');
    setGanttTasks([g, ...ganttTasks]);
    showToast(`Gantt Timeline Task "${g.name}" created.`, 'success');
  };

  const handleUpdateGanttTask = async (id: string, updatedFields: Partial<GanttTask>) => {
    const { error } = await supabase.from('gantt_tasks').update(toDB(updatedFields)).eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setGanttTasks(ganttTasks.map(g => g.id === id ? { ...g, ...updatedFields } : g));
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('re_ms_current_user', JSON.stringify(updatedUser));
    }
    switch (role) {
      case 'Admin': setActiveTab('overview'); break;
      case 'SuperAdmin': setActiveTab('super-admin'); break;
      case 'ProjectManager': setActiveTab('projects'); break;
      case 'HRManager': setActiveTab('employees'); break;
      case 'PropertyManager': setActiveTab('properties'); break;
      case 'FinancialOfficer': setActiveTab('expenses'); break;
      case 'Client': setActiveTab('client-dashboard'); break;
    }
    showToast(`Switched active dashboard view to: ${role}`, 'info');
  };

  const handleLoginSuccess = (user: LoggedInUser) => {
    setCurrentUser(user);
    localStorage.setItem('re_ms_current_user', JSON.stringify(user));
    setCurrentRole(user.role);
    switch (user.role) {
      case 'Admin': setActiveTab('overview'); break;
      case 'SuperAdmin': setActiveTab('super-admin'); break;
      case 'ProjectManager': setActiveTab('projects'); break;
      case 'HRManager': setActiveTab('employees'); break;
      case 'PropertyManager': setActiveTab('properties'); break;
      case 'FinancialOfficer': setActiveTab('expenses'); break;
      case 'Client': setActiveTab('client-dashboard'); break;
    }
    showToast(`Access granted. Welcome back, ${user.name.split(' ')[0]}!`, 'success');
  };

  const handleAddUserProfile = async (newUser: SystemUserProfile) => {
    const { error } = await supabase.from('user_profiles').insert([toDB(newUser)]);
    if (error) return showToast(error.message, 'alert');
    setUserProfiles([...userProfiles, newUser]);
    showToast(`Registered system login profile for "${newUser.name}".`, 'success');
  };

  const handleRemoveUserProfile = async (id: string) => {
    const target = userProfiles.find(u => u.id === id);
    if (target?.email === currentUser?.email) {
      showToast("Cannot remove your own active login session account!", "alert");
      return;
    }
    const { error } = await supabase.from('user_profiles').delete().eq('id', id);
    if (error) return showToast(error.message, 'alert');
    setUserProfiles(userProfiles.filter(u => u.id !== id));
    if (target) showToast(`Decommissioned login access for "${target.name}".`, 'alert');
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('re_ms_current_user');
    showToast('Secure session terminated successfully.', 'info');
  };

  const filteredNotifications = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'SuperAdmin') {
      return notifications;
    }
    const tenantId = activeTenant?.id || 'TEN-001';
    return notifications.filter(n => {
      const nTenantId = n.tenantId || 'TEN-001';
      return nTenantId === tenantId;
    });
  }, [notifications, currentUser, activeTenant]);

  const renderTabContent = () => {
    if (isDbLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 border border-zinc-800 rounded-xl bg-[#111114]">
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs">Syncing real-time records...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            projects={projects}
            employees={employees}
            assets={assets}
            expenses={expenses}
            apartments={apartments}
            onNavigateToRole={(role) => handleRoleChange(role)}
            isBasicPlan={isBasicPlan}
          />
        );
      case 'projects':
        return (
          <ProjectManager
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            isBasicPlan={isBasicPlan}
            ganttTasks={ganttTasks}
            onAddGanttTask={handleAddGanttTask}
            onUpdateGanttTask={handleUpdateGanttTask}
            projectMilestones={projectMilestones}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
          />
        );
      case 'employees':
        return (
          <EmployeeManager
            employees={employees}
            projects={projects}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            currentUserRole={currentRole}
            userProfiles={userProfiles}
            onAddUserProfile={handleAddUserProfile}
            onRemoveUserProfile={handleRemoveUserProfile}
            currentUserId={currentUser.id}
          />
        );
      case 'assets':
        return (
          <AssetManager
            assets={assets}
            projects={projects}
            onAddAsset={handleAddAsset}
            onRemoveAsset={handleRemoveAsset}
            onUpdateAsset={handleUpdateAsset}
          />
        );
      case 'properties':
        return (
          <PropertyManager
            apartments={apartments}
            projects={projects}
            onAddApartment={handleAddApartment}
            onRemoveApartment={handleRemoveApartment}
            onUpdateApartment={handleUpdateApartment}
            isBasicPlan={isBasicPlan}
            maintenanceTickets={maintenanceTickets}
            onUpdateTicket={handleUpdateTicket}
          />
        );
      case 'expenses':
        return (
          <ExpenseTracker
            expenses={expenses}
            projects={projects}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
          />
        );
      case 'materials':
        return (
          <MaterialManager
            materials={materials}
            projects={projects}
            vendors={vendors}
            onAddMaterial={handleAddMaterial}
            onRemoveMaterial={handleRemoveMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onTriggerNotification={handleTriggerNotification}
          />
        );
      case 'vendors':
        return (
          <VendorManager
            vendors={vendors}
            onAddVendor={handleAddVendor}
            onRemoveVendor={handleRemoveVendor}
            onUpdateVendor={handleUpdateVendor}
            onTriggerNotification={handleTriggerNotification}
            isBasicPlan={isBasicPlan}
            tenders={tenders}
            onAddTender={handleAddTender}
            onUpdateTender={handleUpdateTender}
            onAddBid={handleAddBid}
            projects={projects}
          />
        );
      case 'client-dashboard':
        return (
          <ClientDashboard
            currentUser={currentUser}
            apartments={apartments}
            onUpdateApartment={handleUpdateApartment}
            showToast={showToast}
            isBasicPlan={isBasicPlan}
            maintenanceTickets={maintenanceTickets}
            onAddTicket={handleAddTicket}
            onUpdateTicket={handleUpdateTicket}
          />
        );
      case 'billing':
        return (
          <BillingManager
            bills={bills}
            apartments={apartments}
            onAddBill={handleAddBill}
            onRemoveBill={handleRemoveBill}
            onUpdateBill={handleUpdateBill}
            onTriggerNotification={handleTriggerNotification}
          />
        );
      case 'saas-hub':
        return (
          <SaaSSupabaseCenter />
        );
      case 'super-admin':
        return (
          <SuperAdminDashboard
            saasTenants={saasTenants}
            onAddTenant={handleAddSaasTenant}
            onRemoveTenant={handleRemoveSaasTenant}
            onUpdateTenant={handleUpdateSaasTenant}
            onTriggerNotification={handleTriggerNotification}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border">
            Component tab "{activeTab}" is not accessible for this role.
          </div>
        );
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="re-management-app-root" className={`min-h-screen ${theme === 'light' ? 'theme-light bg-zinc-100 text-zinc-800' : 'bg-[#09090b] text-zinc-300'} flex flex-col font-sans`}>
      <RoleSelector
        currentUser={currentUser}
        onLogout={handleLogout}
        onRoleChange={handleRoleChange}
        pendingExpensesCount={expenses.filter(e => e.status === 'Pending').length}
        availableApartmentsCount={apartments.filter(a => a.status === 'Available').length}
        notifications={filteredNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearNotifications={handleClearNotifications}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="flex flex-1 relative">
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isBasicPlan={isBasicPlan}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {notification && (
            <div
              id="app-alert-strip"
              className={`p-3.5 rounded-xl border text-xs font-semibold shadow-md transition-all duration-300 flex items-center justify-between ${notification.type === 'success' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' :
                notification.type === 'alert' ? 'bg-red-950/40 text-red-400 border-red-900/60' :
                  'bg-zinc-900/80 text-white border-zinc-800'
                }`}
            >
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="text-zinc-500 hover:text-zinc-300 font-bold ml-4 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}