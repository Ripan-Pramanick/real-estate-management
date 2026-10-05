/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Material, Project, Vendor } from '../types';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  MapPin, 
  Truck, 
  X, 
  Search, 
  RotateCcw 
} from 'lucide-react';

interface MaterialManagerProps {
  materials: Material[];
  projects: Project[];
  vendors: Vendor[];
  onAddMaterial: (m: Material) => void;
  onRemoveMaterial: (id: string) => void;
  onUpdateMaterial: (id: string, fields: Partial<Material>) => void;
  onTriggerNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const MaterialManager: React.FC<MaterialManagerProps> = ({
  materials,
  projects,
  vendors,
  onAddMaterial,
  onRemoveMaterial,
  onUpdateMaterial,
  onTriggerNotification,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Material['category']>('Raw Materials');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Bags');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [location, setLocation] = useState('');

  // Quick consumption/restock inline state
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'use' | 'restock' | null>(null);
  const [actionQty, setActionQty] = useState('');

  // Calculations
  const totalValue = materials.reduce((sum, m) => sum + (m.stock * m.unitPrice), 0);
  const alertCount = materials.filter(m => m.stock <= m.minStockLevel).length;
  const totalTypes = materials.length;

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stock || !minStockLevel || !unitPrice || !supplierName || !location) return;

    const newMaterial: Material = {
      id: `MAT-${Math.floor(200 + Math.random() * 800)}`,
      name,
      category,
      stock: Number(stock),
      unit,
      minStockLevel: Number(minStockLevel),
      unitPrice: Number(unitPrice),
      supplierName,
      lastUpdated: new Date().toISOString(),
      location,
    };

    onAddMaterial(newMaterial);
    
    // Check if added material is immediately low on stock
    if (newMaterial.stock <= newMaterial.minStockLevel) {
      onTriggerNotification(
        `Low Stock Alert: ${newMaterial.name}`,
        `New material "${newMaterial.name}" registered with ${newMaterial.stock} ${newMaterial.unit}, which is below minimum level (${newMaterial.minStockLevel}).`,
        'warning'
      );
    } else {
      onTriggerNotification(
        `Material Registered`,
        `Successfully logged ${newMaterial.stock} ${newMaterial.unit} of "${newMaterial.name}" on site.`,
        'success'
      );
    }

    setShowAddForm(false);
    // Reset fields
    setName('');
    setCategory('Raw Materials');
    setStock('');
    setUnit('Bags');
    setMinStockLevel('');
    setUnitPrice('');
    setSupplierName('');
    setLocation('');
  };

