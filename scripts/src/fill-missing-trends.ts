import { db, pollsTable, pollOptionsTable, pollSnapshotsTable } from "@workspace/db";
import { eq, sql, notInArray } from "drizzle-orm";

async function fillMissingTrends() {
  console.log("Filling missing trend snapshots for 0-vote polls...");

  const allPolls = await db.select().from(pollsTable);
  const allOptions = await db.select().from(pollOptionsTable);

  const existing = await db
    .selectDistinct({ pollId: pollSnapshotsTable.pollId })
    .from(pollSnapshotsTable);
  const existingIds = new Set(existing.map(r => r.pollId));

  const optionsByPoll = new Map<number, typeof allOptions>();
  for (const opt of allOptions) {
    if (!optionsByPoll.has(opt.pollId)) optionsByPoll.set(opt.pollId, []);
    optionsByPoll.get(opt.pollId)!.push(opt);
  }

  const WEEKS = 10;
  const now = new Date();
  const snapshots: Array<{
    pollId: number;
    optionId: number;
    snapshotDate: Date;
    percentage: number;
    voteCount: number;
  }> = [];

  const seeded = (seed: number) => {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };

  let skipped = 0;
  for (const poll of allPolls) {
    if (existingIds.has(poll.id)) { skipped++; continue; }

    const options = optionsByPoll.get(poll.id) ?? [];
    if (options.length < 2) continue;

    const totalVotes = options.reduce((s, o) => s + o.voteCount, 0);
    const equalPct = 100 / options.length;

    const finalPcts = totalVotes === 0
      ? options.map(() => equalPct)
      : options.map(o => (o.voteCount / totalVotes) * 100);

    const syntheticTotal = totalVotes === 0 ? 500 : totalVotes;

    for (let w = 0; w <= WEEKS; w++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (WEEKS - w) * 7);
      const t = w / WEEKS;

      options.forEach((opt, i) => {
        const base = equalPct + (finalPcts[i] - equalPct) * t;
        const noise = (seeded(poll.id * 100 + opt.id + w * 13) - 0.5) * 4 * (1 - t);
        const raw = Math.max(1, base + noise);
        snapshots.push({
          pollId: poll.id,
          optionId: opt.id,
          snapshotDate: date,
          percentage: Math.round(raw * 10) / 10,
          voteCount: Math.round((raw / 100) * syntheticTotal),
        });
      });
    }
  }

  console.log(`Already have snapshots for ${skipped} polls. Generating for ${snapshots.length / (WEEKS + 1)} more polls...`);

  if (snapshots.length === 0) {
    console.log("All polls already have snapshots. Nothing to do.");
    process.exit(0);
  }

  const BATCH = 500;
  for (let i = 0; i < snapshots.length; i += BATCH) {
    await db.insert(pollSnapshotsTable).values(snapshots.slice(i, i + BATCH));
  }

  console.log(`Inserted ${snapshots.length} additional snapshots.`);
  process.exit(0);
}

fillMissingTrends().catch(e => { console.error(e); process.exit(1); });
