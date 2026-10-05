/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Apartment, Project } from '../types';
import { 
  Building2, 
  Plus, 
  Trash2, 
  MapPin, 
  User, 
  DollarSign, 
  Calendar, 
  Key, 
  CheckCircle, 
  X,
  FileText,
  DoorOpen,
  Wrench,
  Clock,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Hourglass,
  ShieldAlert
} from 'lucide-react';
import { MaintenanceTicket } from '../types';

interface PropertyManagerProps {
  apartments: Apartment[];
  projects: Project[];
  onAddApartment: (apt: Apartment) => void;
  onRemoveApartment: (id: string) => void;
  onUpdateApartment: (id: string, updatedFields: Partial<Apartment>) => void;
  isBasicPlan?: boolean;
  maintenanceTickets?: MaintenanceTicket[];
  onUpdateTicket?: (id: string, updatedFields: Partial<MaintenanceTicket>) => void;
}

export const PropertyManager: React.FC<PropertyManagerProps> = ({
  apartments,
  projects,
  onAddApartment,
  onRemoveApartment,
  onUpdateApartment,
  isBasicPlan = false,
  maintenanceTickets = [],
  onUpdateTicket,
}) => {
  const [activeTab, setActiveTab] = useState<'units' | 'tickets'>('units');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLeaseFormId, setShowLeaseFormId] = useState<string | null>(null);
  const [showSellFormId, setShowSellFormId] = useState<string | null>(null);
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  // Maintenance Ticket Specific States
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>('all');
  const [ticketFilterPriority, setTicketFilterPriority] = useState<string>('all');
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Add Apartment Form States
  const [buildingName, setBuildingName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [type, setType] = useState<string>('2BHK');
  const [customType, setCustomType] = useState('');
  const [price, setPrice] = useState('');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [status, setStatus] = useState<Apartment['status']>('Available');

  // Lease Agreement Form States
  const [leaseTenant, setLeaseTenant] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  // Sell Property Form States
  const [sellBuyer, setSellBuyer] = useState('');

  // Calculations
  const totalCount = apartments.length;
  const occupiedCount = apartments.filter(a => a.status === 'Rented' || a.status === 'Sold').length;
  const occupancyRate = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;
  const totalMonthlyRent = apartments
    .filter(a => a.status === 'Rented' && a.monthlyRent)
    .reduce((sum, a) => sum + (a.monthlyRent || 0), 0);

  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingName || !unitNumber || !price || !areaSqFt) return;

    const resolvedType = type === 'custom' ? (customType.trim() || 'Custom Space') : type;

    const newApt: Apartment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      buildingName,
      unitNumber,
      type: resolvedType,
      status,
      price: Number(price),
      areaSqFt: Number(areaSqFt),
    };

    onAddApartment(newApt);
    setShowAddForm(false);

    // Reset Form
    setBuildingName('');
    setUnitNumber('');
    setType('2BHK');
    setCustomType('');
    setPrice('');
    setAreaSqFt('');
    setStatus('Available');
  };

  const handleCreateLease = (e: React.FormEvent, aptId: string) => {
    e.preventDefault();
    if (!leaseTenant || !monthlyRent) return;

    onUpdateApartment(aptId, {
      status: 'Rented',
      tenantName: leaseTenant,
      leaseStart: leaseStart || new Date().toISOString().split('T')[0],
      leaseEnd: leaseEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyRent: Number(monthlyRent)
    });

    setShowLeaseFormId(null);
    setLeaseTenant('');
    setLeaseStart('');
    setLeaseEnd('');
    setMonthlyRent('');
  };

  const handleVacateUnit = (aptId: string) => {
    onUpdateApartment(aptId, {
      status: 'Available',
      tenantName: undefined,
      leaseStart: undefined,
      leaseEnd: undefined,
      monthlyRent: undefined
    });
  };

  const handleMarkAsSold = (aptId: string, buyerName: string) => {
    onUpdateApartment(aptId, {
      status: 'Sold',
      tenantName: buyerName || 'Private Owner',
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: undefined,
      monthlyRent: undefined
    });
  };

  const filteredApartments = apartments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesBuilding = filterBuilding === 'all' || apt.buildingName === filterBuilding;
    return matchesStatus && matchesBuilding;
  });

  // Unique building list for dropdown filter
  const uniqueBuildings = Array.from(new Set(apartments.map(a => a.buildingName)));

  return (
    <div className="space-y-6">
      {/* Sub Tab Switcher */}
      <div className="flex border-b border-zinc-800 gap-4">
        <button
          onClick={() => setActiveTab('units')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'units'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Building2 className="w-4 h-4" /> Units Registry ({apartments.length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tickets'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Wrench className="w-4 h-4" /> Tenant Support Tickets ({maintenanceTickets.length})
          {maintenanceTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length > 0 && (
            <span className="bg-cyan-500 text-zinc-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
              {maintenanceTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'units' ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Total Built Real Estate</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{totalCount} Units</h3>
            <p className="text-[10px] text-zinc-400 mt-1">{apartments.filter(a => a.status === 'Available').length} units available for lease/sale</p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Leasing Occupancy Rate</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{occupancyRate}%</h3>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> {occupiedCount} sold or rented
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <Key className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Active Monthly Rent Cashflow</span>
            <h3 className="text-2xl font-semibold text-white mt-1">${totalMonthlyRent.toLocaleString()}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">From rented portfolios</p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Sold">Sold</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Developments</option>
            {uniqueBuildings.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <button
          id="btn-add-apartment"
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Finished Apartment / Space
        </button>
      </div>

      {/* Apartment Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApartments.map(apt => (
          <div 
            key={apt.id} 
            id={`apt-card-${apt.id}`}
            className="bg-[#111114] border border-zinc-800 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col justify-between text-left space-y-4"
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

                <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold border ${
                  apt.status === 'Available' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                  apt.status === 'Rented' ? 'bg-zinc-800 text-zinc-300 border-zinc-700/80' :
                  apt.status === 'Sold' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-900/40' :
                  'bg-rose-950/40 text-rose-400 border-rose-900/40'
                }`}>
                  {apt.status}
                </span>
              </div>

              {/* Space specific details */}
              <div className="mt-4 space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-850 p-2 rounded">
                  <span className="text-zinc-500">Total Area:</span>
                  <span className="font-semibold text-white">{apt.areaSqFt.toLocaleString()} Sq.Ft</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-850 p-2 rounded">
                  <span className="text-zinc-500">Purchase Value:</span>
                  <span className="font-bold text-white">${apt.price.toLocaleString()}</span>
                </div>

                {/* Lease details if rented */}
                {apt.status === 'Rented' && (
                  <div className="bg-[#09090b] border border-zinc-800/80 p-2.5 rounded-lg space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-white">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Tenant: {apt.tenantName}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                      <span>Rent: ${apt.monthlyRent?.toLocaleString()}/mo</span>
                      <span>Ends: {apt.leaseEnd}</span>
                    </div>
                  </div>
                )}

                {/* Owner details if sold */}
                {apt.status === 'Sold' && (
                  <div className="bg-[#09090b] border border-zinc-800/80 p-2.5 rounded-lg space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-white">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Owner: {apt.tenantName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Lease operations */}
            <div className="pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono">Operations</span>

              <div className="flex gap-1.5">
                {apt.status === 'Available' && (
                  <>
                    <button
                      onClick={() => {
                        setShowLeaseFormId(showLeaseFormId === apt.id ? null : apt.id);
                        setShowSellFormId(null);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-800 text-white border border-zinc-700 rounded-lg hover:bg-zinc-700 text-xs font-semibold cursor-pointer"
                    >
                      Draft Lease
                    </button>
                    <button
                      onClick={() => {
                        setShowSellFormId(showSellFormId === apt.id ? null : apt.id);
                        setShowLeaseFormId(null);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
                    >
                      Sell Unit
                    </button>
                  </>
                )}

                {apt.status === 'Rented' && (
                  <button
                    onClick={() => handleVacateUnit(apt.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/40 text-rose-400 border border-rose-900/40 rounded-lg hover:bg-rose-900/60 text-xs font-semibold cursor-pointer"
                  >
                    <DoorOpen className="w-3.5 h-3.5" /> Vacate Space
                  </button>
                )}

                {apt.status === 'Sold' && (
                  <span className="text-[10px] text-zinc-500 italic">Fully Commissioned</span>
                )}

                <button
                  id={`btn-remove-apt-${apt.id}`}
                  onClick={() => onRemoveApartment(apt.id)}
                  className="p-1.5 bg-rose-950/40 text-rose-400 rounded border border-rose-900/40 hover:bg-rose-900/60 cursor-pointer"
                  title="Remove Real Estate Unit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inline Lease Agreement Form */}
            {showLeaseFormId === apt.id && (
              <div className="border border-zinc-800 p-3.5 rounded bg-zinc-900/50 text-left space-y-3 mt-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" /> New Lease Draft
                  </h5>
                  <button 
                    onClick={() => setShowLeaseFormId(null)} 
                    className="text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={(e) => handleCreateLease(e, apt.id)} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-zinc-400">Tenant / Lessee Name *</label>
                    <input
                      type="text"
                      required
                      value={leaseTenant}
                      onChange={(e) => setLeaseTenant(e.target.value)}
                      placeholder="e.g. Acme Legal LLP"
                      className="w-full text-xs border border-zinc-800 p-1.5 rounded focus:outline-none bg-zinc-900 text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400">Monthly Rent ($) *</label>
                      <input
                        type="number"
                        required
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        placeholder="e.g. 2400"
                        className="w-full text-xs border border-zinc-800 p-1.5 rounded focus:outline-none bg-zinc-900 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400">Lease Ends</label>
                      <input
                        type="date"
                        value={leaseEnd}
                        onChange={(e) => setLeaseEnd(e.target.value)}
                        className="w-full text-xs border border-zinc-800 p-1.5 rounded focus:outline-none bg-zinc-900 text-zinc-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded cursor-pointer transition-colors"
                  >
                    Execute Agreement
                  </button>
                </form>
              </div>
            )}

            {/* Inline Ownership Transfer Form */}
            {showSellFormId === apt.id && (
              <div className="border border-zinc-800 p-3.5 rounded bg-zinc-900/50 text-left space-y-3 mt-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" /> Ownership Transfer
                  </h5>
                  <button 
                    onClick={() => setShowSellFormId(null)} 
                    className="text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (sellBuyer.trim()) {
                      handleMarkAsSold(apt.id, sellBuyer.trim());
                      setShowSellFormId(null);
                      setSellBuyer('');
                    }
                  }} 
                  className="space-y-2.5"
                >
                  <div>
                    <label className="block text-[10px] text-zinc-400">Purchaser / Buyer Name *</label>
                    <input
                      type="text"
                      required
                      value={sellBuyer}
                      onChange={(e) => setSellBuyer(e.target.value)}
                      placeholder="e.g. David Miller"
                      className="w-full text-xs border border-zinc-800 p-1.5 rounded focus:outline-none bg-zinc-900 text-zinc-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded cursor-pointer transition-colors font-mono tracking-wider uppercase"
                  >
                    Deed Registration
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}

        {filteredApartments.length === 0 && (
          <div className="col-span-full bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center">
            <Building2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No finished spaces match the selected filters.</p>
          </div>
        )}
      </div>

      {/* Add Apartment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] rounded-lg shadow-xl border border-zinc-800 max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#09090b] border-b border-zinc-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Log Finished Property</h4>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddApartment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Building / Development Project *
                  </label>
                  <select
                    required
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="">Select Completed Structure</option>
                    <option value="Grand Horizon Towers">Grand Horizon Towers</option>
                    <option value="Apex Commercial Plaza">Apex Commercial Plaza</option>
                    <option value="Lakeside Heights">Lakeside Heights</option>
                    <option value="Metro Link Commercial Arc">Metro Link Commercial Arc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Unit or Space Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="e.g. Penthouse B-1"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div className={type === 'custom' ? "col-span-1" : "col-span-2"}>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Unit Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Studio">Studio Apartment</option>
                    <option value="1BHK">1BHK Apartment</option>
                    <option value="2BHK">2BHK Apartment</option>
                    <option value="3BHK">3BHK Apartment</option>
                    <option value="Penthouse">Premium Penthouse</option>
                    <option value="Commercial">Commercial/Retail Space</option>
                    <option value="custom">Custom Property Type...</option>
                  </select>
                </div>

                {type === 'custom' && (
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Custom Type Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="e.g. Warehouse, Office Suite"
                      className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Total Area (Sq.Ft) *
                  </label>
                  <input
                    type="number"
                    required
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    placeholder="e.g. 1450"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Market Price Value ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 480000"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
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
                  Register Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
    ) : (
      /* SUPPORT TICKETS WORKSPACE */
      <div className="space-y-6 text-left">
        {/* Ticket Filters */}
        <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Filters:</span>
            </div>

            <select
              value={ticketFilterStatus}
              onChange={(e) => setTicketFilterStatus(e.target.value)}
              className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={ticketFilterPriority}
              onChange={(e) => setTicketFilterPriority(e.target.value)}
              className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="p-2 rounded bg-cyan-950/20 border border-cyan-900/50 text-[11px] text-cyan-400 flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" /> Fast-Track Response Dispatcher Activated
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Tickets */}
          <div className="lg:col-span-2 space-y-4">
            {maintenanceTickets.filter(t => {
              const matchesStatus = ticketFilterStatus === 'all' || t.status === ticketFilterStatus;
              const matchesPriority = ticketFilterPriority === 'all' || t.priority === ticketFilterPriority;
              return matchesStatus && matchesPriority;
            }).length === 0 ? (
              <div className="bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center space-y-2">
                <Wrench className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-sm">No maintenance tickets matching the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceTickets
                  .filter(t => {
                    const matchesStatus = ticketFilterStatus === 'all' || t.status === ticketFilterStatus;
                    const matchesPriority = ticketFilterPriority === 'all' || t.priority === ticketFilterPriority;
                    return matchesStatus && matchesPriority;
                  })
                  .map((ticket) => {
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
                              <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-semibold">
                                {ticket.id}
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider ${
                                ticket.priority === 'Emergency'
                                  ? 'bg-rose-950/40 border-rose-900/50 text-rose-400 animate-pulse'
                                  : ticket.priority === 'High'
                                  ? 'bg-amber-950/40 border-amber-900/50 text-amber-400'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-350'
                              }`}>
                                {ticket.priority} Urgency
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
                            <p className="text-xs text-zinc-400 font-medium">
                              {ticket.buildingName} • Unit {ticket.unitNumber} (Tenant: <span className="text-zinc-300 font-semibold">{ticket.tenantName}</span>)
                            </p>
                          </div>

                          {/* Countdown timers */}
                          <div className="text-right text-xs">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Response Window SLA</span>
                            {ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 justify-end">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Met SLA
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
                            <span className="text-zinc-500">Submitted:</span>{' '}
                            <span className="font-semibold text-zinc-300">
                              {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                              {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Assigned Tech:</span>{' '}
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

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              setEditingTicketId(ticket.id);
                              setAssignedStaff(ticket.assignedStaff || '');
                              setResolutionNotes(ticket.resolutionNotes || '');
                            }}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-[11px] rounded transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Dispatch & Dispatch Updates
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Sidebar editor */}
          <div className="space-y-4">
            {editingTicketId ? (
              (() => {
                const ticket = maintenanceTickets.find(t => t.id === editingTicketId);
                if (!ticket) return null;

                return (
                  <div className="bg-[#111114] border border-zinc-800 p-5 rounded-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Update Ticket {ticket.id}
                      </h4>
                      <button
                        onClick={() => setEditingTicketId(null)}
                        className="text-xs text-zinc-500 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs text-left">
                      <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-850">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Issue Description</span>
                        <p className="text-zinc-300 mt-1 italic text-[11px] font-medium">"{ticket.title}"</p>
                        <p className="text-zinc-400 text-[10px] mt-0.5">Building: {ticket.buildingName} • Unit {ticket.unitNumber}</p>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Update Status</label>
                        <select
                          value={ticket.status}
                          onChange={(e) => {
                            if (onUpdateTicket) {
                              onUpdateTicket(ticket.id, { status: e.target.value as any });
                            }
                          }}
                          className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Assign Technician / Dispatcher</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe (HVAC Engineer)"
                          value={assignedStaff}
                          onChange={(e) => setAssignedStaff(e.target.value)}
                          className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Resolution & Diagnostic Notes</label>
                        <textarea
                          rows={4}
                          placeholder="Enter details about repair status or resolved notes..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="w-full border border-zinc-800 bg-zinc-900 text-zinc-100 p-2 rounded focus:outline-none focus:border-zinc-700"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (onUpdateTicket) {
                            onUpdateTicket(ticket.id, {
                              assignedStaff,
                              resolutionNotes,
                              // If resolved, make sure status is set as such
                              status: resolutionNotes && ticket.status === 'Open' ? 'Resolved' : ticket.status
                            });
                            setEditingTicketId(null);
                          }
                        }}
                        className="w-full py-2 bg-white text-zinc-950 font-bold rounded hover:bg-zinc-250 transition-colors cursor-pointer text-xs uppercase tracking-wider"
                      >
                        Save Dispatch Update
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-[#111114] border border-zinc-800 p-5 rounded-lg text-center space-y-3.5">
                <Sliders className="w-8 h-8 text-zinc-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Operations Control Panel</h4>
                  <p className="text-[11px] text-zinc-400">
                    Select a ticket from the registry list to assign field engineers, register resolution statements, and update the live tenant countdown timers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
