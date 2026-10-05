/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset, Project } from '../types';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Activity, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Briefcase,
  AlertTriangle,
  CheckCircle,
  X 
} from 'lucide-react';

interface AssetManagerProps {
  assets: Asset[];
  projects: Project[];
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (id: string) => void;
  onUpdateAsset: (id: string, updatedFields: Partial<Asset>) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  assets,
  projects,
  onAddAsset,
  onRemoveAsset,
  onUpdateAsset,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<Asset['type']>('Machinery');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [assignedProject, setAssignedProject] = useState('');
  const [status, setStatus] = useState<Asset['status']>('Operational');

  // Calculations
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const operationalCount = assets.filter(a => a.status === 'Operational').length;
  const operationalRate = assets.length > 0 ? Math.round((operationalCount / assets.length) * 100) : 0;
  const repairCount = assets.filter(a => a.status === 'Needs Repair' || a.status === 'Under Maintenance').length;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value || !location) return;

    const newAsset: Asset = {
      id: `AST-${Math.floor(800 + Math.random() * 200)}`,
      name,
      type,
      status,
      value: Number(value),
      purchaseDate: new Date().toISOString().split('T')[0],
      location,
      lastServiceDate: new Date().toISOString().split('T')[0],
      assignedProject: assignedProject || undefined
    };

    onAddAsset(newAsset);
    setShowAddForm(false);

    // Reset Form
    setName('');
    setType('Machinery');
    setValue('');
    setLocation('');
    setAssignedProject('');
    setStatus('Operational');
  };

  const handleStatusChange = (id: string, newStatus: Asset['status']) => {
    onUpdateAsset(id, { 
      status: newStatus,
      lastServiceDate: newStatus === 'Operational' ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Total Machinery Valuation</span>
            <h3 className="text-2xl font-semibold text-white mt-1">${totalValue.toLocaleString()}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Capitalized physical assets</p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Fleet Operational Rate</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{operationalRate}%</h3>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> {operationalCount} active of {assets.length}
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Flagged Under Repair</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{repairCount} Units</h3>
            <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> Scheduled logistics pending
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Asset Types</option>
            <option value="Machinery">Machinery</option>
            <option value="Vehicle">Vehicles</option>
            <option value="IT Equipment">IT Equipment</option>
            <option value="Construction Tool">Construction Tools</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <button
          id="btn-add-asset"
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Heavy Asset
        </button>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <div 
            key={asset.id} 
            id={`asset-card-${asset.id}`}
            className="bg-[#111114] border border-zinc-800 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col justify-between text-left space-y-4"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                    {asset.id}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{asset.name}</h4>
                  <p className="text-xs text-zinc-400 font-medium">{asset.type}</p>
                </div>

                <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold border ${
                  asset.status === 'Operational' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                  asset.status === 'Under Maintenance' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                  asset.status === 'Needs Repair' ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' :
                  'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}>
                  {asset.status}
                </span>
              </div>

              {/* Asset Specific details */}
              <div className="mt-4 space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{asset.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Purchased: {asset.purchaseDate}</span>
                </div>
                {asset.assignedProject && (
                  <div className="flex items-center gap-2 mt-1 bg-zinc-900/80 text-zinc-300 px-2 py-1 rounded text-[11px] border border-zinc-800">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate">Active Site: {asset.assignedProject}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Asset Actions & Value */}
            <div className="pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Valuation</span>
                <span className="font-bold text-white">${asset.value.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={asset.status}
                  onChange={(e) => handleStatusChange(asset.id, e.target.value as any)}
                  className="text-xs bg-zinc-900 border border-zinc-800 rounded p-1 text-zinc-300"
                >
                  <option value="Operational">Operational</option>
                  <option value="Under Maintenance">Maintenance</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Retired">Retired</option>
                </select>

                <button
                  id={`btn-remove-asset-${asset.id}`}
                  onClick={() => onRemoveAsset(asset.id)}
                  className="p-1.5 bg-rose-950/40 text-rose-400 rounded border border-rose-900/40 hover:bg-rose-900/60 transition-colors cursor-pointer"
                  title="Decommission Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full bg-[#111114] p-12 rounded-lg border border-zinc-800 text-center">
            <Wrench className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No assets match the selected filters.</p>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] rounded-lg shadow-xl border border-zinc-800 max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#09090b] border-b border-zinc-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-zinc-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Log Asset Register</h4>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Equipment / Vehicle Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Caterpillar Excavator 320"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Asset Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Machinery">Heavy Machinery</option>
                    <option value="Vehicle">Site Vehicles</option>
                    <option value="IT Equipment">IT Hardware & Servers</option>
                    <option value="Construction Tool">Surveying/Power Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Valuation / Purchase Cost ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 125000"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Current Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 4 Construction Site or Depot A"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Site Assignment (Optional)
                  </label>
                  <select
                    value={assignedProject}
                    onChange={(e) => setAssignedProject(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="">Central Depot (No Project)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Needs Repair">Needs Repair</option>
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
                  Commission Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
