/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bill, Apartment } from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Mail, 
  X, 
  Search, 
  Home, 
  Download, 
  Receipt,
  User,
  CreditCard,
  Building
} from 'lucide-react';

interface BillingManagerProps {
  bills: Bill[];
  apartments: Apartment[];
  onAddBill: (b: Bill) => void;
  onRemoveBill: (id: string) => void;
  onUpdateBill: (id: string, fields: Partial<Bill>) => void;
  onTriggerNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  bills,
  apartments,
  onAddBill,
  onRemoveBill,
  onUpdateBill,
  onTriggerNotification,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [billingType, setBillingType] = useState<'Rental' | 'Sold'>('Rental');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Recording Payments
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque'>('Bank Transfer');

  // Calculations
  const totalInvoiced = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalCollected = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalOutstanding = bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const recoveryRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : '0';

  // Handle auto-prefilling from apartment choice
  const handleApartmentSelect = (aptId: string) => {
    setSelectedApartmentId(aptId);
    const apt = apartments.find(a => a.id === aptId);
    if (apt) {
      // Prefill tenant if rental, or buyer if sold
      setCustomerName(apt.tenantName || '');
      setBillingType(apt.status === 'Rented' ? 'Rental' : 'Sold');
      setAmount(apt.status === 'Rented' ? (apt.monthlyRent?.toString() || '') : (apt.price?.toString() || ''));
      setDescription(
        apt.status === 'Rented' 
          ? `Monthly rental charge for unit ${apt.unitNumber} at ${apt.buildingName}.` 
          : `Property sales milestone installment for unit ${apt.unitNumber} at ${apt.buildingName}.`
      );
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApartmentId || !customerName || !customerEmail || !amount || !dueDate) return;

    const apt = apartments.find(a => a.id === selectedApartmentId);
    if (!apt) return;

    const newBill: Bill = {
      id: `BIL-${Math.floor(500 + Math.random() * 500)}`,
      billNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      apartmentId: selectedApartmentId,
      buildingName: apt.buildingName,
      unitNumber: apt.unitNumber,
      propertyType: apt.type,
      billingType,
      customerName,
      customerEmail,
      amount: Number(amount),
      dueDate,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Unpaid',
      description,
    };

    onAddBill(newBill);
    onTriggerNotification(
      'Invoice Dispatched',
      `Invoice ${newBill.billNumber} for $${Number(amount).toLocaleString()} raised against "${customerName}" is now active.`,
      'success'
    );

    // Reset states
    setShowAddForm(false);
    setSelectedApartmentId('');
    setCustomerName('');
    setCustomerEmail('');
    setAmount('');
    setBillingType('Rental');
    setDueDate('');
    setDescription('');
  };

