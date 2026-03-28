import express, { type Request, type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { ogTagsMiddleware } from "./middlewares/ogTags";

const app: Express = express();

// ── Domain configuration ────────────────────────────────────
// In production, tribunal.com serves the main site and
// cms.tribunal.com serves the CMS admin panel.
// Both domains point to this single Railway service.

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://tribunal.com",
        "https://www.tribunal.com",
        "https://cms.tribunal.com",
      ]
    : true; // allow all origins in development

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Hostname routing helper ─────────────────────────────────
// Matches "cms.*" subdomain pattern (works with any root domain).

function isCmsHost(req: Request): boolean {
  return req.hostname.startsWith("cms.");
}

// ── Pre-built static middleware instances ────────────────────

const cmsStatic = express.static(
  path.join(process.cwd(), "artifacts/cms/dist/public"),
);
const platformStatic = express.static(
  path.join(process.cwd(), "artifacts/tmh-platform/dist/public"),
);

// ── Bot-detection OG middleware ──────────────────────────────
// Intercepts social crawler requests to SPA routes and returns
// pre-rendered OG meta HTML. Only applies to non-API, non-CMS routes.
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || isCmsHost(req)) return next();
  return ogTagsMiddleware(req, res, next);
});

// ── API routes ──────────────────────────────────────────────

app.use("/api", router);

app.get("/download/tmh-platform.html", (_req, res) => {
  res.download(
    path.join(process.cwd(), "artifacts/tmh-platform/public/tmh-platform-standalone.html"),
    "tmh-platform.html",
  );
});

// ── Static files — routed by hostname ───────────────────────
// cms.tribunal.com  → CMS SPA at root /
// tribunal.com      → TMH Platform SPA at root /
// Fallback: /cms path still works for the Railway test domain.

app.use("/cms", cmsStatic);

app.use((req, res, next) => {
  if (isCmsHost(req)) return cmsStatic(req, res, next);
  return platformStatic(req, res, next);
});

// ── SPA fallbacks ───────────────────────────────────────────

app.use("/cms", (_req, res) => {
  res.sendFile(
    path.join(process.cwd(), "artifacts/cms/dist/public/index.html"),
  );
});

app.use((req, res) => {
  const dir = isCmsHost(req) ? "cms" : "tmh-platform";
  res.sendFile(
    path.join(process.cwd(), `artifacts/${dir}/dist/public/index.html`),
  );
});

export default app;
