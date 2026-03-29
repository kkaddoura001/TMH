const API = "http://localhost:8080/api/cms";
let token = "";
let passed = 0;
let failed = 0;
const failures: string[] = [];

async function req(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["x-cms-token"] = token;
  if (options.body && typeof options.body === "string") headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, { ...options, headers });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await (res.json() as Promise<any>).catch(() => null);
  return { status: res.status, data };
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e: unknown) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name} — ${msg}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

async function run() {
  console.log("=== CMS E2E Test Suite ===\n");

  section("Authentication");
  await test("login with valid credentials", async () => {
    const { status, data } = await req("/auth/login", { method: "POST", body: JSON.stringify({ username: "admin", pin: "1234" }) });
    assert(status === 200, `expected 200, got ${status}`);
    assert(!!data.token, "no token returned");
    token = data.token;
  });
  await test("reject invalid credentials", async () => {
    const { status } = await req("/auth/login", { method: "POST", body: JSON.stringify({ username: "admin", pin: "wrong" }) });
    assert(status === 401, `expected 401, got ${status}`);
  });
  await test("verify valid token", async () => {
    const { status } = await req("/auth/verify", { method: "POST" });
    assert(status === 200, `expected 200, got ${status}`);
  });

  section("Dashboard Stats");
  await test("returns stats for all content types", async () => {
    const { data } = await req("/stats");
    assert(data.debates.total > 0, "no debates");
    assert(data.predictions.total > 0, "no predictions");
    assert(data.voices.total > 0, "no voices");
    assert(Array.isArray(data.recentActivity), "no activity");
  });

  section("Taxonomy");
  await test("returns all taxonomy options", async () => {
    const { data } = await req("/taxonomy");
    assert(data.debateCategories.length > 5, `only ${data.debateCategories.length} debate categories`);
    assert(data.predictionCategories.length > 5, `only ${data.predictionCategories.length} prediction categories`);
    assert(data.tags.length > 10, `only ${data.tags.length} tags`);
    assert(data.sectors.length > 5, `only ${data.sectors.length} sectors`);
    assert(data.countries.length > 5, `only ${data.countries.length} countries`);
    assert(data.cities.length > 5, `only ${data.cities.length} cities`);
  });
  await test("includes known values", async () => {
    const { data } = await req("/taxonomy");
    assert(data.debateCategories.includes("Technology & AI"), "missing Technology & AI");
    assert(data.countries.includes("Saudi Arabia"), "missing Saudi Arabia");
    assert(data.sectors.includes("Finance"), "missing Finance");
    assert(data.tags.includes("ai"), "missing ai tag");
  });

  section("Debates CRUD");
  await test("list debates", async () => {
    const { data } = await req("/debates");
    assert(data.items.length > 0, "empty list");
    assert(!!data.items[0].question, "no question field");
    assert(!!data.items[0].category, "no category field");
    assert(Array.isArray(data.items[0].tags), "no tags array");
  });
  await test("filter by status", async () => {
    const { data } = await req("/debates?status=approved");
    data.items.forEach((d: { editorialStatus: string }) => {
      assert(d.editorialStatus === "approved", `got status ${d.editorialStatus}`);
    });
  });
  await test("get single debate", async () => {
    const { data } = await req("/debates/1");
    assert(data.id === 1, "wrong id");
    assert(!!data.question, "no question");
    assert(Array.isArray(data.options), "no options");
  });
  await test("update debate", async () => {
    const { data: orig } = await req("/debates/1");
    const { status } = await req("/debates/1", { method: "PUT", body: JSON.stringify({ ...orig, context: "E2E updated context" }) });
    assert(status === 200, `update failed: ${status}`);
    const { data: updated } = await req("/debates/1");
    assert(updated.context === "E2E updated context", "context not updated");
    await req("/debates/1", { method: "PUT", body: JSON.stringify({ context: orig.context }) });
  });

  section("Predictions CRUD");
  await test("list predictions", async () => {
    const { data } = await req("/predictions");
    assert(data.items.length > 0, "empty list");
    assert(typeof data.items[0].yesPercentage === "number", "no yesPercentage");
  });
  await test("get single prediction", async () => {
    const { data } = await req("/predictions/1");
    assert(data.id === 1, "wrong id");
    assert(Array.isArray(data.tags), "no tags");
  });
  await test("update prediction", async () => {
    const { data: orig } = await req("/predictions/1");
    const { status } = await req("/predictions/1", { method: "PUT", body: JSON.stringify({ yesPercentage: 55, noPercentage: 45 }) });
    assert(status === 200, `update failed: ${status}`);
    const { data: updated } = await req("/predictions/1");
    assert(updated.yesPercentage === 55, `expected 55, got ${updated.yesPercentage}`);
    await req("/predictions/1", { method: "PUT", body: JSON.stringify({ yesPercentage: orig.yesPercentage, noPercentage: orig.noPercentage }) });
  });

  section("Voices CRUD");
  await test("list voices", async () => {
    const { data } = await req("/voices");
    assert(data.items.length > 0, "empty list");
    assert(!!data.items[0].name, "no name");
    assert(!!data.items[0].sector, "no sector");
    assert(!!data.items[0].country, "no country");
  });
  await test("get single voice", async () => {
    const { data } = await req("/voices/1");
    assert(data.id === 1, "wrong id");
    assert(Array.isArray(data.lessonsLearned), "no lessonsLearned");
  });
  await test("update voice", async () => {
    const { data: orig } = await req("/voices/1");
    const { status } = await req("/voices/1", { method: "PUT", body: JSON.stringify({ headline: "E2E updated headline" }) });
    assert(status === 200, `update failed: ${status}`);
    const { data: updated } = await req("/voices/1");
    assert(updated.headline === "E2E updated headline", `expected updated headline, got ${updated.headline}`);
    await req("/voices/1", { method: "PUT", body: JSON.stringify({ headline: orig.headline }) });
  });

  section("JSON Bulk Upload — Debates");
  await test("upload single debate", async () => {
    const { data: before } = await req("/debates");
    const { status, data } = await req("/upload/debates", {
      method: "POST",
      body: JSON.stringify({ items: [{
        question: "E2E: Will hydrogen replace oil in MENA by 2040?",
        context: "Green hydrogen projects are ramping up across the Gulf",
        category: "Energy", categorySlug: "energy",
        tags: ["hydrogen", "energy", "e2e-test"],
        pollType: "binary", options: ["Yes", "No"], isFeatured: false,
      }] }),
    });
    assert(status === 200, `upload failed: ${status}`);
    assert(data.created === 1, `created ${data.created}`);
    const { data: after } = await req("/debates");
    assert(after.items.length === before.items.length + 1, "count mismatch");
    const found = after.items.find((d: { question: string }) => d.question.includes("E2E: Will hydrogen"));
    assert(!!found, "imported item not found");
    assert(found.tags.includes("hydrogen"), "tag missing");
    assert(found.editorialStatus === "draft", `status is ${found.editorialStatus}`);
  });
  await test("upload multiple debates", async () => {
    const { status, data } = await req("/upload/debates", {
      method: "POST",
      body: JSON.stringify({ items: [
        { question: "Batch 1: Is Dubai overbuilt?", category: "Real Estate", categorySlug: "real-estate", tags: ["batch"], pollType: "binary", options: ["Yes", "No"] },
        { question: "Batch 2: Egypt's new capital?", category: "Megaprojects", categorySlug: "megaprojects", tags: ["batch"], pollType: "binary", options: ["Yes", "No"] },
      ] }),
    });
    assert(status === 200, `failed: ${status}`);
    assert(data.created === 2, `created ${data.created}`);
  });

  section("JSON Bulk Upload — Predictions");
  await test("upload prediction", async () => {
    const { data: before } = await req("/predictions");
    const { status, data } = await req("/upload/predictions", {
      method: "POST",
      body: JSON.stringify({ items: [{
        question: "E2E: Will Aramco exceed $3T by 2028?",
        category: "Markets", categorySlug: "markets",
        resolvesAt: "2028-12-31", yesPercentage: 40, noPercentage: 60,
        momentum: 2.1, momentumDirection: "up", trendData: [35, 37, 38, 40],
        tags: ["aramco", "e2e-test"],
      }] }),
    });
    assert(status === 200, `failed: ${status}`);
    assert(data.created === 1, `created ${data.created}`);
    const { data: after } = await req("/predictions");
    assert(after.items.length === before.items.length + 1, "count mismatch");
    const found = after.items.find((p: { question: string }) => p.question.includes("E2E: Will Aramco"));
    assert(!!found, "imported not found");
    assert(found.yesPercentage === 40, `yesPercentage is ${found.yesPercentage}`);
  });

  section("JSON Bulk Upload — Voices");
  await test("upload voice", async () => {
    const { data: before } = await req("/voices");
    const { status, data } = await req("/upload/voices", {
      method: "POST",
      body: JSON.stringify({ items: [{
        name: "E2E Test Voice", headline: "Testing CMS upload",
        role: "QA Engineer", company: "TestCorp",
        sector: "Technology", country: "UAE", city: "Dubai",
        summary: "A test voice for E2E.", story: "Created by E2E tests.",
        lessonsLearned: ["Always test", "Automate everything"],
        quote: "If it's not tested, it's broken.",
      }] }),
    });
    assert(status === 200, `failed: ${status}`);
    assert(data.created === 1, `created ${data.created}`);
    const { data: after } = await req("/voices");
    assert(after.items.length === before.items.length + 1, "count mismatch");
    const found = after.items.find((v: { name: string }) => v.name === "E2E Test Voice");
    assert(!!found, "imported not found");
    assert(found.lessonsLearned.length === 2, "lessons missing");
    assert(found.editorialStatus === "draft", `status is ${found.editorialStatus}`);
  });

  section("Upload Error Handling");
  await test("reject upload without items array", async () => {
    const { status } = await req("/upload/debates", { method: "POST", body: JSON.stringify({ notItems: [] }) });
    assert(status === 400, `expected 400, got ${status}`);
  });
  await test("reject upload with empty items", async () => {
    const { data: before } = await req("/debates");
    const { status, data } = await req("/upload/debates", { method: "POST", body: JSON.stringify({ items: [] }) });
    assert(status === 200, `expected 200, got ${status}`);
    assert(data.created === 0, `created ${data.created}`);
    const { data: after } = await req("/debates");
    assert(after.items.length === before.items.length, "count changed");
  });
  await test("reject upload with invalid type", async () => {
    const { status } = await req("/upload/invalid", { method: "POST", body: JSON.stringify({ items: [{ question: "test" }] }) });
    assert(status === 400, `expected 400, got ${status}`);
  });
  await test("reject unauthenticated upload", async () => {
    const savedToken = token;
    token = "";
    const { status } = await req("/upload/debates", { method: "POST", body: JSON.stringify({ items: [{ question: "test" }] }) });
    assert(status === 401, `expected 401, got ${status}`);
    token = savedToken;
  });

  section("Status Transitions");
  await test("transition draft → in_review → approved", async () => {
    const { data: list } = await req("/debates");
    const draft = list.items.find((d: { editorialStatus: string }) => d.editorialStatus === "draft");
    if (!draft) { console.log("    (skipped — no drafts)"); return; }
    const { status: s1 } = await req(`/debates/${draft.id}/status`, { method: "POST", body: JSON.stringify({ action: "review" }) });
    assert(s1 === 200, `review failed: ${s1}`);
    const { data: d1 } = await req(`/debates/${draft.id}`);
    assert(d1.editorialStatus === "in_review", `expected in_review, got ${d1.editorialStatus}`);
    const { status: s2 } = await req(`/debates/${draft.id}/status`, { method: "POST", body: JSON.stringify({ action: "approve" }) });
    assert(s2 === 200, `approve failed: ${s2}`);
    const { data: d2 } = await req(`/debates/${draft.id}`);
    assert(d2.editorialStatus === "approved", `expected approved, got ${d2.editorialStatus}`);
  });

  section("Bulk Actions");
  await test("bulk delete", async () => {
    const { data: list } = await req("/debates");
    const batchItems = list.items.filter((d: { question: string }) => d.question.includes("Batch"));
    if (batchItems.length === 0) { console.log("    (skipped — no batch items)"); return; }
    const ids = batchItems.map((d: { id: number }) => d.id);
    const { status } = await req("/debates/bulk-action", { method: "POST", body: JSON.stringify({ ids, action: "delete" }) });
    assert(status === 200, `failed: ${status}`);
    const { data: after } = await req("/debates");
    const remaining = after.items.filter((d: { question: string }) => d.question.includes("Batch"));
    assert(remaining.length === 0, `${remaining.length} batch items still exist`);
  });

  section("Homepage");
  await test("get homepage config", async () => {
    const { data } = await req("/homepage");
    assert(!!data.masthead, "no masthead");
    assert(!!data.masthead.title, "no title");
    assert(data.sections.length > 0, "no sections");
    assert(data.banners.length > 0, "no banners");
    assert(!!data.newsletter, "no newsletter");
    assert(!!data.ticker, "no ticker");
  });
  await test("update homepage", async () => {
    const { data: orig } = await req("/homepage");
    const { status } = await req("/homepage", { method: "PUT", body: JSON.stringify({ ...orig, masthead: { ...orig.masthead, title: "E2E Title" } }) });
    assert(status === 200, `failed: ${status}`);
    const { data: check } = await req("/homepage");
    assert(check.masthead.title === "E2E Title", "title not updated");
    await req("/homepage", { method: "PUT", body: JSON.stringify({ ...check, masthead: { ...check.masthead, title: orig.masthead.title } }) });
  });
  await test("add and remove banner", async () => {
    const { status: s1, data } = await req("/homepage/banners", { method: "POST", body: JSON.stringify({ title: "E2E Banner", subtitle: "Test", ctaText: "Click", ctaLink: "/test", bgColor: "#FF0000", textColor: "#FFFFFF", enabled: true, position: "top" }) });
    assert(s1 === 200, `add failed: ${s1}`);
    assert(!!data.banner.id, "no banner id");
    const { status: s2 } = await req(`/homepage/banners/${data.banner.id}`, { method: "DELETE" });
    assert(s2 === 200, `delete failed: ${s2}`);
  });

  section("Delete Operations");
  await test("delete a debate", async () => {
    const { data: list } = await req("/debates");
    const e2eItem = list.items.find((d: { question: string }) => d.question.includes("E2E:"));
    if (!e2eItem) { console.log("    (skipped — no E2E items)"); return; }
    const { status } = await req(`/debates/${e2eItem.id}`, { method: "DELETE" });
    assert(status === 200, `delete failed: ${status}`);
    const { status: s2 } = await req(`/debates/${e2eItem.id}`);
    assert(s2 === 404, `expected 404, got ${s2}`);
  });

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach(f => console.log(`  • ${f}`));
  }
  console.log(`${"=".repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error("Test runner error:", e); process.exit(1); });
