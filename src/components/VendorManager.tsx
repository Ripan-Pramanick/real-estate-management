/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Star, 
  Phone, 
  Mail, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Award, 
  X, 
  Search, 
  Truck, 
  Wrench, 
  HardHat,
  Gavel,
  CheckCircle,
  ShieldCheck,
  FileText,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Vendor, Tender, Bid, Project } from '../types';

interface VendorManagerProps {
  vendors: Vendor[];
  onAddVendor: (v: Vendor) => void;
  onRemoveVendor: (id: string) => void;
  onUpdateVendor: (id: string, fields: Partial<Vendor>) => void;
  onTriggerNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  isBasicPlan?: boolean;
  tenders?: Tender[];
  onAddTender?: (t: Tender) => void;
  onUpdateTender?: (id: string, updatedFields: Partial<Tender>) => void;
  onAddBid?: (tenderId: string, b: Bid) => void;
  projects?: Project[];
}

export const VendorManager: React.FC<VendorManagerProps> = ({
  vendors,
  onAddVendor,
  onRemoveVendor,
  onUpdateVendor,
  onTriggerNotification,
  isBasicPlan = false,
  tenders = [],
  onAddTender,
  onUpdateTender,
  onAddBid,
  projects = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'tenders'>('directory');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Tender Creation Form State
  const [showAddTenderForm, setShowAddTenderForm] = useState(false);
  const [newTenderTitle, setNewTenderTitle] = useState('');
  const [newTenderDesc, setNewTenderDesc] = useState('');
  const [newTenderBudget, setNewTenderBudget] = useState('');
  const [newTenderDueDate, setNewTenderDueDate] = useState('');
  const [newTenderProject, setNewTenderProject] = useState('');
  const [newTenderCategory, setNewTenderCategory] = useState('Raw Materials');

  // Bid Creation Form State
  const [showAddBidId, setShowAddBidId] = useState<string | null>(null);
  const [newBidVendorName, setNewBidVendorName] = useState('');
  const [newBidAmount, setNewBidAmount] = useState('');
  const [newBidDeliveryDays, setNewBidDeliveryDays] = useState('');
  const [newBidProposal, setNewBidProposal] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<Vendor['type']>('Material Supplier');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suppliedItemsRaw, setSuppliedItemsRaw] = useState('');
  const [status, setStatus] = useState<Vendor['status']>('Active');
  const [rating, setRating] = useState(5);
  const [activeContracts, setActiveContracts] = useState('1');

  // Calculations
  const totalVendors = vendors.length;
  const activeCount = vendors.filter(v => v.status === 'Active').length;
  const totalContracts = vendors.reduce((sum, v) => sum + v.activeContractsCount, 0);
  const averageRating = vendors.length > 0 
    ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1) 
    : '0.0';

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !phone || !email || !suppliedItemsRaw) return;

    const suppliedItems = suppliedItemsRaw
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newVendor: Vendor = {
      id: `VND-${Math.floor(100 + Math.random() * 900)}`,
      name,
      type,
      contactPerson,
      phone,
      email,
      suppliedItems,
      status,
      rating: Number(rating),
      activeContractsCount: Number(activeContracts) || 0,
    };

    onAddVendor(newVendor);
    onTriggerNotification(
      'New Logistics Partner',
      `Registered vendor "${newVendor.name}" as a supplier for: ${suppliedItems.join(', ')}.`,
      'success'
    );

    setShowAddForm(false);
    // Reset fields
    setName('');
    setType('Material Supplier');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setSuppliedItemsRaw('');
    setStatus('Active');
    setRating(5);
    setActiveContracts('1');
  };

  const handleRatingChange = (id: string, newRating: number) => {
    onUpdateVendor(id, { rating: newRating });
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
      onTriggerNotification(
        'Logistics Appraisal Updated',
        `Evaluated "${vendor.name}" performance at ${newRating} stars.`,
        'info'
      );
    }
  };

  const handleStatusChange = (id: string, newStatus: Vendor['status']) => {
    onUpdateVendor(id, { status: newStatus });
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
      onTriggerNotification(
        'Contract Status Changed',
        `Contract status for "${vendor.name}" is now ${newStatus}.`,
        'info'
      );
    }
  };

  const handleContractCountChange = (id: string, delta: number) => {
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
      const current = vendor.activeContractsCount;
      const nextCount = Math.max(0, current + delta);
      onUpdateVendor(id, { activeContractsCount: nextCount });
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.suppliedItems.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || v.type === filterType;
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getVendorIcon = (vendorType: Vendor['type']) => {
    switch (vendorType) {
      case 'Material Supplier':
        return <Truck className="w-4 h-4 text-cyan-400" />;
      case 'Machinery Supplier':
        return <Wrench className="w-4 h-4 text-fuchsia-400" />;
      case 'Labour Contractor':
        return <HardHat className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Sub tabs switcher */}
      <div className="flex border-b border-zinc-800 gap-4 mb-2">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'directory'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" /> Vendor Directory ({vendors.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tenders')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'tenders'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Gavel className="w-4 h-4" /> Bid Procurement & Tenders ({tenders.length})
        </button>
      </div>

      {activeSubTab === 'directory' ? (
        <>
          {/* Metrics Header */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Partners</span>
            <h3 className="text-2xl font-mono font-bold text-white mt-1">{totalVendors}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Supply chain ecosystem</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Active Suppliers</span>
            <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-1">{activeCount}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Reliable active contracts</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Avg Quality Appraisal</span>
            <h3 className="text-2xl font-mono font-bold text-amber-400 mt-1">{averageRating} ★</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Performance rating score</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Active Contracts</span>
            <h3 className="text-2xl font-mono font-bold text-white mt-1">{totalContracts}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Current operational linkages</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Panel / Search Bar */}
      <div className="bg-[#111114] border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-4 bg-[#141417] border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search vendor name, person, or items (e.g. Cement, Crane)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-800 rounded-lg bg-zinc-950 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Vendor</span>
          </button>
        </div>

        {/* Tab filters */}
        <div className="px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-800 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2">Filter Category:</span>
          {['all', 'Material Supplier', 'Machinery Supplier', 'Labour Contractor'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                filterType === t 
                  ? 'bg-zinc-850 text-white border border-zinc-700' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              {t === 'all' ? 'All Roles' : t}
            </button>
          ))}
          <span className="text-[10px] text-zinc-700 font-mono hidden sm:inline">|</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-zinc-800 p-1 rounded bg-zinc-900 text-zinc-300 focus:outline-none ml-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Contract Completed">Contract Completed</option>
          </select>
        </div>

        {/* Onboarding Form */}
        {showAddForm && (
          <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-zinc-400" /> Logistics Partner Registration
              </h4>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Logistics / Corporate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Steel Foundries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contract / Supply Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value="Material Supplier">Material Supplier</option>
                  <option value="Machinery Supplier">Machinery Supplier</option>
                  <option value="Labour Contractor">Labour Contractor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contact Officer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Carter"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@apexsteel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Initial Active Contracts *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={activeContracts}
                  onChange={(e) => setActiveContracts(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Appraisal Score (1-5) *</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Premium Partner)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Highly Reliable)</option>
                  <option value={3}>⭐⭐⭐ (3 - Standard Supplier)</option>
                  <option value={2}>⭐⭐ (2 - Minor Incidents)</option>
                  <option value={1}>⭐ (1 - Needs Audit)</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  Supplied Items / Services * <span className="text-[9px] text-zinc-500 normal-case">(comma separated list)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Steel, I-Beams, Reinforced Rebars"
                  value={suppliedItemsRaw}
                  onChange={(e) => setSuppliedItemsRaw(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer font-mono tracking-wider uppercase"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vendors Grid */}
        {filteredVendors.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No registered vendors fit this criteria.</p>
            <p className="text-xs mt-1">Try broadening your search keywords or onboarding new partners.</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((v) => {
              return (
                <div 
                  key={v.id} 
                  className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-4 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all relative group"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {getVendorIcon(v.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-100 line-clamp-1">{v.name}</h4>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{v.id} • {v.type}</span>
                        </div>
                      </div>
                      
                      {/* Delete option */}
                      <button
                        onClick={() => {
                          if (confirm(`Remove vendor registration for "${v.name}"?`)) {
                            onRemoveVendor(v.id);
                            onTriggerNotification('Vendor Removed', `Deregistered vendor "${v.name}" from active logistical databases.`, 'alert');
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 transition-all cursor-pointer absolute top-2 right-2"
                        title="Remove Vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Status Pill & Stars */}
                    <div className="flex items-center justify-between mt-3">
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusChange(v.id, e.target.value as any)}
                        className={`text-[10px] font-mono uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 cursor-pointer bg-zinc-950 focus:outline-none ${
                          v.status === 'Active' ? 'text-emerald-400 border-emerald-950 bg-emerald-950/20' :
                          v.status === 'On Hold' ? 'text-amber-500 border-amber-950 bg-amber-950/20' :
                          'text-zinc-500 border-zinc-850 bg-zinc-900/40'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Contract Completed">Contract Completed</option>
                      </select>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(v.id, star)}
                            className="p-0.5 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                            title={`Rate ${star} Stars`}
                          >
                            <Star 
                              className={`w-3.5 h-3.5 ${
                                star <= v.rating ? 'fill-current text-amber-400' : 'text-zinc-700'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Supplied Items tagging */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">Capabilities / Supplied Supplies</span>
                    <div className="flex flex-wrap gap-1">
                      {v.suppliedItems.map((item, idx) => (
                        <span 
                          key={idx} 
                          className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info and Contract Manager */}
                  <div className="border-t border-zinc-850 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span className="text-[10px] uppercase font-semibold text-zinc-500">Contact Officer:</span>
                      <span className="font-bold text-zinc-300">{v.contactPerson}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 border-t border-zinc-850/50 pt-2.5">
                      <a href={`tel:${v.phone}`} className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                        <Phone className="w-3 h-3 text-zinc-600" /> {v.phone}
                      </a>
                      <a href={`mailto:${v.email}`} className="flex items-center gap-1 hover:text-zinc-300 transition-colors truncate max-w-[150px]">
                        <Mail className="w-3 h-3 text-zinc-600" /> {v.email}
                      </a>
                    </div>

                    {/* Active Contracts Counter */}
                    <div className="bg-[#141417] p-2 rounded border border-zinc-850/60 mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Active Linkages:
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleContractCountChange(v.id, -1)}
                          className="w-4 h-4 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-white font-mono">{v.activeContractsCount}</span>
                        <button 
                          onClick={() => handleContractCountChange(v.id, 1)}
                          className="w-4 h-4 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
        </div>
      </>
    ) : (
      /* TENDERS / BIDDING PROCUREMENT SUB-TAB */
      <div className="space-y-6 text-left">
        {/* Header summary card */}
        <div className="bg-[#111114] border border-zinc-800 p-5 rounded-lg flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-amber-400" /> Procurement Tender Bidding Desk
            </h4>
            <p className="text-[11px] text-zinc-450 mt-1">
              Publish material requests or subcontractor tenders, receive bids, and issue contracts instantly.
            </p>
          </div>
          <button
            onClick={() => setShowAddTenderForm(!showAddTenderForm)}
            className="px-3 py-1.5 bg-white text-zinc-950 font-bold text-xs rounded hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Launch Tender Request
          </button>
        </div>

        {/* Add Tender Form */}
        {showAddTenderForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTenderTitle || !newTenderBudget || !onAddTender) return;
              onAddTender({
                id: `TND-${Math.floor(100 + Math.random() * 900)}`,
                title: newTenderTitle,
                projectName: newTenderProject || (projects[0]?.name) || 'All Projects',
                description: newTenderDesc || 'No scope specified.',
                category: newTenderCategory,
                budget: Number(newTenderBudget),
                dueDate: newTenderDueDate || new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
                status: 'Open',
                bids: []
              });
              setNewTenderTitle('');
              setNewTenderDesc('');
              setNewTenderBudget('');
              setNewTenderDueDate('');
              setNewTenderProject('');
              setNewTenderCategory('Raw Materials');
              setShowAddTenderForm(false);
              onTriggerNotification('Tender Launched', `New tender Request "${newTenderTitle}" is live for bidding.`, 'success');
            }}
            className="bg-[#111114] border border-zinc-800 p-5 rounded-lg space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-zinc-400 font-semibold mb-1">Tender Title / Material Request Specification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply of 500 Metric Tons Portland Cement (Grade 53)"
                  value={newTenderTitle}
                  onChange={(e) => setNewTenderTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Target Site Project *</label>
                <select
                  required
                  value={newTenderProject}
                  onChange={(e) => setNewTenderProject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  <option value="">Select Target Construction Site</option>
                  <option value="All Sites">All Sites / Universal Procurement</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Material Classification Category</label>
                <select
                  value={newTenderCategory}
                  onChange={(e) => setNewTenderCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Structural">Structural Steel & Frame</option>
                  <option value="Finishing">Interior Finishing & Facades</option>
                  <option value="Plumbing">Plumbing Infrastructure</option>
                  <option value="Electrical">Grid & Electrical Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Target Ceiling Budget ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  value={newTenderBudget}
                  onChange={(e) => setNewTenderBudget(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Bidding Submission Deadline</label>
                <input
                  type="date"
                  value={newTenderDueDate}
                  onChange={(e) => setNewTenderDueDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 font-semibold mb-1">Detailed Requirements and Material Constraints</label>
                <textarea
                  rows={3}
                  placeholder="Specify standards (e.g., ISO certifications, delivery timeframe, compliance bonds)..."
                  value={newTenderDesc}
                  onChange={(e) => setNewTenderDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowAddTenderForm(false)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-white text-zinc-950 font-bold rounded hover:bg-zinc-200 cursor-pointer"
              >
                Publish Tender
              </button>
            </div>
          </form>
        )}

        {/* Tenders Registry */}
        <div className="grid grid-cols-1 gap-6">
          {tenders.length === 0 ? (
            <div className="p-12 border border-zinc-800 bg-[#111114] rounded-lg text-center space-y-2">
              <Gavel className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">No procurement tenders are currently active in the marketplace.</p>
            </div>
          ) : (
            tenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-[#111114] border border-zinc-800 rounded-lg p-5 space-y-5"
              >
                {/* Tender Header info */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-semibold">
                        {tender.id}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider ${
                        tender.status === 'Open'
                          ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400 animate-pulse'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        Tender {tender.status}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-1.5">{tender.title}</h5>
                    <p className="text-xs text-zinc-450 leading-relaxed max-w-2xl">{tender.description}</p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Ceiling Budget Allocation</span>
                    <span className="text-base font-bold text-white">${tender.budget.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">Deadline: {tender.dueDate}</span>
                  </div>
                </div>

                {/* Submit Bid Drawer Toggle Button */}
                {tender.status === 'Open' && (
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Do you represent a partner vendor? Place an official quotation bid.</span>
                    <button
                      onClick={() => setShowAddBidId(showAddBidId === tender.id ? null : tender.id)}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-semibold rounded cursor-pointer"
                    >
                      {showAddBidId === tender.id ? 'Cancel Quote' : 'Place Tender Bid'}
                    </button>
                  </div>
                )}

                {/* Bid Quote Placement Form */}
                {showAddBidId === tender.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newBidVendorName || !newBidAmount || !onAddBid) return;
                      const matchedVendor = vendors.find(v => v.name === newBidVendorName);
                      onAddBid(tender.id, {
                        id: `BID-${Math.floor(1000 + Math.random() * 9000)}`,
                        vendorId: matchedVendor?.id || 'VND-000',
                        vendorName: newBidVendorName,
                        amount: Number(newBidAmount),
                        deliveryDays: Number(newBidDeliveryDays || 15),
                        proposal: newBidProposal || 'Detailed supply list submitted.',
                        status: 'Pending',
                        submittedAt: new Date().toISOString().split('T')[0]
                      });
                      setNewBidVendorName('');
                      setNewBidAmount('');
                      setNewBidDeliveryDays('');
                      setNewBidProposal('');
                      setShowAddBidId(null);
                      onTriggerNotification('Quotation Submitted', 'Your procurement bid was received successfully.', 'success');
                    }}
                    className="bg-zinc-950/60 p-4 border border-zinc-850 rounded space-y-3.5 text-xs text-left"
                  >
                    <h6 className="text-[10px] font-bold text-white uppercase tracking-wider">Place Official Tender Bid Quotation</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Quotated Vendor Name *</label>
                        <select
                          value={newBidVendorName}
                          onChange={(e) => setNewBidVendorName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                          required
                        >
                          <option value="">Select Partner Vendor</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Contract Sum Quotation ($) *</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 42000"
                          value={newBidAmount}
                          onChange={(e) => setNewBidAmount(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Execution Duration (Days)</label>
                        <input
                          type="number"
                          placeholder="e.g. 30"
                          value={newBidDeliveryDays}
                          onChange={(e) => setNewBidDeliveryDays(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">Capabilities Proposal & Quality Statements</label>
                      <textarea
                        rows={2}
                        placeholder="Detail materials, transit schedules, warranties..."
                        value={newBidProposal}
                        onChange={(e) => setNewBidProposal(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBidId(null)}
                        className="px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-white text-zinc-950 font-bold rounded"
                      >
                        Submit Quotation
                      </button>
                    </div>
                  </form>
                )}

                {/* Submitted Bids evaluation space */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Submitted Quotas & Appraisals ({tender.bids?.length || 0})</span>
                  {(!tender.bids || tender.bids.length === 0) ? (
                    <p className="text-[11px] text-zinc-500 italic pl-1">No bids received yet for this active tender.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {tender.bids.map((bid) => (
                        <div
                          key={bid.id}
                          className={`p-3.5 border rounded text-xs flex flex-wrap justify-between items-center gap-3 ${
                            bid.status === 'Accepted'
                              ? 'bg-emerald-950/15 border-emerald-900/40 text-emerald-300'
                              : bid.status === 'Rejected'
                              ? 'bg-zinc-950/40 border-zinc-900/60 text-zinc-500'
                              : 'bg-zinc-900/30 border-zinc-850 hover:border-zinc-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{bid.vendorName}</span>
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                bid.status === 'Accepted'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : bid.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {bid.status} Quote
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 italic">"{bid.proposalDetails}"</p>
                            <p className="text-[10px] text-zinc-500 font-mono">Quoted Timeline: {bid.timelineDays} Days • ID: {bid.id}</p>
                          </div>

                          <div className="text-right flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-zinc-500 block">Quoted Price Sum</span>
                              <span className="font-bold text-white text-sm font-mono">${bid.amount.toLocaleString()}</span>
                            </div>

                            {tender.status === 'Open' && bid.status === 'Pending' && onUpdateTender && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    // Accept this bid! This updates state on App.tsx which handles persistence!
                                    onUpdateTender(tender.id, {
                                      status: 'Closed',
                                      bids: tender.bids.map(b =>
                                        b.id === bid.id
                                          ? { ...b, status: 'Accepted' }
                                          : { ...b, status: 'Rejected' }
                                      )
                                    });
                                    onTriggerNotification('Tender Awarded', `Contract awarded to ${bid.vendorName} for $${bid.amount.toLocaleString()}.`, 'success');
                                  }}
                                  className="px-2 py-1.5 bg-emerald-500 text-zinc-950 font-bold text-[10px] rounded hover:bg-emerald-400 cursor-pointer"
                                >
                                  Award Contract
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}
    </div>
  );
};

