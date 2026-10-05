import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, HardHat, Users, Building2, DollarSign, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: (user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
  }) => void;
}

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  initials: string;
  passwordDescription: string;
  colorClass: string;
  icon: React.ReactNode;
}

const getIconForRole = (role: UserRole) => {
  switch (role) {
    case 'Admin':
      return <Shield className="w-4 h-4" />;
    case 'ProjectManager':
      return <HardHat className="w-4 h-4" />;
    case 'HRManager':
      return <Users className="w-4 h-4" />;
    case 'PropertyManager':
      return <Building2 className="w-4 h-4" />;
    case 'FinancialOfficer':
      return <DollarSign className="w-4 h-4" />;
    case 'Client':
      return <Users className="w-4 h-4 text-blue-400" />;
    case 'SuperAdmin':
      return <ShieldAlert className="w-4 h-4 text-violet-400" />;
    default:
      return <Users className="w-4 h-4" />;
  }
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [demoProfiles] = useState<DemoProfile[]>(() => {
    try {
      const saved = localStorage.getItem('re_ms_user_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasSuperAdmin = parsed.some((p: any) => p.role === 'SuperAdmin');
        if (!hasSuperAdmin) {
          parsed.unshift({
            id: 'SUP-001',
            name: 'Alexander Dominus',
            email: 'alexander@domus.com',
            role: 'SuperAdmin' as UserRole,
            department: 'SaaS Platform Operations',
            initials: 'AD',
            passwordDescription: 'super',
            colorClass: 'from-violet-500 to-indigo-600 ring-violet-500/20 text-violet-400 bg-violet-950/20 border-violet-900/40',
          });
          localStorage.setItem('re_ms_user_profiles', JSON.stringify(parsed));
        }
        return parsed.map((p: any) => ({
          ...p,
          icon: getIconForRole(p.role)
        }));
      }
    } catch {}

    const defaults = [
      {
        id: 'SUP-001',
        name: 'Alexander Dominus',
        email: 'alexander@domus.com',
        role: 'SuperAdmin' as UserRole,
        department: 'SaaS Platform Operations',
        initials: 'AD',
        passwordDescription: 'super',
        colorClass: 'from-violet-500 to-indigo-600 ring-violet-500/20 text-violet-400 bg-violet-950/20 border-violet-900/40',
      },
      {
        id: 'EMP-000',
        name: 'Sophia Vandervelde',
        email: 's.vandervelde@apexrealestate.com',
        role: 'Admin' as UserRole,
        department: 'Executive HQ',
        initials: 'SV',
        passwordDescription: 'admin',
        colorClass: 'from-amber-500 to-orange-600 ring-amber-500/20 text-amber-400 bg-amber-950/20 border-amber-900/40',
      },
      {
        id: 'EMP-001',
        name: 'Sarah Jenkins',
        email: 's.jenkins@apexrealestate.com',
        role: 'ProjectManager' as UserRole,
        department: 'Engineering',
        initials: 'SJ',
        passwordDescription: 'project',
        colorClass: 'from-cyan-500 to-blue-600 ring-cyan-500/20 text-cyan-400 bg-cyan-950/20 border-cyan-900/40',
      },
      {
        id: 'EMP-004',
        name: 'Amanda Ross',
        email: 'a.ross@apexrealestate.com',
        role: 'HRManager' as UserRole,
        department: 'Human Resources',
        initials: 'AR',
        passwordDescription: 'hr',
        colorClass: 'from-emerald-500 to-teal-600 ring-emerald-500/20 text-emerald-400 bg-emerald-950/20 border-emerald-900/40',
      },
      {
        id: 'EMP-008',
        name: 'Claire Standish',
        email: 'c.standish@apexrealestate.com',
        role: 'PropertyManager' as UserRole,
        department: 'Property Sales',
        initials: 'CS',
        passwordDescription: 'property',
        colorClass: 'from-fuchsia-500 to-purple-600 ring-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-950/20 border-fuchsia-900/40',
      },
      {
        id: 'EMP-005',
        name: 'Gregory Pecks',
        email: 'g.pecks@apexrealestate.com',
        role: 'FinancialOfficer' as UserRole,
        department: 'Finance',
        initials: 'GP',
        passwordDescription: 'finance',
        colorClass: 'from-rose-500 to-red-600 ring-rose-500/20 text-rose-400 bg-rose-950/20 border-rose-900/40',
      },
      {
        id: 'CLI-001',
        name: 'David Miller',
        email: 'd.miller@client.com',
        role: 'Client' as UserRole,
        department: 'Client Portal',
        initials: 'DM',
        passwordDescription: 'client',
        colorClass: 'from-blue-500 to-indigo-600 ring-blue-500/20 text-blue-400 bg-blue-950/20 border-blue-900/40',
      },
    ];

    localStorage.setItem('re_ms_user_profiles', JSON.stringify(defaults));

    return defaults.map(p => ({
      ...p,
      icon: getIconForRole(p.role)
    }));
  });

  const handleProfileSelect = (profile: DemoProfile) => {
    setEmail(profile.email);
    setPassword(profile.passwordDescription);
    setError(null);
  };

  const executeLogin = async (userEmail: string, userPass: string) => {
    setError(null);
    setIsLoading(true);

    try {
      if (!supabase) {
        setError('Database connection is not configured properly.');
        setIsLoading(false);
        return;
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail.trim(),
        password: userPass,
      });

      if (authError) {
        setError(authError.message || 'Incorrect security key / credential passcode.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const userRole = (data.user.user_metadata?.role as UserRole) || 'Client';
        const userDepartment = data.user.user_metadata?.department || 'General';
        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';

        onLoginSuccess({
          id: data.user.id,
          name: userName,
          email: data.user.email!,
          role: userRole,
          department: userDepartment,
        });
      }
    } catch (err: any) {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Corporate email address is required.');
      return;
    }
    if (!password) {
      setError('Security key is required.');
      return;
    }
    executeLogin(email, password);
  };

  const handleQuickLogin = (profile: DemoProfile) => {
    executeLogin(profile.email, profile.passwordDescription);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 select-none">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-2xl shadow-xl">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-extrabold text-zinc-950 text-sm">
              D
            </div>
            <span className="font-black text-lg uppercase tracking-widest text-white">
              DOMUS <span className="text-zinc-500 font-medium">OS</span>
            </span>
          </div>
          <div className="pt-2">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-600" /> Enterprise Security Gateway
            </h2>
            <p className="text-xs text-zinc-600 mt-1">Multi-Role Infrastructure & Portfolio Management</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/50 rounded-lg p-3.5 flex items-start gap-3 text-xs text-rose-400 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider">Access Restrained</p>
              <p className="mt-0.5 text-zinc-400">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-[#111114] border border-zinc-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="name@apexrealestate.com"
                  className="w-full text-xs bg-[#09090b] border border-zinc-800/80 rounded pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Security Passcode
                </label>
                <span className="text-[9px] text-zinc-600 font-mono">256-BIT ENCRYPTED</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full text-xs bg-[#09090b] border border-zinc-800/80 rounded pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-widest rounded transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Verify Credentials <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Active Corporate Directory (Demo Profiles)
            </h3>
            <span className="text-[9px] text-emerald-500 font-bold tracking-wider bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded">
              AUTO-FILL READY
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {demoProfiles.map((profile) => (
              <div
                key={profile.role}
                id={`demo-profile-${profile.role.toLowerCase()}`}
                className={`bg-[#111114] hover:bg-[#15151a] border border-zinc-850 rounded p-3 flex items-center justify-between transition-all duration-150 group`}
              >
                <div 
                  onClick={() => handleProfileSelect(profile)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  title="Populate credentials"
                >
                  <div className={`w-9 h-9 rounded flex items-center justify-center text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300`}>
                    {profile.initials}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-white group-hover:text-zinc-200 transition-colors">
                      {profile.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-zinc-400">{profile.role === 'ProjectManager' ? 'Construction Mgr' : profile.role === 'FinancialOfficer' ? 'Financial Officer' : profile.role}</span>
                      <span>•</span>
                      <span className="truncate">{profile.department}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-600 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60 select-all">
                    Key: {profile.passwordDescription}
                  </span>
                  <button
                    onClick={() => handleQuickLogin(profile)}
                    className="text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1"
                    title="Sign-In Instantly"
                  >
                    Quick Sign-In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-[11px] text-zinc-600">
          <p>DOMUS Operational Suite, Apex Real Estate. Unauthorized access is recorded.</p>
        </div>
      </div>
    </div>
  );
};