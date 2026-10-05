/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Expense, Project } from '../types';
import { 
  DollarSign, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Trash2, 
  Briefcase,
  X 
} from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: Expense[];
  projects: Project[];
  onAddExpense: (expense: Expense) => void;
  onRemoveExpense: (id: string) => void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  projects,
  onAddExpense,
  onRemoveExpense,
  onApproveExpense,
  onRejectExpense,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [category, setCategory] = useState<Expense['category']>('Material');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState('');

  // Calculations
  const approvedTotal = expenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingTotal = expenses
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !projectName) return;

    const newExp: Expense = {
      id: `EXP-${Math.floor(400 + Math.random() * 100)}`,
      category,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description,
      projectName,
      status: 'Pending',
    };

    onAddExpense(newExp);
    setShowAddForm(false);

    // Reset Form
    setCategory('Material');
    setAmount('');
    setDescription('');
    setProjectName('');
    setDate('');
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const categories: Expense['category'][] = ['Material', 'Labor', 'Marketing', 'Equipment', 'Permits', 'Utilities'];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Approved Capital Outlays</span>
            <h3 className="text-2xl font-semibold text-white mt-1">${approvedTotal.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fully accounted in CapEx
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Awaiting Invoice Signoff</span>
            <h3 className="text-2xl font-semibold text-white mt-1">${pendingTotal.toLocaleString()}</h3>
            <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 animate-pulse" /> Pending project manager action
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Total Ledger Transactions</span>
            <h3 className="text-2xl font-semibold text-white mt-1">{expenses.length} Records</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Audit-ready historical statements</p>
          </div>
          <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-[#111114] p-4 rounded-lg border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none w-full sm:w-auto"
            >
              <option value="all">All Expense Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-zinc-800 px-3 py-2 rounded bg-zinc-900 text-zinc-300 focus:outline-none w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          id="btn-add-expense"
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer w-full md:w-auto animate-none"
        >
          <Plus className="w-4 h-4" /> Log Expense Invoice
        </button>
      </div>

      {/* Expense ledger listing table */}
      <div className="bg-[#111114] border border-zinc-800 rounded-lg overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-zinc-350">
            <thead className="bg-[#09090b] border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} id={`expense-row-${exp.id}`} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-zinc-400">{exp.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-400">{exp.date}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-100 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> {exp.projectName}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-zinc-300" title={exp.description}>
                    {exp.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded-full text-[10px] border border-zinc-800 font-medium">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-white whitespace-nowrap">
                    ${exp.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${
                      exp.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                      exp.status === 'Pending' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                      'bg-rose-950/40 text-rose-400 border-rose-900/40'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {exp.status === 'Pending' && (
                        <>
                          <button
                            id={`btn-approve-exp-${exp.id}`}
                            onClick={() => onApproveExpense(exp.id)}
                            className="p-1 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 rounded border border-emerald-900/50 cursor-pointer"
                            title="Approve Expense"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-reject-exp-${exp.id}`}
                            onClick={() => onRejectExpense(exp.id)}
                            className="p-1 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 rounded border border-rose-900/50 cursor-pointer"
                            title="Reject Expense"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      
                      <button
                        id={`btn-remove-exp-${exp.id}`}
                        onClick={() => onRemoveExpense(exp.id)}
                        className="p-1 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded border border-zinc-750 cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    No transactions found matching active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111114] rounded-lg shadow-xl border border-zinc-800 max-w-lg w-full overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#09090b] border-b border-zinc-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-zinc-450" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Log Corporate Outlay</h4>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Description of Charge *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Concrete mix delivery, Sector 4"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Charge Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Cost Outlay ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Associated Development Project *
                  </label>
                  <select
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs border border-zinc-800 p-2.5 rounded bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  />
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
                  Log Pending Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
