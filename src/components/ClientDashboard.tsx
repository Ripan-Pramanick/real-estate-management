/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Apartment, Project } from '../types';
import { 
  Building2, 
  Key, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  User, 
  ShoppingBag, 
  FileText, 
  Compass, 
  Filter, 
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  CreditCard,
  Percent,
  Wrench,
  Clock,
  AlertTriangle,
  Plus,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { MaintenanceTicket } from '../types';

interface ClientDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  apartments: Apartment[];
  onUpdateApartment: (id: string, updatedFields: Partial<Apartment>) => void;
  showToast: (msg: string, type: 'success' | 'alert' | 'info') => void;
  isBasicPlan?: boolean;
  maintenanceTickets: MaintenanceTicket[];
  onAddTicket: (ticket: MaintenanceTicket) => void;
  onUpdateTicket: (id: string, updatedFields: Partial<MaintenanceTicket>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  apartments,
  onUpdateApartment,
  showToast,
  isBasicPlan = false,
  maintenanceTickets = [],
  onAddTicket,
  onUpdateTicket,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'portfolio' | 'explore' | 'maintenance'>('portfolio');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  // Interactive transaction states
  const [leasingAptId, setLeasingAptId] = useState<string | null>(null);
  const [buyingAptId, setBuyingAptId] = useState<string | null>(null);
  const [leaseMonths, setLeaseMonths] = useState('12');

  // New Maintenance States
  const [showAddTicketForm, setShowAddTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket['category']>('Plumbing');
  const [ticketPriority, setTicketPriority] = useState<MaintenanceTicket['priority']>('Medium');
  const [ticketAptId, setTicketAptId] = useState('');

  // Filter client's properties
  const myProperties = apartments.filter(
    (apt) => apt.tenantName?.toLowerCase() === currentUser.name.toLowerCase()
  );

  const availableProperties = apartments.filter((apt) => apt.status === 'Available');

  // Filter client's maintenance tickets
  const myTickets = maintenanceTickets.filter(
    (t) => t.tenantEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc || !ticketAptId) {
      showToast('Please fill in all ticket details.', 'alert');
      return;
    }

    const selectedApt = myProperties.find(a => a.id === ticketAptId);
    if (!selectedApt) return;

    // SLA Calculation based on plan (plan-specific!)
    const date = new Date();
    let hoursToAdd = 72; // default Basic Plan
    if (!isBasicPlan) {
      // Business Plan SLA FAST-TRACK
      if (ticketPriority === 'Emergency') hoursToAdd = 4;
      else if (ticketPriority === 'High') hoursToAdd = 24;
      else if (ticketPriority === 'Medium') hoursToAdd = 48;
      else hoursToAdd = 72;
    }
    date.setHours(date.getHours() + hoursToAdd);

    const newTicket: MaintenanceTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      title: ticketTitle,
      description: ticketDesc,
      apartmentId: selectedApt.id,
      buildingName: selectedApt.buildingName,
      unitNumber: selectedApt.unitNumber,
      tenantName: currentUser.name,
      tenantEmail: currentUser.email,
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      createdAt: new Date().toISOString(),
      slaDeadline: date.toISOString(),
      assignedStaff: '',
      resolutionNotes: ''
    };

    onAddTicket(newTicket);
    setTicketTitle('');
    setTicketDesc('');
    setTicketCategory('Plumbing');
    setTicketPriority('Medium');
    setTicketAptId('');
    setShowAddTicketForm(false);
  };

  // Stats
  const activeLeases = myProperties.filter((p) => p.status === 'Rented');
  const purchasedUnits = myProperties.filter((p) => p.status === 'Sold');
  const monthlyRentCost = activeLeases.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
  const totalCapitalInvested = purchasedUnits.reduce((sum, p) => sum + p.price, 0);

  // Property type list for explorer filters
  const uniqueTypes = Array.from(new Set(apartments.map((a) => a.type)));
  const uniqueBuildings = Array.from(new Set(apartments.map((a) => a.buildingName)));

  const handleLeaseSubmit = (e: React.FormEvent, aptId: string) => {
    e.preventDefault();
    const apt = apartments.find((a) => a.id === aptId);
    if (!apt) return;

    const start = new Date().toISOString().split('T')[0];
    const durationMonths = Number(leaseMonths) || 12;
    const end = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // standard rent rule: 0.5% of total value per month
    const calculatedRent = Math.round(apt.price * 0.005);

    onUpdateApartment(aptId, {
      status: 'Rented',
      tenantName: currentUser.name,
      leaseStart: start,
      leaseEnd: end,
      monthlyRent: calculatedRent,
    });

    setLeasingAptId(null);
    showToast(`Successfully leased ${apt.buildingName} Unit ${apt.unitNumber}!`, 'success');
  };

  const handlePurchase = (aptId: string) => {
    const apt = apartments.find((a) => a.id === aptId);
    if (!apt) return;

    onUpdateApartment(aptId, {
      status: 'Sold',
      tenantName: currentUser.name,
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: undefined,
      monthlyRent: undefined,
    });

    setBuyingAptId(null);
    showToast(`Congratulations! You purchased ${apt.buildingName} Unit ${apt.unitNumber}!`, 'success');
  };

  const filteredExplore = availableProperties.filter((apt) => {
    const matchesType = filterType === 'all' || apt.type === filterType;
    const matchesBuilding = filterBuilding === 'all' || apt.buildingName === filterBuilding;
    return matchesType && matchesBuilding;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#111114] to-zinc-950 p-6 rounded-xl border border-zinc-800/80 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-zinc-400" />
        </div>
        <div className="max-w-xl space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
            Client Portal Verified
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome to Apex Concierge</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Manage your registered corporate real estate lease agreements, purchase records, and explore premier office spaces and residential suites across all of our master-planned developments.
          </p>
        </div>
      </div>

      {/* Portfolio Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 text-left">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">My Properties</span>
          <h3 className="text-xl font-bold text-white mt-1">{myProperties.length} Units</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Purchased or leased</p>
        </div>
        <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 text-left">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Active Leases</span>
          <h3 className="text-xl font-bold text-cyan-400 mt-1">{activeLeases.length} Portfolios</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Ongoing tenancy terms</p>
        </div>
        <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 text-left">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Monthly Rent</span>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">${monthlyRentCost.toLocaleString()}/mo</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Recurring commitments</p>
        </div>
        <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 text-left">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Capital Invested</span>
          <h3 className="text-xl font-bold text-amber-400 mt-1">${totalCapitalInvested.toLocaleString()}</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Total acquisition value</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveSubTab('portfolio')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'portfolio'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" /> My Registered Holdings ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveSubTab('explore')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'explore'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Compass className="w-4 h-4" /> Explore Available Real Estate ({availableProperties.length})
        </button>
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'maintenance'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Wrench className="w-4 h-4" /> Maintenance Tickets ({myTickets.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'portfolio' ? (
        <div className="space-y-4 text-left">
          {myProperties.length === 0 ? (
            <div className="bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center space-y-4">
              <Building2 className="w-12 h-12 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-300">No properties registered under your name yet</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Acquire or lease units inside any active real estate development. You can lease or buy immediately in the "Explore" tab.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('explore')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-[#111114] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                          {apt.id}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{apt.buildingName}</h4>
                        <p className="text-xs text-zinc-400 font-medium">Unit {apt.unitNumber} ({apt.type})</p>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold border uppercase tracking-wider ${
                          apt.status === 'Rented'
                            ? 'bg-cyan-950/40 text-cyan-400 border-cyan-900/40'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                        }`}
                      >
                        {apt.status === 'Rented' ? 'ACTIVE LEASE' : 'OWNED'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 p-2 rounded">
                        <span className="text-zinc-500">Total Area:</span>
                        <span className="font-semibold text-white">{apt.areaSqFt.toLocaleString()} Sq.Ft</span>
                      </div>
                      {apt.status === 'Rented' ? (
                        <>
                          <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 p-2 rounded text-cyan-400">
                            <span className="text-zinc-500">Monthly Rent:</span>
                            <span className="font-bold">${apt.monthlyRent?.toLocaleString()}/mo</span>
                          </div>
                          <div className="bg-[#09090b] border border-zinc-850 p-2.5 rounded text-[11px] text-zinc-400 space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Lease term active until:</span>
                            </div>
                            <div className="font-mono text-white text-right font-bold">{apt.leaseEnd}</div>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 p-2 rounded text-emerald-400">
                          <span className="text-zinc-500 font-semibold">Acquisition Cost:</span>
                          <span className="font-bold">${apt.price.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-zinc-850 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-zinc-500">Property Utilities</span>
                    {apt.status === 'Rented' ? (
                      <button
                        onClick={() => showToast(`Payment processed for ${apt.buildingName} Unit ${apt.unitNumber}!`, 'success')}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Pay Rent Invoice
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                        <CheckCircle className="w-3.5 h-3.5" /> Deed Registered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'explore' ? (
        <div className="space-y-6 text-left">
          {/* Explorer Filters */}
          <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Filters:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Property Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Developments</option>
              {uniqueBuildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Explore Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExplore.map((apt) => (
              <div
                key={apt.id}
                className="bg-[#111114] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-wider bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                        {apt.id}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{apt.buildingName}</h4>
                      <p className="text-xs text-zinc-400 font-medium">Unit {apt.unitNumber} ({apt.type})</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold border border-emerald-900/40 bg-emerald-950/40 text-emerald-400 uppercase tracking-wider">
                      AVAILABLE
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 p-2 rounded">
                      <span className="text-zinc-500">Total Area:</span>
                      <span className="font-semibold text-white">{apt.areaSqFt.toLocaleString()} Sq.Ft</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 p-2 rounded">
                      <span className="text-zinc-500">Valuation / Purchase Price:</span>
                      <span className="font-bold text-white">${apt.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 p-2 rounded text-cyan-400">
                      <span className="text-zinc-500">Leasing Rate (Est.):</span>
                      <span className="font-bold">${Math.round(apt.price * 0.005).toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Inline Forms / Buttons */}
                <div className="pt-3.5 border-t border-zinc-850 space-y-3">
                  {leasingAptId === apt.id ? (
                    <form onSubmit={(e) => handleLeaseSubmit(e, apt.id)} className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                        <span>Lease Terms Configuration</span>
                        <button
                          type="button"
                          onClick={() => setLeasingAptId(null)}
                          className="text-zinc-500 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400">Duration (Months)</label>
                        <select
                          value={leaseMonths}
                          onChange={(e) => setLeaseMonths(e.target.value)}
                          className="w-full text-xs border border-zinc-800 p-1.5 rounded bg-zinc-900 text-zinc-100"
                        >
                          <option value="6">6 Months Term</option>
                          <option value="12">12 Months (Standard)</option>
                          <option value="24">24 Months (Premium discount)</option>
                          <option value="36">36 Months (Corporate lock-in)</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                      >
                        Confirm Lease Agreement
                      </button>
                    </form>
                  ) : buyingAptId === apt.id ? (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-300">
                        Confirm buyout of <span className="text-white font-semibold">Unit {apt.unitNumber}</span> for <span className="text-amber-400 font-bold">${apt.price.toLocaleString()}</span>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePurchase(apt.id)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                        >
                          Confirm & Pay
                        </button>
                        <button
                          onClick={() => setBuyingAptId(null)}
                          className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-semibold text-xs rounded transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setLeasingAptId(apt.id);
                          setBuyingAptId(null);
                        }}
                        className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-cyan-400" /> Lease Unit
                      </button>
                      <button
                        onClick={() => {
                          setBuyingAptId(apt.id);
                          setLeasingAptId(null);
                        }}
                        className="flex-1 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Buy Unit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredExplore.length === 0 && (
              <div className="col-span-full bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center">
                <Building2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No available properties match the selected criteria.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Maintenance Ticketing Tab Workspace */
        <div className="space-y-6 text-left">
          {/* Header section with plan limits */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-6 rounded-lg border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" /> Tenant Maintenance Ticketing
              </h3>
              <p className="text-xs text-zinc-400">
                Log mechanical, plumbing, or facility issues for your leased/owned corporate suites.
              </p>
            </div>
            
            <div className={`p-3.5 rounded border text-xs ${
              isBasicPlan 
                ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' 
                : 'bg-cyan-950/20 border-cyan-900/50 text-cyan-400'
            }`}>
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-1 text-[10px]">
                <ShieldAlert className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{isBasicPlan ? 'Standard Plan SLA' : 'Premium Fast-Track SLA'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {isBasicPlan 
                  ? 'All requests have a flat 72-hour guaranteed window.' 
                  : 'Emergency: 4 hours • High: 24 hours • Medium: 48 hours guaranteed.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Request Logs ({myTickets.length})
                </h4>
                
                {myProperties.length > 0 && !showAddTicketForm && (
                  <button
                    onClick={() => {
                      setShowAddTicketForm(true);
                      if (myProperties.length > 0) {
                        setTicketAptId(myProperties[0].id);
                      }
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-zinc-250 text-zinc-950 font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> File New Ticket
                  </button>
                )}
              </div>

              {myTickets.length === 0 ? (
                <div className="bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center space-y-2">
                  <Wrench className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
                  <p className="text-zinc-300 font-bold text-sm">No maintenance requests registered</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    If you experience any issues with heating, power, or infrastructure in your units, log a request here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myTickets.map((ticket) => {
                    // Check if SLA is expired
                    const now = new Date();
                    const deadline = new Date(ticket.slaDeadline);
                    const isSlaExpired = now > deadline && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
                    
                    return (
                      <div
                        key={ticket.id}
                        className="bg-[#111114] border border-zinc-800 rounded-lg p-5 space-y-4"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                                {ticket.id}
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider ${
                                ticket.priority === 'Emergency'
                                  ? 'bg-rose-950/40 border-rose-900/50 text-rose-400 animate-pulse'
                                  : ticket.priority === 'High'
                                  ? 'bg-amber-950/40 border-amber-900/50 text-amber-400'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                              }`}>
                                {ticket.priority} Priority
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider ${
                                ticket.status === 'Resolved'
                                  ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                                  : ticket.status === 'In Progress'
                                  ? 'bg-cyan-950/40 border-cyan-900/50 text-cyan-400'
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-400'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-white mt-1.5">{ticket.title}</h5>
                            <p className="text-[11px] font-semibold text-zinc-400">
                              {ticket.buildingName} • Unit {ticket.unitNumber}
                            </p>
                          </div>

                          {/* Countdown timers */}
                          <div className="text-right text-xs">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Response Window SLA</span>
                            {ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 justify-end">
                                <CheckCircle className="w-3.5 h-3.5" /> Met SLA
                              </span>
                            ) : isSlaExpired ? (
                              <span className="text-red-400 font-bold flex items-center gap-1 mt-0.5 justify-end animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" /> SLA Breached (Escalated)
                              </span>
                            ) : (
                              <span className="text-cyan-400 font-bold flex items-center gap-1 mt-0.5 justify-end font-mono">
                                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                                {(() => {
                                  const diff = deadline.getTime() - now.getTime();
                                  const hours = Math.floor(diff / (1000 * 60 * 60));
                                  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                  return `${hours}h ${mins}m left`;
                                })()}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 border border-zinc-850 p-3 rounded">
                          {ticket.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-3.5 border-t border-zinc-850">
                          <div>
                            <span className="text-zinc-500">Filed On:</span>{' '}
                            <span className="font-semibold text-zinc-300">
                              {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                              {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Assigned Dispatcher:</span>{' '}
                            <span className="font-semibold text-zinc-300">
                              {ticket.assignedStaff || 'Awaiting dispatch'}
                            </span>
                          </div>
                          {ticket.resolutionNotes && (
                            <div className="col-span-full bg-emerald-950/10 border border-emerald-900/20 p-2.5 rounded text-emerald-300 mt-1">
                              <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">Resolution Log:</span>
                              {ticket.resolutionNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Request Creation Panel */}
            <div className="space-y-4">
              {showAddTicketForm ? (
                <div className="bg-[#111114] border border-zinc-800 p-5 rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Create Service Ticket
                    </h4>
                    <button
                      onClick={() => setShowAddTicketForm(false)}
                      className="text-xs text-zinc-500 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">Select Leased/Owned Property Unit</label>
                      <select
                        value={ticketAptId}
                        onChange={(e) => setTicketAptId(e.target.value)}
                        className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                      >
                        {myProperties.map((apt) => (
                          <option key={apt.id} value={apt.id}>
                            {apt.buildingName} - Unit {apt.unitNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">Issue Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value as any)}
                        className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                      >
                        <option value="Plumbing">Plumbing / Water</option>
                        <option value="Electrical">Electrical / Power</option>
                        <option value="HVAC">HVAC / Ventilation</option>
                        <option value="Structural">Structural / Hardware</option>
                        <option value="Appliance">Kitchen Appliance</option>
                        <option value="Other">Other Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">Urgency Priority</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                      >
                        <option value="Low">Low (General Inquiry)</option>
                        <option value="Medium">Medium (Standard Repair)</option>
                        <option value="High">High (Disruptive Fault)</option>
                        <option value="Emergency">Emergency (Immediate Risk)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">Service Title Summary</label>
                      <input
                        type="text"
                        placeholder="e.g. Server Room HVAC is failing"
                        value={ticketTitle}
                        onChange={(e) => setTicketTitle(e.target.value)}
                        className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">Detailed Symptoms & Description</label>
                      <textarea
                        rows={4}
                        placeholder="Please describe exactly what happened, location within the suite, and steps taken so far."
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                        className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white text-zinc-950 font-bold rounded hover:bg-zinc-250 transition-colors cursor-pointer text-xs uppercase tracking-wider"
                    >
                      File Service Request
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-[#111114] border border-zinc-800 p-5 rounded-lg text-center space-y-3.5">
                  <Sliders className="w-8 h-8 text-zinc-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Facility Dispatch Center</h4>
                    <p className="text-[11px] text-zinc-400">
                      Our commercial and residential facility technicians are on standby to address your tickets according to your SLA rules.
                    </p>
                  </div>
                  {myProperties.length > 0 ? (
                    <button
                      onClick={() => {
                        setShowAddTicketForm(true);
                        setTicketAptId(myProperties[0].id);
                      }}
                      className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded transition-colors cursor-pointer text-xs uppercase tracking-wider"
                    >
                      File Service Ticket
                    </button>
                  ) : (
                    <p className="text-[10px] text-zinc-500 italic">
                      You must hold or lease at least one property unit to file service tickets.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
