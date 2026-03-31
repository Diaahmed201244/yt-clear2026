/**
 * app.js
 *
 * Express application factory. This module creates and configures the Express
 * app — middleware, routes, error handling — and exports it so that server.js
 * can attach it to an HTTP server independently.
 *
 * Middleware order (important):
 *   1. CORS + preflight
 *   2. Cookie parser
 *   3. Request logging
 *   4. Spam-prevention / rate limiting
 *   5. CSRF token issuer
 *   6. Body parsers (JSON + URL-encoded)
 *   7. API routes
 *   8. Static file serving  ← must be last so API routes take priority
 *   9. Global error handler ← must be the very last `app.use`
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Config
import corsOptions from './config/cors.js';

// Middleware
import { requestLogger } from './middleware/logging.js';
import { spamPrevention, apiLimiter } from './middleware/rate-limit.js';
import { csrfTokenIssuer, csrfProtection } from './middleware/csrf.js';
import { expressErrorHandler } from './middleware/error-handler.js';

// Route modules
import authRouter       from './routes/auth.routes.js';
import balancesRouter   from './routes/balances.routes.js';
import codesRouter      from './routes/codes.routes.js';
import syncRouter       from './routes/sync.routes.js';
import transferRouter   from './routes/transfer.routes.js';
import qarsanRouter     from './routes/qarsan.routes.js';
import watchdogRouter   from './routes/watchdog.routes.js';
import adminRouter      from './routes/admin.routes.js';
import eventsRouter     from './routes/events.routes.js';
import countryRouter    from './routes/country.routes.js';
import flagsRouter      from './routes/flags.routes.js';
import diagnosticRouter from './routes/diagnostic.routes.js';
import samma3nyRouter   from './routes/samma3ny.routes.js';
import farragnaRouter   from './routes/farragna.routes.js';
import screenshotRouter from './routes/screenshot.routes.js';
import nostagiaRouter   from './routes/nostaglia.routes.js';
import { setupStaticRoutes } from './routes/static.routes.js';

// ---------------------------------------------------------------------------
// Create and configure the Express application
// ---------------------------------------------------------------------------
const app = express();

// ---------------------------------------------------------------------------
// 1. Trust proxy — required when running behind a reverse proxy (Nginx, Ngrok)
//    so that req.ip reflects the real client IP, not the proxy.
// ---------------------------------------------------------------------------
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 2. CORS — must come before any route handler
// ---------------------------------------------------------------------------
app.use(cors(corsOptions));
// Handle pre-flight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// ---------------------------------------------------------------------------
// 3. Cookie parser — required before session/CSRF middleware
// ---------------------------------------------------------------------------
app.use(cookieParser());

// ---------------------------------------------------------------------------
// 4. Request logging
// ---------------------------------------------------------------------------
app.use(requestLogger);

// ---------------------------------------------------------------------------
// 5. Spam prevention + general API rate limit
// ---------------------------------------------------------------------------
app.use(spamPrevention);
app.use('/api', apiLimiter);

// ---------------------------------------------------------------------------
// 6. CSRF — issue token first, then validate on unsafe methods
// ---------------------------------------------------------------------------
app.use(csrfTokenIssuer);
app.use(csrfProtection);

// ---------------------------------------------------------------------------
// 7. Body parsers
//    rawBody is captured for webhook signature verification (e.g. Cloudflare).
// ---------------------------------------------------------------------------
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// 8. API Routes — mounted under /api
// ---------------------------------------------------------------------------
const apiRouter = express.Router();

apiRouter.use('/auth',       authRouter);
apiRouter.use('/balances',   balancesRouter);
apiRouter.use('/codes',      codesRouter);
apiRouter.use('/sync',       syncRouter);
apiRouter.use('/transfer',   transferRouter);
apiRouter.use('/qarsan',     qarsanRouter);
apiRouter.use('/watchdog',   watchdogRouter);
apiRouter.use('/admin',      adminRouter);
apiRouter.use('/events',     eventsRouter);
apiRouter.use('/country',    countryRouter);
apiRouter.use('/flags',      flagsRouter);
apiRouter.use('/diagnostic', diagnosticRouter);

// Health / version meta-endpoints
apiRouter.get('/health',  (_req, res) => res.json({ ok: true }));
apiRouter.get('/version', (_req, res) =>
  res.json({ version: process.env.APP_VERSION || 'dev' })
);

app.use('/api', apiRouter);

// ---------------------------------------------------------------------------
// Sub-app routes mounted at their own prefixes
// ---------------------------------------------------------------------------

// Samma3ny — music streaming sub-app
app.use('/api/samma3ny', samma3nyRouter);

// Farragna — file/media management sub-app
app.use('/api/farragna', farragnaRouter);

// Screenshot service — NOT under /api; served at /screenshot
app.use('/screenshot', screenshotRouter);

// Nostaglia — serves the root SPA and its associated pages (mounted last so
// it doesn't intercept /api requests)
app.use('/', nostagiaRouter);

// ---------------------------------------------------------------------------
// 9. Static file serving — MUST come after all API routes
// ---------------------------------------------------------------------------
setupStaticRoutes(app);

// ---------------------------------------------------------------------------
// 10. Global Express error handler — MUST be the last middleware registered
// ---------------------------------------------------------------------------
app.use(expressErrorHandler);

export default app;
