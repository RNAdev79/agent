import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { orchestrateTravelPlan } from './lib/services/planOrchestrator';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SmartTravel AI',
      timestamp: new Date().toISOString(),
    });
  });

  // Master Orchestration endpoint
  app.post('/api/plan', async (req, res) => {
    try {
      console.log('Received /api/plan request:', req.body);
      const plan = await orchestrateTravelPlan(req.body);
      res.json({ success: true, plan });
    } catch (err: any) {
      console.error('Server orchestrator error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal error in travel orchestrator',
      });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartTravel AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