  const handleConfirmPayment = (billId: string) => {
    onUpdateBill(billId, {
      status: 'Paid',
      paymentMethod,
    });
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      onTriggerNotification(
        'Payment Verified',
        `Successfully received payment of $${bill.amount.toLocaleString()} for Invoice ${bill.billNumber} via ${paymentMethod}.`,
        'success'
      );
    }
    setActivePaymentId(null);
  };

  const handleSimulateReminder = (bill: Bill) => {
    onTriggerNotification(
      'E-Reminder Sent',
      `Notification sent to customer ${bill.customerName} (${bill.customerEmail}) regarding pending Invoice ${bill.billNumber}.`,
      'info'
    );
  };

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || b.billingType === filterType;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Invoiced</span>
            <h3 className="text-2xl font-mono font-bold text-white mt-1">
              ${totalInvoiced.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Aggregated billing ledger</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Realized Revenue</span>
            <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              ${totalCollected.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Paid invoices collected</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Outstanding Receivables</span>
            <h3 className="text-2xl font-mono font-bold text-amber-500 mt-1">
              ${totalOutstanding.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Pending + Overdue balances</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] p-5 rounded-lg border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Recovery Efficiency</span>
            <h3 className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              {recoveryRate}%
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Collection performance score</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/30 border border-cyan-900/50 flex items-center justify-center text-cyan-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-[#111114] border border-zinc-800 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 bg-[#141417] border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by customer, invoice #, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-800 rounded-lg bg-zinc-950 text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Invoice</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-zinc-950/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Billing Category</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs border border-zinc-800 p-1.5 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Properties (Rentals & Sales)</option>
              <option value="Rental">Rentals / Leases Only</option>
              <option value="Sold">Outright Sales / Installments</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Invoice Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs border border-zinc-800 p-1.5 rounded bg-zinc-900 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Invoices</option>
              <option value="Paid">✅ Paid</option>
              <option value="Unpaid">⏳ Unpaid</option>
              <option value="Overdue">🚨 Overdue</option>
            </select>
          </div>
        </div>

        {/* Invoice Raising Form */}
        {showAddForm && (
          <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-zinc-400" /> Raise New Property Invoice
              </h4>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Property Unit *</label>
                <select
                  required
                  value={selectedApartmentId}
                  onChange={(e) => handleApartmentSelect(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value="">-- Select Linked Apartment/Villa --</option>
                  {apartments.map(apt => (
                    <option key={apt.id} value={apt.id}>
                      {apt.buildingName} - {apt.unitNumber} ({apt.status} - {apt.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Billing Type</label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as any)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                >
                  <option value="Rental">Rental / Lease</option>
                  <option value="Sold">Sold Property Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Customer / Tenant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Customer Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. eleanor@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1800"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Invoice Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Rent for Unit 1204 - June Period"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-zinc-800 p-2 rounded bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all uppercase tracking-wider font-mono"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoice Grid/List */}
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No property bills found matching this query.</p>
            <p className="text-xs mt-1">Try resetting filters or adding new property contracts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-[#151518]/60">
                  <th className="p-4">Invoice details</th>
                  <th className="p-4">Linked Asset / Unit</th>
                  <th className="p-4">Invoiced Customer</th>
                  <th className="p-4 text-right">Bill Amount</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Status & Method</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredBills.map((b) => {
                  return (
                    <tr key={b.id} className="hover:bg-zinc-900/30 transition-colors text-xs">
                      {/* Invoice ID/Num */}
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded ${b.status === 'Paid' ? 'bg-emerald-950/20 text-emerald-500' : b.status === 'Overdue' ? 'bg-rose-950/20 text-rose-500' : 'bg-zinc-850 text-zinc-400'}`}>
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-200 block">{b.billNumber}</span>
                            <span className="text-[9px] font-mono text-zinc-500 block">{b.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Property Detail */}
                      <td className="p-4">
                        <span className="font-semibold text-zinc-300 block">{b.buildingName}</span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Home className="w-3 h-3 text-zinc-600" /> {b.unitNumber} ({b.propertyType})
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="p-4">
                        <span className="font-bold text-zinc-200 block flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-500" /> {b.customerName}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate max-w-[150px]">{b.customerEmail}</span>
                      </td>

                      {/* Bill Amount */}
                      <td className="p-4 text-right font-mono font-bold text-white">
                        <span className="block">${b.amount.toLocaleString()}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${
                          b.billingType === 'Rental' 
                            ? 'bg-purple-950/20 border-purple-950 text-purple-400' 
                            : 'bg-cyan-950/20 border-cyan-950 text-cyan-400'
                        }`}>
                          {b.billingType}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="p-4 text-zinc-400">
                        <div className="space-y-0.5 text-[11px]">
                          <div>Issued: <span className="font-mono text-zinc-500">{b.issuedDate}</span></div>
                          <div>Due: <span className="font-mono text-zinc-300">{b.dueDate}</span></div>
                        </div>
                      </td>

                      {/* Status / Method */}
                      <td className="p-4">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase inline-block ${
                            b.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                            b.status === 'Overdue' ? 'bg-rose-950 text-rose-400 border border-rose-900/50' :
                            'bg-amber-950 text-amber-500 border border-amber-900/50'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        {b.status === 'Paid' && b.paymentMethod && (
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                            <CreditCard className="w-3 h-3 text-zinc-600" /> {b.paymentMethod}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status !== 'Paid' && (
                            <>
                              {activePaymentId === b.id ? (
                                <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded border border-zinc-850 animate-fade-in text-left">
                                  <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-300 p-1 rounded focus:outline-none"
                                  >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                  </select>
                                  <button
                                    onClick={() => handleConfirmPayment(b.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => setActivePaymentId(null)}
                                    className="text-zinc-500 hover:text-white cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setActivePaymentId(b.id);
                                    }}
                                    className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-950 text-emerald-400 rounded text-[10px] font-bold cursor-pointer"
                                    title="Verify & record invoice payment"
                                  >
                                    Verify Payment
                                  </button>
                                  <button
                                    onClick={() => {
                                      onUpdateBill(b.id, { status: 'Overdue' });
                                      onTriggerNotification('Bill Overdue', `Bill ${b.billNumber} has been categorized as Overdue.`, 'warning');
                                    }}
                                    className="px-2 py-1 bg-rose-600/5 hover:bg-rose-600/15 border border-rose-950/40 text-rose-400 rounded text-[10px] font-medium cursor-pointer"
                                    title="Mark invoice as overdue"
                                  >
                                    Mark Overdue
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => handleSimulateReminder(b)}
                            className="p-1 border border-zinc-850 hover:bg-[#151518] text-zinc-400 hover:text-white rounded cursor-pointer"
                            title="Email payment alert reminder to customer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deregister property invoice ${b.billNumber}?`)) {
                                onRemoveBill(b.id);
                                onTriggerNotification('Invoice Dropped', `Invoice ${b.billNumber} was dropped from registry records.`, 'alert');
                              }
                            }}
                            className="p-1 text-zinc-600 hover:text-rose-500 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-950/30 cursor-pointer transition-all"
                            title="Drop invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
