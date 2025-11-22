import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { parse as parseUrl } from 'node:url';
import { generateIncidentReport } from '../src/services/reportGenerator';
import type { IncidentData, ReportResult } from '../src/types';

const PORT = Number(process.env.local || process.env.PORT || 8788);
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const setCorsHeaders = (res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const respondJson = (res: ServerResponse, status: number, payload: unknown) => {
  setCorsHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const readRequestBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const server = createServer(async (req, res) => {
  const url = parseUrl(req.url || '', true);
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST' || url.pathname !== '/api/incident-report') {
    respondJson(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const incident = JSON.parse(rawBody || '{}') as IncidentData;

    if (!incident || typeof incident !== 'object') {
      respondJson(res, 400, { error: 'Invalid incident payload' });
      return;
    }

    const report: ReportResult = await generateIncidentReport(incident);
    respondJson(res, 200, report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    respondJson(res, 500, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`OpenAI proxy listening on http://${HOST}:${PORT}/api/incident-report`);
});
