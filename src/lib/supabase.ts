/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables provided via Vercel or local .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Singleton Supabase Client instance (fallback safe)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Dynamic client generator for custom connection testing
export const getCustomSupabaseClient = (url: string, anonKey: string): SupabaseClient => {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
};

export interface DatabaseStatus {
  connected: boolean;
  type: 'supabase-rest' | 'postgres-direct' | 'offline-memory';
  url?: string;
  version?: string;
  latencyMs?: number;
  tables?: string[];
  error?: string;
}

/**
 * Tests connectivity to Supabase directly via the client or backend proxy
 */
export async function testConnection(customConfig?: {
  supabaseUrl?: string;
  supabaseKey?: string;
  postgresUri?: string;
}): Promise<DatabaseStatus> {
  const startTime = performance.now();

  try {
    const res = await fetch('/api/database/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseUrl: customConfig?.supabaseUrl || supabaseUrl,
        supabaseKey: customConfig?.supabaseKey || supabaseAnonKey,
        postgresUri: customConfig?.postgresUri,
      }),
    });

    const data = await res.json();
    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok && data.connected) {
      return {
        connected: true,
        type: data.type || 'supabase-rest',
        url: customConfig?.supabaseUrl || supabaseUrl,
        version: data.version || 'PostgreSQL 15 (Supabase Cloud)',
        latencyMs: data.latencyMs || latencyMs,
        tables: data.tables || ['projects', 'apartments', 'employees', 'assets', 'materials', 'bills'],
      };
    } else {
      return {
        connected: false,
        type: 'offline-memory',
        latencyMs,
        error: data.error || 'Failed to authenticate with Supabase PostgreSQL.',
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      type: 'offline-memory',
      error: err.message || 'Network error reaching backend database test proxy.',
    };
  }
}
