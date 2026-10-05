/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());


  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'express-vite-saas' });
  });

  app.get('/api/database/status', (req, res) => {
    const hasSupabaseUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    const hasSupabaseKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    const hasPostgresUrl = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

    res.json({
      configured: (hasSupabaseUrl && hasSupabaseKey) || hasPostgresUrl,
      supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      hasAnonKey: hasSupabaseKey,
      hasPostgresUrl,
      dbEngine: hasPostgresUrl || (hasSupabaseUrl && hasSupabaseKey) ? 'Supabase PostgreSQL' : 'Local Offline Memory',
    });
  });

  app.post('/api/database/test', async (req, res) => {
    const { supabaseUrl, supabaseKey, postgresUri } = req.body;
    const targetPostgresUri = postgresUri || process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const targetSupabaseUrl = supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const targetSupabaseKey = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (targetPostgresUri && !targetPostgresUri.includes('*******')) {
      try {
        const { Pool } = await import('pg');
        const pool = new Pool({
          connectionString: targetPostgresUri,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });

        const client = await pool.connect();
        const dbRes = await client.query('SELECT version(), current_database(), current_user;');
        
        // Check existing tables
        const tablesRes = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `);
        
        client.release();
        await pool.end();

        return res.json({
          connected: true,
          type: 'postgres-direct',
          version: dbRes.rows[0]?.version?.split(' on ')[0] || 'PostgreSQL (Supabase Pooler)',
          database: dbRes.rows[0]?.current_database,
          user: dbRes.rows[0]?.current_user,
          tables: tablesRes.rows.map((r: any) => r.table_name),
          ok: 1,
        });
      } catch (e: any) {
        console.error('PostgreSQL testing probe failed:', e);
        return res.status(500).json({
          connected: false,
          type: 'postgres-direct',
          error: e.message || 'Unable to connect to PostgreSQL instance via connection string.',
        });
      }
    }

    // 2. Supabase REST API connection test
    if (targetSupabaseUrl && targetSupabaseKey && !targetSupabaseUrl.includes('placeholder')) {
      try {
        const cleanedUrl = targetSupabaseUrl.replace(/\/+$/, '');
        // Probe Supabase REST endpoint
        const testRes = await fetch(`${cleanedUrl}/rest/v1/?apikey=${targetSupabaseKey}`, {
          method: 'GET',
          headers: {
            'apikey': targetSupabaseKey,
            'Authorization': `Bearer ${targetSupabaseKey}`,
          },
        });

        if (testRes.ok || testRes.status === 200 || testRes.status === 404) {
          return res.json({
            connected: true,
            type: 'supabase-rest',
            version: 'PostgreSQL 15 (Supabase Cloud API)',
            url: cleanedUrl,
            ok: 1,
          });
        } else {
          const errText = await testRes.text();
          return res.status(400).json({
            connected: false,
            type: 'supabase-rest',
            error: `Supabase returned HTTP ${testRes.status}: ${errText.slice(0, 150)}`,
          });
        }
      } catch (e: any) {
        console.error('Supabase REST probe failed:', e);
        return res.status(500).json({
          connected: false,
          type: 'supabase-rest',
          error: e.message || 'Unable to reach Supabase API endpoint. Verify your Supabase URL and network.',
        });
      }
    }

    return res.status(400).json({
      connected: false,
      error: 'Please provide either a PostgreSQL Connection URI (DATABASE_URL) or Supabase Project URL & Anon/Service Key.',
    });
  });

  // Backwards compatibility alias for previous endpoint
  app.post('/api/supabase/test', (req, res) => {
    res.redirect(307, '/api/database/test');
  });

  app.post('/api/mongodb/test', (req, res) => {
    res.status(200).json({
      connected: false,
      message: 'MongoDB has been transitioned to Supabase PostgreSQL. Please use /api/database/test.',
    });
  });

  // Vite middleware integration for dynamic Hot Module Replacement/Bundle execution
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[SaaS Server] Vite dev middleware attached successfully.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[SaaS Server] Serving production static files from dist/');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`[SaaS Server] Running and ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