  const handleExecuteAction = (m: Material) => {
    const qty = Number(actionQty);
    if (!qty || qty <= 0) return;

    if (actionType === 'use') {
      if (qty > m.stock) {
        alert(`Cannot consume ${qty} ${m.unit} of ${m.name}. Only ${m.stock} ${m.unit} in stock.`);
        return;
      }
      const newStock = m.stock - qty;
      onUpdateMaterial(m.id, { 
        stock: newStock,
        lastUpdated: new Date().toISOString()
      });

      onTriggerNotification(
        'Material Dispatched',
        `Dispatched ${qty} ${m.unit} of "${m.name}" for work at ${m.location}.`,
        'info'
      );

      // Trigger warning if it falls below threshold
      if (newStock <= m.minStockLevel) {
        onTriggerNotification(
          `Critical Low Stock: ${m.name}`,
          `Stock of "${m.name}" at ${m.location} has dropped to ${newStock} ${m.unit} (Minimum: ${m.minStockLevel}).`,
          'warning'
        );
      }
    } else if (actionType === 'restock') {
      const newStock = m.stock + qty;
      onUpdateMaterial(m.id, { 
        stock: newStock,
        lastUpdated: new Date().toISOString()
      });

      onTriggerNotification(
        'Inventory Replenished',
        `Received and stacked ${qty} ${m.unit} of "${m.name}". New Stock: ${newStock} ${m.unit}.`,
        'success'
      );
    }

    setActiveActionId(null);
    setActionType(null);
    setActionQty('');
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    const matchesSite = filterSite === 'all' || m.location === filterSite;
    
    let matchesStock = true;
    if (filterStockStatus === 'low') {
      matchesStock = m.stock <= m.minStockLevel;
    } else if (filterStockStatus === 'normal') {
      matchesStock = m.stock > m.minStockLevel;
    }

    return matchesSearch && matchesCategory && matchesSite && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Inventory Value</span>
            <h3 className="text-2xl font-mono font-bold text-white mt-1">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Asset valuation of building supplies</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-900 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Low Stock Alerts</span>
            <h3 className={`text-2xl font-mono font-bold mt-1 ${alertCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {alertCount} / {totalTypes}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Items requiring urgent supply order</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            alertCount > 0 ? 'bg-amber-950/40 border-amber-900 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Unique Materials</span>
            <h3 className="text-2xl font-mono font-bold text-white mt-1">
              {totalTypes}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Categorized across construction hubs</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Operations Block */}
      <div className="bg-[#111114] border border-zinc-800 rounded-lg overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 bg-[#141417] border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search materials or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-800 rounded-lg bg-zinc-950 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>
            
            {/* Quick Reset filters */}
            {(searchQuery || filterCategory !== 'all' || filterSite !== 'all' || filterStockStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterSite('all');
                  setFilterStockStatus('all');
                }}
                className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                title="Clear Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Materials Receipt</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="p-3 bg-zinc-950/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Filter Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs border border-zinc-800 p-1.5 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Structural">Structural</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Finishing">Finishing</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Filter Site/Location</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full text-xs border border-zinc-800 p-1.5 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Stock Status</label>
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="w-full text-xs border border-zinc-800 p-1.5 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All stock levels</option>
              <option value="low">🚨 Under-stocked (Below threshold)</option>
              <option value="normal">✅ Normal levels</option>
            </select>
          </div>
        </div>

        {/* Receipt Form overlay */}
        {showAddForm && (
          <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-zinc-400" /> Log New Materials Inflow
              </h4>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Portland Cement Grade 53"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Structural">Structural</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Finishing">Finishing</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Unit of Measure *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bags, Tons, m³"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Initial Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Min Stock Safety Alert Level *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 100"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Unit Purchase Price ($) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 12.50"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Project Site Location *</label>
                <select
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value="">-- Choose Construction Site --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Linked Contractor/Supplier *</label>
                <select
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value="">-- Choose Registered Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.name}>{v.name} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all uppercase tracking-wider font-mono"
                >
                  Confirm Material Log
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Materials Table/Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Boxes className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No materials fit the search criteria.</p>
            <p className="text-xs mt-1">Try modifying your filters or registers above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-[#151518]/60">
                  <th className="p-4">Material Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Project Site</th>
                  <th className="p-4 text-center">Current Stock</th>
                  <th className="p-4 text-right">Value/Cost</th>
                  <th className="p-4">Contractor / Vendor</th>
                  <th className="p-4 text-right">Inventory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredMaterials.map((m) => {
                  const isUnderstocked = m.stock <= m.minStockLevel;
                  const ratio = Math.max(0, Math.min(100, (m.stock / (m.minStockLevel * 2)) * 100));

                  return (
                    <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors text-xs">
                      {/* Name and ID */}
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded ${isUnderstocked ? 'bg-amber-950/30 border border-amber-900/50 text-amber-500' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'}`}>
                            <Boxes className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-200 block">{m.name}</span>
                            <span className="font-mono text-[9px] text-zinc-500 block">{m.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase bg-zinc-950 border-zinc-800 text-zinc-400">
                          {m.category}
                        </span>
                      </td>

                      {/* Location Site */}
                      <td className="p-4 text-zinc-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          {m.location}
                        </span>
                      </td>

                      {/* Current Stock with Progress bar */}
                      <td className="p-4">
                        <div className="space-y-1.5 max-w-[120px] mx-auto">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`font-mono font-bold ${isUnderstocked ? 'text-amber-500' : 'text-zinc-200'}`}>
                              {m.stock} {m.unit}
                            </span>
                            <span className="text-zinc-500 font-mono text-[9px]">min: {m.minStockLevel}</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isUnderstocked ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`} 
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                          {isUnderstocked && (
                            <span className="text-[9px] bg-amber-950/50 border border-amber-900/30 text-amber-500 px-1.5 py-0.5 rounded font-mono uppercase block text-center">
                              ⚠️ LOW STOCK ALERT
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="p-4 text-right">
                        <span className="font-bold font-mono text-zinc-200 block">${m.unitPrice} <span className="text-[10px] text-zinc-500">/{m.unit}</span></span>
                        <span className="text-[9px] font-mono text-zinc-500 block">val: ${(m.stock * m.unitPrice).toLocaleString()}</span>
                      </td>

                      {/* Supplier Vendor */}
                      <td className="p-4 text-zinc-400">
                        <span className="flex items-center gap-1 text-xs">
                          <Truck className="w-3 h-3 text-zinc-500" />
                          {m.supplierName}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {activeActionId === m.id ? (
                          <div className="flex items-center justify-end gap-1.5 animate-fade-in">
                            <input
                              type="number"
                              min="1"
                              max={actionType === 'use' ? m.stock : undefined}
                              placeholder="Qty"
                              value={actionQty}
                              onChange={(e) => setActionQty(e.target.value)}
                              className="w-16 p-1 border border-zinc-700 rounded bg-zinc-950 text-zinc-100 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleExecuteAction(m)}
                              className="px-2 py-1 text-white bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-[10px] rounded cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setActiveActionId(null);
                                setActionType(null);
                                setActionQty('');
                              }}
                              className="p-1 border border-zinc-850 hover:bg-zinc-800 text-zinc-500 rounded cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveActionId(m.id);
                                setActionType('use');
                              }}
                              disabled={m.stock === 0}
                              className={`px-2 py-1 border border-zinc-800 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                m.stock === 0 ? 'text-zinc-600 border-zinc-900 bg-zinc-950' : 'text-zinc-400 hover:bg-[#151518] hover:text-white'
                              }`}
                              title="Log material usage on-site"
                            >
                              <TrendingDown className="w-3 h-3 inline mr-1 text-zinc-500" /> Dispatch
                            </button>
                            <button
                              onClick={() => {
                                setActiveActionId(m.id);
                                setActionType('restock');
                              }}
                              className="px-2 py-1 border border-zinc-800 rounded text-[10px] font-semibold text-zinc-400 hover:bg-[#151518] hover:text-white transition-all cursor-pointer"
                              title="Receive material stock"
                            >
                              <TrendingUp className="w-3 h-3 inline mr-1 text-zinc-500" /> Restock
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Decommission material registry "${m.name}"?`)) {
                                  onRemoveMaterial(m.id);
                                  onTriggerNotification("Material Deregistered", `Deregistered inventory track for "${m.name}".`, 'alert');
                                }
                              }}
                              className="p-1 text-zinc-600 hover:text-rose-500 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-950/30 transition-all cursor-pointer"
                              title="Deregister tracker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
