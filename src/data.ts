/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Employee, Asset, Expense, Apartment, Material, Vendor, SystemNotification, Bill, SaasTenant, MaintenanceTicket, Bid, Tender, ProjectMilestone, GanttTask } from './types';

export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_ASSETS: Asset[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_APARTMENTS: Apartment[] = [];
export const INITIAL_MATERIALS: Material[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
export const INITIAL_BILLS: Bill[] = [];
export const INITIAL_SAAS_TENANTS: SaasTenant[] = [];
export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [];
export const INITIAL_TENDERS: Tender[] = [];
export const INITIAL_PROJECT_MILESTONES: ProjectMilestone[] = [];
export const INITIAL_GANTT_TASKS: GanttTask[] = [];

// LocalStorage helpers
export const loadData = <T>(key: string, initial: T): T => {
  try {
    const saved = localStorage.getItem(`re_ms_${key}`);
    return saved ? JSON.parse(saved) : initial;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return initial;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`re_ms_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};
