/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'Admin' 
  | 'ProjectManager' 
  | 'HRManager' 
  | 'PropertyManager' 
  | 'FinancialOfficer'
  | 'Client'
  | 'SuperAdmin';

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'Planning' | 'Excavation' | 'Structure' | 'Finishing' | 'Completed';
  progress: number; // 0 to 100
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  manager: string;
  description: string;
  siteSupervisor: string;
  safetyRating: string; // e.g. "A+", "A"
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: 'Engineering' | 'HR' | 'Finance' | 'Property Sales' | 'Labor' | 'Operations';
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Contractor';
  salary: number;
  joiningDate: string;
  assignedProject?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Machinery' | 'Vehicle' | 'IT Equipment' | 'Construction Tool';
  status: 'Operational' | 'Under Maintenance' | 'Needs Repair' | 'Retired';
  value: number;
  purchaseDate: string;
  location: string;
  lastServiceDate: string;
  assignedProject?: string;
}

export interface Expense {
  id: string;
  category: 'Material' | 'Labor' | 'Marketing' | 'Equipment' | 'Permits' | 'Utilities';
  amount: number;
  date: string;
  description: string;
  projectName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Apartment {
  id: string;
  buildingName: string;
  unitNumber: string;
  type: string;
  status: 'Available' | 'Rented' | 'Sold' | 'Maintenance';
  price: number;
  areaSqFt: number;
  tenantName?: string;
  leaseStart?: string;
  leaseEnd?: string;
  monthlyRent?: number;
}

export interface SystemUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  initials: string;
  passwordDescription: string;
  colorClass: string;
}

export interface SystemNotification {
  id: string;
  tenantId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Material {
  id: string;
  name: string;
  category: 'Structural' | 'Finishing' | 'Plumbing' | 'Electrical' | 'Raw Materials';
  stock: number;
  unit: string;
  minStockLevel: number;
  unitPrice: number;
  supplierName: string;
  lastUpdated: string;
  location: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'Material Supplier' | 'Machinery Supplier' | 'Labour Contractor';
  contactPerson: string;
  phone: string;
  email: string;
  suppliedItems: string[];
  status: 'Active' | 'On Hold' | 'Contract Completed';
  rating: number; // 1 to 5
  activeContractsCount: number;
}export interface Bill {
  id: string;
  billNumber: string;
  apartmentId: string;
  buildingName: string;
  unitNumber: string;
  propertyType: string;
  billingType: 'Rental' | 'Sold';
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  issuedDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paymentMethod?: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque';
  description?: string;
}

export interface SaasTenant {
  id: string;
  companyName: string;
  adminName: string;
  adminEmail: string;
  subscriptionPlan: 'Basic' | 'Business';
  status: 'Active' | 'Suspended' | 'Pending' | 'Trial';
  purchaseAmount: number;
  purchaseDate: string;
  expiryDate: string;
  propertiesLimit: number;
  projectsLimit: number;
  contactPhone: string;
  notes?: string;
  billingCycle: 'Monthly' | 'Yearly' | 'Lifetime';
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  apartmentId: string;
  buildingName: string;
  unitNumber: string;
  tenantName: string;
  tenantEmail: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Structural' | 'Appliance' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  slaDeadline?: string; // Plan-Specific deadline (e.g. 24h for Business emergency, 72h for Basic)
  assignedStaff?: string;
  resolutionNotes?: string;
}

export interface Bid {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  deliveryDays: number;
  proposal: string;
  submittedAt: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Tender {
  id: string;
  title: string;
  projectName: string;
  description: string;
  category: string;
  budget: number;
  status: 'Open' | 'Under Review' | 'Awarded' | 'Closed';
  dueDate: string;
  bids: Bid[];
  awardedBidId?: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  phase: 'Planning' | 'Excavation' | 'Structure' | 'Finishing';
}

export interface GanttTask {
  id: string;
  projectId: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  dependencies?: string[];
  phase: 'Planning' | 'Excavation' | 'Structure' | 'Finishing';
}


