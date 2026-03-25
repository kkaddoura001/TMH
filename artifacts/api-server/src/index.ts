import app from "./app";
import { seedCmsData } from "@workspace/db/seed-cms";

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
