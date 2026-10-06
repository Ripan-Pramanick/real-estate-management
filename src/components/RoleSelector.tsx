/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, SystemNotification } from '../types';
import { 
  Shield, 
  HardHat, 
  Users, 
  Building2, 
  DollarSign, 
  LogOut, 
  ShieldCheck, 
  HelpCircle, 
  Key, 
  ChevronDown,
  Bell,
  BellRing,
  Check,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Sun,
  Moon
} from 'lucide-react';

interface RoleSelectorProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
  };
  onLogout: () => void;
  onRoleChange: (role: UserRole) => void;
  pendingExpensesCount: number;
  availableApartmentsCount: number;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentUser,
  onLogout,
  onRoleChange,
  pendingExpensesCount,
  availableApartmentsCount,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [showAdminSwitcher, setShowAdminSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);


  const rolesList: { value: UserRole; label: string; icon: React.ReactNode; desc: string; color: string; badge?: string }[] = [
    {
      value: 'Admin',
      label: 'Executive Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      desc: 'Global portfolio oversight, financial summaries, and cross-departmental analytics.',
      color: 'from-amber-500 to-orange-600 border-amber-500/30 text-amber-400 bg-amber-950/20',
    },
    {
      value: 'ProjectManager',
      label: 'Project & Construction',
      icon: <HardHat className="w-3.5 h-3.5" />,
      desc: 'Construction phases, schedules, safety audits, and project site progress tracking.',
      color: 'from-cyan-500 to-blue-600 border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
    },
    {
      value: 'HRManager',
      label: 'HR & Employee Manager',
      icon: <Users className="w-3.5 h-3.5" />,
      desc: 'Staff rosters, subcontractor logs, wage sheets, and contractor rosters.',
      color: 'from-emerald-500 to-teal-600 border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
    },
    {
      value: 'PropertyManager',
      label: 'Property & Spaces',
      icon: <Building2 className="w-3.5 h-3.5" />,
      desc: 'Already built apartment units, leasing details, rental status, and occupancy logs.',
      badge: availableApartmentsCount > 0 ? `${availableApartmentsCount} free` : undefined,
      color: 'from-fuchsia-500 to-purple-600 border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-950/20',
    },
    {
      value: 'FinancialOfficer',
      label: 'Financial Officer',
      icon: <DollarSign className="w-3.5 h-3.5" />,
      desc: 'Expense ledger accounts, capital investments, and invoice approval workflows.',
      badge: pendingExpensesCount > 0 ? `${pendingExpensesCount} pend` : undefined,
      color: 'from-rose-500 to-red-600 border-rose-500/30 text-rose-400 bg-rose-950/20',
    },
    {
      value: 'SuperAdmin',
      label: 'SaaS Super Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      desc: 'SaaS Platform management, company purchases, admin creation, and global platform telemetry.',
      color: 'from-violet-500 to-indigo-600 border-violet-500/30 text-violet-400 bg-violet-950/20',
    },
  ];

  const getRoleBadgeStyles = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/40';
      case 'ProjectManager':
        return 'bg-cyan-950/40 text-cyan-400 border-cyan-900/40';
      case 'HRManager':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
      case 'PropertyManager':
        return 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-900/40';
      case 'FinancialOfficer':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/40';
      case 'SuperAdmin':
        return 'bg-violet-950/40 text-violet-400 border-violet-900/40';
      default:
        return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'ProjectManager': return <HardHat className="w-4 h-4 text-cyan-400" />;
      case 'HRManager': return <Users className="w-4 h-4 text-emerald-400" />;
      case 'PropertyManager': return <Building2 className="w-4 h-4 text-fuchsia-400" />;
      case 'FinancialOfficer': return <DollarSign className="w-4 h-4 text-rose-400" />;
      case 'SuperAdmin': return <ShieldCheck className="w-4 h-4 text-violet-400" />;
      case 'Client': return <Users className="w-4 h-4 text-blue-400" />;
      default: return <HelpCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getRoleContextStatus = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          metric: 'Global Portfolio',
          desc: 'Full CapEx ledger & cross-system overview'
        };
      case 'ProjectManager':
        return {
          metric: '5 active construction projects',
          desc: 'Directing heavy equipment registries & on-site progress'
        };
      case 'HRManager':
        return {
          metric: 'Corporate staffing directory',
          desc: 'Roster directory & independent subcontractor logs'
        };
      case 'PropertyManager':
        return {
          metric: `${availableApartmentsCount} finished spaces available`,
          desc: 'Portfolio occupancy, leasing, and pricing logs'
        };
      case 'FinancialOfficer':
        return {
          metric: `${pendingExpensesCount} pending invoice approvals`,
          desc: 'Ledger tracking, asset valuation & project expenses sign-off'
        };
      case 'SuperAdmin':
        return {
          metric: 'SaaS Platform Control',
          desc: 'Provisioning company accounts, registering admins, and tracking telemetry'
        };
      case 'Client':
        return {
          metric: 'Client Portal',
          desc: 'Project tracking, milestones, and invoice payments'
        };
      default:
        return {
          metric: 'Portfolio Desk',
          desc: 'Enterprise operations and analytics tracking'
        };
    }
  };

  const activeRoleDetails = rolesList.find((r) => r.value === currentUser.role);
  const initials = currentUser.name.split(' ').map(n => n[0]).join('');
  const contextStatus = getRoleContextStatus(currentUser.role);

  return (
    <div className="bg-[#111114] border-b border-zinc-800 text-zinc-300 shadow-xl relative z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: User Identity Info */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-zinc-850 border border-zinc-800 text-sm relative`}>
              {initials}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111114] flex items-center justify-center" title="Session Verified">
                <ShieldCheck className="w-2.5 h-2.5 text-[#111114]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-white">{currentUser.name}</span>
                <span className="text-[10px] text-zinc-500">•</span>
                <span className="text-[10px] text-zinc-400 font-mono">{currentUser.email}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold bg-zinc-900 border-zinc-800 text-zinc-500">
                  {currentUser.department}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-semibold uppercase tracking-wider">
                  {getRoleIcon(currentUser.role)} {currentUser.role === 'ProjectManager' ? 'Construction Director' : currentUser.role === 'FinancialOfficer' ? 'Financial Officer' : activeRoleDetails?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Contextual Role Message (Desktop/Tablet) */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center bg-[#09090b]/40 border border-zinc-850/60 px-4 py-1.5 rounded-lg max-w-sm">
            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Dashboard Focus</span>
            <span className="text-xs text-zinc-200 font-medium mt-0.5 truncate">{contextStatus.metric}</span>
          </div>

          {/* Right: Actions (Admin Override and Sign Out) */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-500" />
                )}
              </button>
            )}
            
            {/* Admin Quick Switch (Conditional for Admin and SuperAdmin) */}
            {(currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin') && (
              <div className="relative">
                <button
                  onClick={() => setShowAdminSwitcher(!showAdminSwitcher)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-amber-400 rounded-lg transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Switcher</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdminSwitcher ? 'rotate-180' : ''}`} />
                </button>

                {showAdminSwitcher && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111114] border border-zinc-850 rounded-lg shadow-2xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-zinc-850 text-[9px] uppercase tracking-wider font-bold text-zinc-500">
                      Simulate Other Systems
                    </div>
                    {rolesList.map((role) => {
                      if (role.value === 'SuperAdmin' && currentUser.email !== 'demo@mail.in') {
                        return null;
                      }
                      const isActive = currentUser.role === role.value;
                      return (
                        <button
                          key={role.value}
                          onClick={() => {
                            onRoleChange(role.value);
                            setShowAdminSwitcher(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer ${
                            isActive ? 'text-amber-400 bg-zinc-900' : 'text-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {role.icon}
                            <span>{role.value === 'ProjectManager' ? 'Construction' : role.value === 'FinancialOfficer' ? 'Financial Officer' : role.label}</span>
                          </span>
                          {role.badge && (
                            <span className="text-[9px] px-1 bg-zinc-900 text-rose-400 rounded font-bold">
                              {role.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Standard Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="Terminate Secure Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {/* Functional Notification Icon & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowAdminSwitcher(false);
                }}
                className={`relative p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  showNotifications 
                    ? 'bg-zinc-800 text-white border-zinc-700' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-white'
                }`}
                title="System Notifications"
              >
                {notifications.some(n => !n.read) ? (
                  <>
                    <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-[#111114]">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </>
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111114] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in text-left">
                  {/* Notifications Header */}
                  <div className="p-3 bg-[#141417] border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                      Security & Ops Alerts
                    </span>
                    <div className="flex items-center gap-2">
                      {notifications.some(n => !n.read) && (
                        <button
                          onClick={() => onMarkAllAsRead()}
                          className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark Read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => onClearNotifications()}
                          className="text-[10px] text-zinc-500 hover:text-rose-400 font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification List Body */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-850">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        No security or operational alerts logged.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const getNotificationStyle = (type: string, read: boolean) => {
                          const base = "p-3.5 flex gap-2 transition-all ";
                          const unreadBorder = read ? "" : "border-l-2 border-amber-500 ";
                          const bg = read ? "bg-transparent hover:bg-zinc-900/40" : "bg-amber-950/5 hover:bg-amber-950/10";
                          return base + unreadBorder + bg;
                        };

                        const getNotificationIcon = (type: string) => {
                          switch (type) {
                            case 'warning':
                              return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
                            case 'success':
                              return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                            case 'error':
                              return <X className="w-4 h-4 text-rose-500 shrink-0" />;
                            default:
                              return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
                          }
                        };

                        const formattedTime = (iso: string) => {
                          try {
                            const date = new Date(iso);
                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                          } catch {
                            return 'Recent';
                          }
                        };

                        return (
                          <div 
                            key={n.id} 
                            onClick={() => !n.read && onMarkAsRead(n.id)}
                            className={getNotificationStyle(n.type, n.read)}
                          >
                            <div className="mt-0.5">
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold block truncate ${n.read ? 'text-zinc-300' : 'text-white'}`}>
                                  {n.title}
                                </span>
                                {!n.read && (
                                  <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                                )}
                              </div>
                              <p className={`text-[11px] mt-0.5 leading-relaxed break-words ${n.read ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                {n.message}
                              </p>
                              <span className="text-[9px] font-mono text-zinc-600 mt-1 block">
                                {formattedTime(n.timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown footer */}
                  <div className="p-2 bg-[#141417] border-t border-zinc-800 text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-zinc-400 hover:text-white font-semibold uppercase tracking-wider block w-full py-1 cursor-pointer"
                    >
                      Close Panel
                    </button>
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};