import app from "./app";
import { seedCmsData } from "@workspace/db/seed-cms";

// Warn if critical security env vars are missing in production
if (process.env.NODE_ENV === "production") {
  const missing = ["MAJLIS_ENCRYPTION_KEY", "DATABASE_URL"].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[SECURITY] Missing required production env vars: ${missing.join(", ")}`);
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await seedCmsData();
  } catch (err) {
    console.error("CMS seed error (non-fatal):", err);
  }
});
